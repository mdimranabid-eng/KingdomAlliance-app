import imageCompression from 'browser-image-compression';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

/**
 * CLOUDINARY UPLOAD UTILITY WITH DUPLICATE PREVENTION
 * 
 * This helper sends images directly to Cloudinary using their REST API.
 * It uses 'unsigned' uploads and checks file hashes to prevent duplicates.
 */

/**
 * Calculates SHA-256 hash of a file to check for duplicates.
 */
export async function getFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function uploadToCloudinary(
  file: File, 
  cloudName: string, 
  uploadPreset: string,
  apiKey?: string
): Promise<string> {
  const finalCloudName = (cloudName || import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dvmx7w1a8").trim();
  const finalPreset = (uploadPreset || import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "kingdom_preset").trim();

  if (!finalCloudName || !finalPreset) {
    throw new Error("Cloudinary configuration missing. Check .env file.");
  }

  // 1. Calculate original file hash & check for duplicates in Firestore
  let fileHash = '';
  try {
    fileHash = await getFileHash(file);
    const dupDocRef = doc(db, 'uploadedImages', fileHash);
    const dupDocSnap = await getDoc(dupDocRef);
    if (dupDocSnap.exists()) {
      const existingData = dupDocSnap.data();
      console.log(`[Cloudinary] Duplicate found! Reusing existing URL for hash ${fileHash}`);
      return existingData.url;
    }
  } catch (hashError) {
    console.error('[Cloudinary] Failed to calculate hash or check duplicates:', hashError);
  }

  // 2. Compress image using browser-image-compression
  let fileToUpload = file;
  try {
    const options = {
      maxSizeMB: 3,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/webp'
    };
    const compressedFile = await imageCompression(file, options);
    const originalName = file.name || 'image';
    const dotIdx = originalName.lastIndexOf('.');
    const baseName = dotIdx !== -1 ? originalName.substring(0, dotIdx) : originalName;
    fileToUpload = new File([compressedFile], `${baseName}.webp`, { type: 'image/webp' });
  } catch (err) {
    console.error('[Cloudinary] Compression error, using original file:', err);
  }

  const formData = new FormData();
  formData.append('file', fileToUpload);
  formData.append('upload_preset', finalPreset);

  const MAX_RETRIES = 2;
  const TIMEOUT_MS = 30000; // 30 seconds

  let lastError: any = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      if (attempt > 0) {
        console.log(`[Cloudinary] Retry attempt ${attempt}...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${finalCloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
          mode: 'cors',
          credentials: 'omit',
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = "Failed to upload to Cloudinary";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorMessage;
        } catch (e) {
          errorMessage = `Status ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const secureUrl = data.secure_url;

      // 3. Save duplicate check metadata in Firestore
      if (fileHash) {
        try {
          const user = auth.currentUser;
          await setDoc(doc(db, 'uploadedImages', fileHash), {
            url: secureUrl,
            uploadedBy: user ? user.uid : 'anonymous',
            createdAt: new Date().toISOString()
          });
          console.log(`[Cloudinary] Saved new upload hash reference: ${fileHash}`);
        } catch (saveError) {
          console.error('[Cloudinary] Failed to save upload hash metadata:', saveError);
        }
      }

      return secureUrl;

    } catch (error: any) {
      clearTimeout(timeoutId);
      lastError = error;

      console.error(`[Cloudinary] Attempt ${attempt + 1} failed:`, error);

      if (error.name === 'AbortError') {
        lastError = new Error("Upload timed out after 30 seconds. Please check your connection speed.");
      } else if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        lastError = new Error("Upload failed — please check your internet connection and try again. This can also be caused by browser extensions (like AdBlock) blocking the upload.");
      }

      if (error.message.includes('Status 4') && !error.message.includes('408') && !error.message.includes('429')) {
        break;
      }
    }
  }

  throw lastError || new Error("Upload failed — please check your internet connection and try again");
}

/**
 * Extract public ID from a Cloudinary URL.
 * Matches both standard formats, with or without versions/transformations.
 */
export function extractPublicId(url: string): string | null {
  if (!url || !url.includes('cloudinary.com')) return null;
  
  try {
    const parts = url.split('/image/upload/');
    if (parts.length < 2) return null;
    
    const pathPart = parts[1];
    const pathSegments = pathPart.split('/');
    
    const cleanSegments = pathSegments.filter(seg => {
      const isVersion = /^v\d+$/.test(seg);
      const isTransformation = seg.includes('_') && seg.length < 20;
      return !isVersion && !isTransformation;
    });
    
    const fullIdWithExt = cleanSegments.join('/');
    const lastDotIdx = fullIdWithExt.lastIndexOf('.');
    if (lastDotIdx === -1) return fullIdWithExt;
    return fullIdWithExt.substring(0, lastDotIdx);
  } catch (e) {
    console.error("Error extracting public ID from Cloudinary URL:", e);
    return null;
  }
}

/**
 * Securely requests the backend to delete a Cloudinary photo.
 */
export async function secureDeletePhoto(url: string): Promise<boolean> {
  const BACKEND_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_BACKEND_URL || '');
  try {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) return false;
    const response = await fetch(`${BACKEND_URL}/api/user/delete-photo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ url })
    });
    return response.ok;
  } catch (error) {
    console.error('[Cloudinary] Failed to securely request photo deletion:', error);
    return false;
  }
}
