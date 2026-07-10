interface EmailPayload {
  to_email: string;
  otp_code?: string | null;
  type: 'otp' | 'password_reset' | 'password_reset_success' | 'profile_approved' | 'profile_rejected' | 'photo_approved' | 'photo_rejected' | 'connection_request' | 'connection_accepted' | 'new_message';
  captchaToken?: string;
  reason?: string;
  senderName?: string;
}

export const sendEmail = async (payload: EmailPayload): Promise<void> => {
  const isDev = import.meta.env.MODE === 'development';
  
  // Dynamically resolve the correct Gen 2 function URL depending on environment
  const endpoint = isDev
    ? '/api/send-email'
    : window.location.hostname.includes('staging')
      ? 'https://sendemailapi-2wu7cebqxq-uc.a.run.app'
      : 'https://sendemailapi-zqwxjtgara-uc.a.run.app';

  try {
    const response = await fetch(endpoint, {
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
