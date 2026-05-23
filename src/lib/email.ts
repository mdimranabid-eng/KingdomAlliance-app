interface EmailPayload {
  to_email: string;
  otp_code?: string | null;
  type: 'otp' | 'password_reset' | 'password_reset_success' | 'profile_approved' | 'profile_rejected' | 'photo_approved' | 'photo_rejected' | 'connection_request' | 'connection_accepted' | 'new_message';
  captchaToken?: string;
  reason?: string;
  senderName?: string;
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
      const responseClone = response.clone();
      const errorData = await responseClone.json()
        .catch(() => ({}));
      throw new Error(
        errorData.error || 
        `Server Error (${response.status})`
      );
    }

    console.log(`✅ Request successfully handled by backend for ${payload.to_email}`);

  } catch (error: any) {
    console.error(`🚨 Network / Fetch Failure:`, error.message);
    throw error;
  }
};
