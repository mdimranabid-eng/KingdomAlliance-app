interface EmailPayload {
  to_email: string;
  otp_code: string;
  type: 'otp';
}

export const sendEmail = async (payload: EmailPayload): Promise<void> => {
  // Use relative path for local Vite proxy, or absolute URL for Firebase production
  const baseUrl = import.meta.env.MODE === 'development' 
    ? '/api' 
    : (import.meta.env.VITE_PRODUCTION_API || '');

  try {
    // The fetch path dynamically adapts based on the environment
    const response = await fetch(`${baseUrl}/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let serverError = '';
      try {
        const errorData = await response.json();
        serverError = errorData.error || JSON.stringify(errorData);
      } catch {
        serverError = await response.text();
      }
      throw new Error(`Server Error (${response.status}): ${serverError}`);
    }

    console.log(`✅ Request successfully handled by backend for ${payload.to_email}`);

  } catch (error: any) {
    console.error(`🚨 Network / Fetch Failure:`, error.message);
    throw error;
  }
};
