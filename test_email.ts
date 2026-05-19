import { sendEmail } from './src/lib/email';

(async () => {
  try {
    const result = await sendEmail({
      to_email: 'md.imranabid@gmail.com',
      otp_code: '123456',
      type: 'otp',
    });
    console.log('Email send result:', result);
  } catch (err) {
    console.error('Error sending email:', err);
  }
})();
