import emailjs from '@emailjs/browser';

// Initialize EmailJS with Public Key
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
if (PUBLIC_KEY && PUBLIC_KEY !== 'your_public_key') {
  emailjs.init(PUBLIC_KEY);
}

export interface EmailData {
  to_email: string;
  to_name?: string;
  otp_code?: string;
  reset_link?: string;
  type: 'otp' | 'welcome' | 'interest';
}

export const sendEmail = async (data: EmailData) => {
  const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const TEMPLATE_ID = data.type === 'otp' ? import.meta.env.VITE_EMAILJS_OTP_TEMPLATE_ID : import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

  const isPlaceholder = 
    !PUBLIC_KEY || PUBLIC_KEY === 'your_public_key' || 
    !SERVICE_ID || SERVICE_ID === 'your_service_id' || 
    !TEMPLATE_ID || TEMPLATE_ID.includes('your_');

  if (isPlaceholder) {
    console.warn('⚠️ EmailJS credentials missing or using default placeholders. Simulating successful email dispatch.', data);
    return { status: 200, text: 'Simulated success' };
  }

  try {
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_email: data.to_email,
        to_name: data.to_name || 'User',
        otp_code: data.otp_code,
        reset_link: data.reset_link,
      }
    );
    return response;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};
