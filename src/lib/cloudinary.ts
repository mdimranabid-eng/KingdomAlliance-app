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
