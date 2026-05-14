/**
 * CLOUDINARY UPLOAD UTILITY
 * 
 * This helper sends images directly to Cloudinary using their REST API.
 * It uses 'unsigned' uploads so we don't need a secret key on the frontend.
 */

export async function uploadToCloudinary(
  file: File, 
  cloudName: string, 
  uploadPreset: string
): Promise<string> {
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary configuration missing. Check Site Settings.");
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Failed to upload to Cloudinary");
  }

  const data = await response.json();
  return data.secure_url;
}
