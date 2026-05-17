/**
 * CLOUDINARY UPLOAD UTILITY
 * 
 * This helper sends images directly to Cloudinary using their REST API.
 * It uses 'unsigned' uploads so we don't need a secret key on the frontend.
 */

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

  const formData = new FormData();
  formData.append('file', file);
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
        // Add a small delay before retry
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
      return data.secure_url;

    } catch (error: any) {
      clearTimeout(timeoutId);
      lastError = error;

      console.error(`[Cloudinary] Attempt ${attempt + 1} failed:`, error);

      if (error.name === 'AbortError') {
        lastError = new Error("Upload timed out after 30 seconds. Please check your connection speed.");
      } else if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        lastError = new Error("Upload failed — please check your internet connection and try again. This can also be caused by browser extensions (like AdBlock) blocking the upload.");
      }

      // If it's a 4xx error (except 408/429), don't bother retrying as it's likely a config issue
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
    
    // Filter out version segment (starts with 'v' followed by digits)
    // and short transformation segments
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
 * Native SHA-1 signature generator using the Web Crypto API.
 * This runs natively in all modern browsers without external dependencies.
 */
async function generateSHA1(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Delete an asset from Cloudinary using a secure signed request.
 * Requires the admin credentials.
 */
export async function deleteFromCloudinary(
  url: string,
  cloudName: string,
  apiKey: string,
  apiSecret: string
): Promise<boolean> {
  const publicId = extractPublicId(url);
  if (!publicId) {
    console.warn(`[Cloudinary] Could not extract public ID or non-Cloudinary asset URL: ${url}`);
    return false;
  }

  const finalCloudName = (cloudName || import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dvmx7w1a8").trim();
  const timestamp = Math.round(new Date().getTime() / 1000).toString();
  
  // Signature calculation string must be sorted alphabetically: public_id and timestamp
  // Example: "public_id=my_id&timestamp=1234567890YOUR_API_SECRET"
  const signString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  
  try {
    const signature = await generateSHA1(signString);
    
    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${finalCloudName}/image/destroy`,
      {
        method: 'POST',
        body: formData,
        mode: 'cors',
        credentials: 'omit'
      }
    );

    if (!response.ok) {
      let errorMessage = `Status ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        // Ignore JSON parse error
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (data.result === 'ok') {
      console.log(`[Cloudinary] Asset ${publicId} successfully deleted.`);
      return true;
    } else {
      console.warn(`[Cloudinary] Asset ${publicId} delete response result: ${data.result}`);
      return false;
    }
  } catch (error) {
    console.error(`[Cloudinary] Failed to delete asset ${publicId}:`, error);
    return false;
  }
}

