// Helper to configure the email transporter
const getTransporter = async () => {
  const nodemailer = await import('nodemailer');
  
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = Number(String(process.env.SMTP_PORT || '465').trim());
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();

  return nodemailer.createTransport({
    host,
    port,
    secure: true,
    auth: {
      user,
      pass
    }
  });
};

export const dispatchEmail = async (
  to_email: string,
  secret_value: string | null,
  type: string,
  custom_reason: string | null = null,
  senderName: string = 'A member',
  attachmentBase64?: string,
  attachmentFilename?: string,
  bccEmail?: string
): Promise<boolean> => {
  let mailSubject = '';
  let htmlContent = '';

  const isOldSignature = typeof type === 'string' && (type.trim().startsWith('<') || type.includes('<div') || type.includes('<p'));

  if (isOldSignature) {
    mailSubject = secret_value || 'Notification';
    htmlContent = type;
  } else if (type === 'otp') {
    mailSubject = 'Your Kingdom Alliance Verification Code';
    htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #d4af37;">Verification Required</h2>
          <p>Hello,</p>
          <p>Your secure Kingdom Alliance verification code is:</p>
          <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <h1 style="color: #040e2a; letter-spacing: 4px; margin: 0;">${secret_value}</h1>
          </div>
          <p style="font-size: 14px; color: #64748b;">If you did not request this change, please ignore this email. Your account remains secure.</p>
          <br/>
          <p style="margin-bottom: 5px;">Regards,</p>
          <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
      </div>
    `;
  } else if (type === 'password_reset') {
    mailSubject = 'Your Password Reset OTP - Kingdom Alliance';
    htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #d4af37;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset the password for your Kingdom Alliance account. Please use the verification code below to proceed:</p>
          <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <h1 style="color: #040e2a; letter-spacing: 4px; margin: 0;">${secret_value}</h1>
          </div>
          <p style="font-size: 14px; color: #64748b;">If you did not request this change, please ignore this email. Your account remains secure.</p>
          <br/>
          <p style="margin-bottom: 5px;">Regards,</p>
          <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
      </div>
    `;
  } else if (type === 'password_reset_success') {
    mailSubject = 'Your Password at Kingdom Alliance was reset';
    htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #16a34a;">Password Reset Successful</h2>
          <p>Hello,</p>
          <p>This is a quick confirmation that the password for your Kingdom Alliance account has been successfully changed.</p>
          <p style="font-size: 14px; color: #64748b;">If you made this change, no further action is required. If you did not authorize this change, please contact our support team immediately.</p>
          <br/>
          <p style="margin-bottom: 5px;">Regards,</p>
          <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
      </div>
    `;
  } else if (type === 'profile_approved') {
    mailSubject = 'Congratulations! Your Kingdom Alliance profile is approved';
    htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #16a34a;">Welcome to Kingdom Alliance!</h2>
          <p>Hello,</p>
          <p><strong>Congratulations! Your Kingdom Alliance profile has been approved.</strong></p>
          <p>You now have full access to the platform. You can log in immediately to start connecting with other members.</p>
          <br/>
          <p style="margin-bottom: 5px;">Regards,</p>
          <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
      </div>
    `;
  } else if (type === 'profile_rejected') {
    mailSubject = 'Action Required: Kingdom Alliance Profile Update';
    htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #dc2626;">Profile Update Required</h2>
          <p>Hello,</p>
          <p>Thank you for applying to join Kingdom Alliance. <strong>Action Required: Your profile needs a few tweaks before approval.</strong></p>
          <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
              <p style="margin: 0; color: #991b1b;"><strong>Admin Notes:</strong> ${custom_reason || 'Please review your profile details and submit again.'}</p>
          </div>
          <p>Please log back into your account to make the requested changes.</p>
          <br/>
          <p style="margin-bottom: 5px;">Regards,</p>
          <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
      </div>
    `;
  } else if (type === 'photo_approved') {
    mailSubject = 'Your Kingdom Alliance Photo is Approved';
    htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #16a34a;">Photo Approved!</h2>
          <p>Hello,</p>
          <p>Great news! The photo you recently uploaded to your Kingdom Alliance profile has been reviewed and <strong>approved</strong>.</p>
          <p>It is now live on your profile for other members to see.</p>
          <br/>
          <p style="margin-bottom: 5px;">Regards,</p>
          <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
      </div>
    `;
  } else if (type === 'photo_rejected') {
    mailSubject = 'Action Required: Kingdom Alliance Photo Update';
    htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #dc2626;">Photo Update Required</h2>
          <p>Hello,</p>
          <p>We recently reviewed a photo you uploaded to Kingdom Alliance. Unfortunately, it does not meet our community guidelines and has been <strong>rejected</strong>.</p>
          <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
              <p style="margin: 0; color: #991b1b;"><strong>Admin Notes:</strong> ${custom_reason || 'Please ensure your photo is clear, appropriate, and clearly shows your face.'}</p>
          </div>
          <p>Please log in and upload a new photo that adheres to our guidelines.</p>
          <br/>
          <p style="margin-bottom: 5px;">Regards,</p>
          <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
      </div>
    `;
  } else if (type === 'connection_request') {
    mailSubject = 'Someone wants to connect with you on Kingdom Alliance!';
    htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #d4af37;">New Connection Request</h2>
          <p>Hello,</p>
          <p>Great news! <strong>${senderName}</strong> has reviewed your profile and would like to connect with you.</p>
          <p>Log in to your Kingdom Alliance account now to view their profile and accept or decline their request.</p>
          <br/>
          <p style="margin-bottom: 5px;">Regards,</p>
          <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
      </div>
    `;
  } else if (type === 'connection_accepted') {
    mailSubject = 'Your connection request was accepted!';
    htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #16a34a;">Connection Accepted!</h2>
          <p>Hello,</p>
          <p><strong>${senderName}</strong> has accepted your connection request!</p>
          <p>You can now send them direct messages and get to know them better. Log in to start the conversation.</p>
          <br/>
          <p style="margin-bottom: 5px;">Regards,</p>
          <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
      </div>
    `;
  } else if (type === 'new_message') {
    mailSubject = 'You have a new message on Kingdom Alliance';
    htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #d4af37;">New Message Received</h2>
          <p>Hello,</p>
          <p><strong>${senderName}</strong> has sent you a new message on Kingdom Alliance.</p>
          <p style="font-size: 14px; color: #64748b;">For your privacy and security, we do not include message contents in emails. Please log in to your Kingdom Alliance messages to read and reply.</p>
          <br/>
          <p style="margin-bottom: 5px;">Regards,</p>
          <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
      </div>
    `;
  } else if (type === 'account_deletion_scheduled') {
    mailSubject = 'Your Kingdom Alliance account deletion has been scheduled';
    htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #dc2626;">Account Deletion Scheduled</h2>
          <p>Hello,</p>
          <p>We have received your request to delete your Kingdom Alliance profile.</p>
          <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
              <p style="margin: 0; color: #991b1b;">Your account will be <strong>permanently deleted on ${custom_reason || '(7 days from now)'}</strong>.</p>
          </div>
          <p>Until then, your account is disabled and hidden from other members.</p>
          <p><strong>Changed your mind?</strong> Simply log in to Kingdom Alliance before that date and you will be given the option to reactivate your account. Everything will be restored exactly as it was.</p>
          <br/>
          <p style="margin-bottom: 5px;">Regards,</p>
          <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
      </div>
    `;
  } else if (type === 'account_reactivated') {
    mailSubject = 'Your Kingdom Alliance account has been reactivated';
    htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #16a34a;">Welcome Back!</h2>
          <p>Hello,</p>
          <p><strong>Your Kingdom Alliance account has been successfully reactivated.</strong> The deletion request has been cancelled and all your data remains intact.</p>
          <p>You can now log in and continue using Kingdom Alliance as before.</p>
          <br/>
          <p style="margin-bottom: 5px;">Regards,</p>
          <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
      </div>
    `;
  } else if (type === 'account_deleted') {
    mailSubject = 'Your Kingdom Alliance account has been deleted';
    htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #64748b;">Account Deleted</h2>
          <p>Hello,</p>
          <p>This is a confirmation that your Kingdom Alliance account and all associated data have been permanently deleted, as requested.</p>
          <p>If you ever wish to rejoin our community, you are always welcome to register again.</p>
          <br/>
          <p style="margin-bottom: 5px;">Regards,</p>
          <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
      </div>
    `;
  } else if (type === 'account_deletion_reminder') {
    mailSubject = 'Final reminder: Your Kingdom Alliance account will be deleted soon';
    htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #dc2626;">Your Account Will Be Deleted Soon</h2>
          <p>Hello,</p>
          <p>This is a final reminder that your Kingdom Alliance account is scheduled for <strong>permanent deletion within the next 24 hours</strong>.</p>
          <p><strong>Want to keep your account?</strong> Log in now to reactivate it — everything will be restored exactly as it was.</p>
          <br/>
          <p style="margin-bottom: 5px;">Regards,</p>
          <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
      </div>
    `;
  } else if (type === 'onboarding_complete') {
    const profileName = custom_reason || 'Member';
    mailSubject = `Welcome to Kingdom Alliance — ${profileName}`;
    htmlContent = `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #333333; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #dddddd; border-radius: 4px; overflow: hidden;">
        <div style="background: #1a1a2e; padding: 24px 30px; text-align: center;">
          <h1 style="color: #d4af37; margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 2px;">KINGDOM ALLIANCE</h1>
          <p style="color: #999999; margin: 4px 0 0 0; font-size: 11px; letter-spacing: 1px;">CHRISTIAN MATRIMONY PLATFORM</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #1a1a2e; font-size: 18px; margin: 0 0 16px 0;">Welcome, ${profileName}</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #555555; margin: 0 0 12px 0;">Thank you for completing your registration with Kingdom Alliance. Your profile has been successfully created and is now pending review by our team.</p>
          <p style="font-size: 14px; line-height: 1.6; color: #555555; margin: 0 0 12px 0;">Please find attached your confidential matrimonial biodata document containing your profile details and our terms and conditions.</p>
          <div style="background: #f8f8f8; border-left: 3px solid #d4af37; padding: 12px 16px; margin: 16px 0;">
            <p style="font-size: 13px; color: #666666; margin: 0;"><strong>Profile ID:</strong> ${custom_reason || 'Assigned upon review'}</p>
            <p style="font-size: 13px; color: #666666; margin: 6px 0 0 0;"><strong>Status:</strong> Pending Approval</p>
          </div>
          <p style="font-size: 14px; line-height: 1.6; color: #555555; margin: 0 0 12px 0;">You will receive another email once your profile has been reviewed and approved.</p>
          <p style="font-size: 14px; line-height: 1.6; color: #555555; margin: 0 0 24px 0;">If you have any questions, please contact us at <a href="mailto:themaster@thekingdomalliances.com" style="color: #d4af37; text-decoration: none;">themaster@thekingdomalliances.com</a>.</p>
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999999; margin: 0; text-align: center;">Kingdom Alliance — Christian Matrimony Platform</p>
          <p style="font-size: 12px; color: #999999; margin: 4px 0 0 0; text-align: center;">thekingdomalliances.com</p>
        </div>
      </div>
    `;
  } else if (type === 'admin_invitation') {
    const tempPassword = secret_value || '';
    mailSubject = 'You Have Been Added as an Admin — Kingdom Alliance';
    htmlContent = `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #333333; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #dddddd; border-radius: 4px; overflow: hidden;">
        <div style="background: #1a1a2e; padding: 24px 30px; text-align: center;">
          <h1 style="color: #d4af37; margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 2px;">KINGDOM ALLIANCE</h1>
          <p style="color: #999999; margin: 4px 0 0 0; font-size: 11px; letter-spacing: 1px;">ADMIN INVITATION</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #1a1a2e; font-size: 18px; margin: 0 0 16px 0;">Welcome to the Admin Team</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #555555; margin: 0 0 12px 0;">You have been granted administrator access to the Kingdom Alliance platform. Use the credentials below to log in at the admin portal.</p>
          <div style="background: #f8f8f8; border-left: 3px solid #d4af37; padding: 12px 16px; margin: 16px 0;">
            <p style="font-size: 13px; color: #666666; margin: 0;"><strong>Login URL:</strong> <a href="https://thekingdomalliances.com/admin/login" style="color: #d4af37;">Admin Portal</a></p>
            <p style="font-size: 13px; color: #666666; margin: 6px 0 0 0;"><strong>Password:</strong> <code style="background: #eee; padding: 2px 6px; border-radius: 3px; font-size: 13px;">${tempPassword}</code></p>
          </div>
          <p style="font-size: 14px; line-height: 1.6; color: #555555; margin: 0 0 24px 0;"><strong>Important:</strong> On your first login, you will be required to verify your email via a one-time code and set up two-factor authentication (Google Authenticator) for security.</p>
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999999; margin: 0; text-align: center;">Kingdom Alliance — Christian Matrimony Platform</p>
          <p style="font-size: 12px; color: #999999; margin: 4px 0 0 0; text-align: center;">thekingdomalliances.com</p>
        </div>
      </div>
    `;
  } else if (type === 'admin_password_reset') {
    const newPassword = secret_value || '';
    mailSubject = 'Your Admin Password Was Reset — Kingdom Alliance';
    htmlContent = `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #333333; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #dddddd; border-radius: 4px; overflow: hidden;">
        <div style="background: #1a1a2e; padding: 24px 30px; text-align: center;">
          <h1 style="color: #d4af37; margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 2px;">KINGDOM ALLIANCE</h1>
          <p style="color: #999999; margin: 4px 0 0 0; font-size: 11px; letter-spacing: 1px;">ADMIN PASSWORD RESET</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #1a1a2e; font-size: 18px; margin: 0 0 16px 0;">Your Password Has Been Reset</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #555555; margin: 0 0 12px 0;">An administrator has reset the password for your Kingdom Alliance admin account. Use the password below to log in at the admin portal.</p>
          <div style="background: #f8f8f8; border-left: 3px solid #d4af37; padding: 12px 16px; margin: 16px 0;">
            <p style="font-size: 13px; color: #666666; margin: 0;"><strong>Login URL:</strong> <a href="https://thekingdomalliances.com/admin/login" style="color: #d4af37;">Admin Portal</a></p>
            <p style="font-size: 13px; color: #666666; margin: 6px 0 0 0;"><strong>Password:</strong> <code style="background: #eee; padding: 2px 6px; border-radius: 3px; font-size: 13px;">${newPassword}</code></p>
          </div>
          <p style="font-size: 14px; line-height: 1.6; color: #555555; margin: 0 0 24px 0;">If you did not request this, please contact the platform owner immediately.</p>
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999999; margin: 0; text-align: center;">Kingdom Alliance — Christian Matrimony Platform</p>
          <p style="font-size: 12px; color: #999999; margin: 4px 0 0 0; text-align: center;">thekingdomalliances.com</p>
        </div>
      </div>
    `;
  } else if (type === 'admin_deletion_otp') {
    const otpCode = secret_value || '';
    mailSubject = 'Admin Deletion Verification Code — Kingdom Alliance';
    htmlContent = `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #333333; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #dddddd; border-radius: 4px; overflow: hidden;">
        <div style="background: #1a1a2e; padding: 24px 30px; text-align: center;">
          <h1 style="color: #d4af37; margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 2px;">KINGDOM ALLIANCE</h1>
          <p style="color: #999999; margin: 4px 0 0 0; font-size: 11px; letter-spacing: 1px;">ADMIN DELETION VERIFICATION</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #1a1a2e; font-size: 18px; margin: 0 0 16px 0;">Deletion Verification Code</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #555555; margin: 0 0 12px 0;">An administrator is requesting to delete an admin account. Use the code below to verify this action.</p>
          <div style="background: #fef2f2; border-left: 3px solid #dc2626; padding: 12px 16px; margin: 16px 0;">
            <p style="font-size: 24px; font-weight: bold; color: #dc2626; margin: 0; text-align: center; letter-spacing: 6px;">${otpCode}</p>
          </div>
          <p style="font-size: 13px; color: #999999; margin: 0 0 8px 0;">This code expires in 10 minutes. If you did not request this deletion, please disregard this email and contact the platform owner immediately.</p>
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999999; margin: 0; text-align: center;">Kingdom Alliance — Christian Matrimony Platform</p>
          <p style="font-size: 12px; color: #999999; margin: 4px 0 0 0; text-align: center;">thekingdomalliances.com</p>
        </div>
      </div>
    `;
  } else {
    mailSubject = 'Your Kingdom Alliance Verification Code';
    htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #040e2a;">
          <h2>Your Verification Code</h2>
          <p>Your code is: <strong>${secret_value}</strong></p>
          <p>Regards,<br/>The Kingdom Alliance Team</p>
      </div>
    `;
  }

  const transporter = await getTransporter();

  try {
    const mailOptions: any = {
      from: `"Kingdom Alliance" <${process.env.SMTP_USER}>`,
      to: to_email,
      subject: mailSubject,
      html: htmlContent
    };
    if (bccEmail) mailOptions.bcc = bccEmail;
    if (attachmentBase64 && attachmentFilename) {
      const b64 = attachmentBase64.includes(';base64,') ? attachmentBase64.split(';base64,').pop()! : attachmentBase64;
      mailOptions.attachments = [{
        filename: attachmentFilename,
        content: b64,
        encoding: 'base64'
      }];
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL ADAPTER] Successfully dispatched to ${to_email} (ID: ${info.messageId})`);
    return true;
  } catch (error: any) {
    console.error(`❌ [EMAIL ADAPTER] Delivery failure for ${to_email}:`, error.message);
    throw new Error('Provider failed to dispatch email');
  }
};
