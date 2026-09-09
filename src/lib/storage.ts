import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from './firebase';
import imageCompression from 'browser-image-compression';

// ============================================================================
// FIREBASE STORAGE PHOTO UPLOAD HELPER
// Replaces Cloudinary as the primary photo store.
// Produces two variants client-side at upload time (Storage serves originals):
//   full  — max 1200px, JPEG q0.85 (profile detail view)
//   thumb — 600x800 center-crop, JPEG q0.8 (dashboard / match cards)
// Files live under users/{uid}/photos/ so cascade deletion can purge by prefix.
// ============================================================================

export interface UploadedPhotoPair {
  url: string;       // full-size variant
  thumbUrl: string;  // 600x800 crop for cards
  fullPath: string;
  thumbPath: string;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

async function getFileHash(file: File | Blob): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Center-crop an image source to a target WxH and return a JPEG blob. */
async function centerCropToBlob(
  src: CanvasImageSource,
  srcW: number,
  srcH: number,
  targetW: number,
  targetH: number
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported in this browser.');

  // Cover-crop: scale so the image fills the box, centered
  const scale = Math.max(targetW / srcW, targetH / srcH);
  const scaledW = srcW * scale;
  const scaledH = srcH * scale;
  const offsetX = (targetW - scaledW) / 2;
  const offsetY = (targetH - scaledH) / 2;

  ctx.drawImage(src, offsetX, offsetY, scaledW, scaledH);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to encode thumbnail.'))),
      'image/jpeg',
      0.8
    );
  });
}


async function loadImageElement(file: Blob): Promise<{ el: HTMLImageElement; w: number; h: number }> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const el = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to read image.'));
      img.src = objectUrl;
    });
    return { el, w: el.naturalWidth, h: el.naturalHeight };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function uploadUserPhotos(
  file: File,
  uid: string,
  kind: 'profile' | 'gallery' = 'profile'
): Promise<UploadedPhotoPair> {
  if (!uid) throw new Error('You must be signed in to upload photos.');
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error('Invalid file format. Please upload JPEG, PNG, or WEBP.');
  }
  if (file.size >= 10 * 1024 * 1024) {
    throw new Error('File size must be less than 10MB.');
  }

  // 1. Duplicate prevention (reuses the existing uploadedImages hash map).
  let fileHash = '';
  try {
    fileHash = await getFileHash(file);
    const dupSnap = await getDoc(doc(db, 'uploadedImages', fileHash));
    if (dupSnap.exists()) {
      const existing = dupSnap.data() as { url?: string; thumbUrl?: string };
      if (existing.url && existing.thumbUrl) {
        return { url: existing.url, thumbUrl: existing.thumbUrl, fullPath: '', thumbPath: '' };
      }
    }
  } catch (hashErr) {
    console.warn('[storage] Hash/duplicate check failed, continuing with upload:', hashErr);
  }

  // 2. Full variant — compressed, max 1200px
  let fullBlob: Blob;
  try {
    fullBlob = await imageCompression(file, {
      maxSizeMB: 0.45,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: 'image/jpeg'
    });
  } catch (err) {
    console.warn('[storage] Compression failed, uploading original:', err);
    fullBlob = file;
  }

  // 3. Thumb variant — 600x800 center-crop
  const { el: imgEl, w, h } = await loadImageElement(fullBlob);
  const thumbBlob = await centerCropToBlob(imgEl, w, h, 600, 800);

  // 4. Upload both under users/{uid}/photos/
  const stamp = Date.now();
  const fullPath = `users/${uid}/photos/${stamp}_${kind}_full.jpg`;
  const thumbPath = `users/${uid}/photos/${stamp}_${kind}_thumb.jpg`;

  const [url, thumbUrl] = await Promise.all([
    (async () => {
      const r = ref(storage, fullPath);
      await uploadBytes(r, fullBlob, { contentType: 'image/jpeg' });
      return getDownloadURL(r);
    })(),
    (async () => {
      const r = ref(storage, thumbPath);
      await uploadBytes(r, thumbBlob, { contentType: 'image/jpeg' });
      return getDownloadURL(r);
    })()
  ]);

  // 5. Record hash → pair for duplicate prevention on future uploads
  if (fileHash) {
    try {
      await setDoc(doc(db, 'uploadedImages', fileHash), {
        url,
        thumbUrl,
        uid,
        createdAt: serverTimestamp()
      });
    } catch (mapErr) {
      console.warn('[storage] Failed to record uploadedImages hash:', mapErr);
    }
  }

  return { url, thumbUrl, fullPath, thumbPath };
}

/**
 * Deletes a previously uploaded photo pair from Firebase Storage.
 * Tolerates legacy Cloudinary URLs (returns false so callers can fall back
 * to the Cloudinary deletion path).
 */
export async function deleteStoredPhoto(url?: string | null, thumbUrl?: string | null): Promise<boolean> {
  const isStorageUrl = (u: string) =>
    u.includes('firebasestorage.googleapis.com') || u.includes('appspot.com');

  let deleted = false;
  for (const candidate of [url, thumbUrl]) {
    if (!candidate || !isStorageUrl(candidate)) continue;
    try {
      await deleteObject(ref(storage, candidate));
      deleted = true;
    } catch (err: any) {
      // object-not-found is fine — already gone
      if (err?.code !== 'storage/object-not-found') {
        console.error('[storage] deleteObject failed:', err);
      } else {
        deleted = true;
      }
    }
  }
  return deleted;
}
