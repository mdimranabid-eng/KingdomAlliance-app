import { onDocumentUpdated, onDocumentCreated, onDocumentWritten } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Helper to configure the email transporter
const getTransporter = async () => {
  const nodemailer = await import('nodemailer');
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * Cloud Function to trigger emails when a user's approvalStatus or photoStatus is updated
 */
export const onUserStatusChanged = onDocumentUpdated(
  {
    document: 'users/{userId}',
    secrets: ['SMTP_USER', 'SMTP_PASS']
  },
  async (event) => {
    const change = event.data;
    if (!change) {
      console.log('No data change found.');
      return;
    }

    const beforeData = change.before.data();
    const afterData = change.after.data();

    const userEmail = afterData.email;
    const userName = afterData.name || 'Member';

    if (!userEmail) {
      console.warn(`No email found for user ${event.params.userId}. Skipping notification email.`);
      return;
    }

    const transporter = await getTransporter();

    // 1. Detect Profile Approval Changes
    const profileApprovedJustNow = beforeData.approvalStatus !== 'approved' && afterData.approvalStatus === 'approved';
    const profileRejectedJustNow = beforeData.approvalStatus !== 'rejected' && afterData.approvalStatus === 'rejected';

    if (profileApprovedJustNow) {
      console.log(`Sending profile approval email to ${userEmail}...`);
      const mailOptions = {
        from: `"Kingdom Alliance" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: 'Congratulations! Your Kingdom Alliance profile is approved',
        html: `
          <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <h2 style="color: #16a34a; margin-top: 0;">Welcome to Kingdom Alliance!</h2>
              <p>Hello ${userName},</p>
              <p><strong>Congratulations! Your Kingdom Alliance profile has been approved by our administration team.</strong></p>
              <p>You now have full access to search and connect with other members. Log in immediately to start your journey.</p>
              <br/>
              <p style="margin-bottom: 5px;">Regards,</p>
              <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
          </div>
        `
      };
      try {
        await transporter.sendMail(mailOptions);
        console.log(`Profile approval email successfully sent to ${userEmail}`);
      } catch (err: any) {
        console.error(`Failed to send profile approval email:`, err.message);
      }
    } else if (profileRejectedJustNow) {
      const reason = afterData.rejectedReason || 'Please review your profile details and submit again.';
      console.log(`Sending profile rejection email to ${userEmail}...`);
      const mailOptions = {
        from: `"Kingdom Alliance" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: 'Action Required: Kingdom Alliance Profile Update',
        html: `
          <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <h2 style="color: #dc2626; margin-top: 0;">Profile Update Required</h2>
              <p>Hello ${userName},</p>
              <p>Thank you for your application to join Kingdom Alliance. <strong>Action Required: Your profile needs a few updates before approval.</strong></p>
              <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
                  <p style="margin: 0; color: #991b1b;"><strong>Admin Notes:</strong> ${reason}</p>
              </div>
              <p>Please log back into your account to make the requested changes and submit them for review.</p>
              <br/>
              <p style="margin-bottom: 5px;">Regards,</p>
              <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
          </div>
        `
      };
      try {
        await transporter.sendMail(mailOptions);
        console.log(`Profile rejection email successfully sent to ${userEmail}`);
      } catch (err: any) {
        console.error(`Failed to send profile rejection email:`, err.message);
      }
    }

    // 2. Detect Profile Primary Photo Moderation Changes
    const photoApprovedJustNow = beforeData.photoStatus !== 'approved' && afterData.photoStatus === 'approved';
    const photoRejectedJustNow = beforeData.photoStatus !== 'rejected' && afterData.photoStatus === 'rejected';

    console.log(`[Photo Debug] User: ${userEmail}. PhotoStatus transition: ${beforeData.photoStatus} -> ${afterData.photoStatus}`);

    if (photoApprovedJustNow) {
      console.log(`Sending primary photo approval email to ${userEmail}...`);
      const mailOptions = {
        from: `"Kingdom Alliance" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: 'Your Kingdom Alliance Photo is Approved',
        html: `
          <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <h2 style="color: #16a34a; margin-top: 0;">Photo Approved!</h2>
              <p>Hello ${userName},</p>
              <p>Great news! The primary photo you recently uploaded to your Kingdom Alliance profile has been reviewed and <strong>approved</strong>.</p>
              <p>It is now live on your profile for other members to see.</p>
              <br/>
              <p style="margin-bottom: 5px;">Regards,</p>
              <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
          </div>
        `
      };
      try {
        await transporter.sendMail(mailOptions);
        console.log(`Photo approval email successfully sent to ${userEmail}`);
      } catch (err: any) {
        console.error(`Failed to send photo approval email:`, err.message);
      }
    } else if (photoRejectedJustNow) {
      const reason = afterData.rejectedPhotoReason || 'Please ensure your photo is clear, appropriate, and clearly shows your face.';
      console.log(`Sending photo rejection email to ${userEmail}...`);
      const mailOptions = {
        from: `"Kingdom Alliance" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: 'Action Required: Kingdom Alliance Photo Update',
        html: `
          <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <h2 style="color: #dc2626; margin-top: 0;">Photo Update Required</h2>
              <p>Hello ${userName},</p>
              <p>We recently reviewed the photo you uploaded to Kingdom Alliance. Unfortunately, it does not meet our guidelines and has been <strong>rejected</strong>.</p>
              <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
                  <p style="margin: 0; color: #991b1b;"><strong>Admin Notes:</strong> ${reason}</p>
              </div>
              <p>Please log in and upload a new photo that adheres to our guidelines.</p>
              <br/>
              <p style="margin-bottom: 5px;">Regards,</p>
              <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
          </div>
        `
      };
      try {
        await transporter.sendMail(mailOptions);
        console.log(`Photo rejection email successfully sent to ${userEmail}`);
      } catch (err: any) {
        console.error(`Failed to send photo rejection email:`, err.message);
      }
    }

    // 3. Detect Gallery Photo Rejection Changes
    const beforeGallery = beforeData.gallery || [];
    const afterGallery = afterData.gallery || [];

    for (const afterPhoto of afterGallery) {
      if (afterPhoto.status === 'rejected') {
        const beforePhoto = beforeGallery.find((p: any) => p.url === afterPhoto.url);
        const wasRejectedBefore = beforePhoto && beforePhoto.status === 'rejected';

        if (!wasRejectedBefore) {
          const reason = afterPhoto.rejectionReason || 'Please ensure your gallery photo meets our guidelines.';
          console.log(`Sending gallery photo rejection email to ${userEmail}...`);
          const mailOptions = {
            from: `"Kingdom Alliance" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: 'Action Required: Kingdom Alliance Gallery Photo Update',
            html: `
              <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                  <h2 style="color: #dc2626; margin-top: 0;">Gallery Photo Update Required</h2>
                  <p>Hello ${userName},</p>
                  <p>We recently reviewed a photo in your gallery. Unfortunately, it does not meet our guidelines and has been <strong>rejected</strong>.</p>
                  <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
                      <p style="margin: 0; color: #991b1b;"><strong>Admin Notes:</strong> ${reason}</p>
                  </div>
                  <p>Please log in and upload a new photo that adheres to our guidelines.</p>
                  <br/>
                  <p style="margin-bottom: 5px;">Regards,</p>
                  <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
              </div>
            `
          };
          try {
            await transporter.sendMail(mailOptions);
            console.log(`Gallery photo rejection email successfully sent to ${userEmail}`);
          } catch (err: any) {
            console.error(`Failed to send gallery photo rejection email:`, err.message);
          }
        }
      }
    }
  }
);

/**
 * Cloud Function to send emails when a new message is added to the contact_messages collection
 */
export const onContactMessageCreated = onDocumentCreated(
  {
    document: 'contact_messages/{messageId}',
    secrets: ['SMTP_USER', 'SMTP_PASS', 'ADMIN_EMAIL_FALLBACK']
  },
  async (event) => {
    const data = event.data?.data();
    if (!data) {
      console.log('No data found for contact message.');
      return;
    }

    const { name, email, mobile, subject, message } = data;
    
    let adminEmail = 'stars@thekingdomalliances.com';
    try {
      const siteConfigSnap = await admin.firestore().collection('settings').doc('site_config').get();
      if (siteConfigSnap.exists) {
        const configData = siteConfigSnap.data();
        if (configData?.adminNotificationEmails) {
          adminEmail = configData.adminNotificationEmails;
        }
      }
    } catch (err: any) {
      console.warn('Could not load admin email from settings, using default fallback:', err.message);
      adminEmail = process.env.ADMIN_EMAIL_FALLBACK || 'stars@thekingdomalliances.com';
    }

    console.log(`Sending contact message notification email to admin: ${adminEmail}...`);
    const transporter = await getTransporter();

    const mailOptions = {
      from: `"Kingdom Alliance Contact" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `📧 New Contact Form Submission: ${subject || 'No Subject'}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #b8860b; margin-top: 0;">New Contact Form Message</h2>
            <p>You have received a new message from the contact form:</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; width: 120px;">Name:</td>
                <td>${name || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Email:</td>
                <td>${email || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Mobile:</td>
                <td>${mobile || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">Subject:</td>
                <td>${subject || 'N/A'}</td>
              </tr>
            </table>
            <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #b8860b; border-radius: 4px; margin-top: 15px;">
              <p style="margin: 0; font-weight: bold; margin-bottom: 5px;">Message Details:</p>
              <p style="margin: 0; white-space: pre-wrap; font-style: italic;">${message || 'No message contents provided.'}</p>
            </div>
            <br/>
            <p style="font-size: 11px; color: #94a3b8; margin-top: 20px;">This is an automated notification from the Kingdom Alliance backend.</p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Contact message notification email successfully sent to ${adminEmail}`);
    } catch (err: any) {
      console.error(`Failed to send contact message email:`, err.message);
    }
  }
);

/**
 * Cloud Function to send real-time push notifications + session-based email
 * when a new chat message is created
 */
export const onChatMessageCreated = onDocumentCreated(
  {
    document: 'chats/{chatId}/messages/{messageId}',
    secrets: ['SMTP_USER', 'SMTP_PASS']
  },
  async (event) => {
    const data = event.data?.data();
    if (!data) {
      console.log('No data found for message.');
      return;
    }

    const { senderId, receiverId, text } = data;
    if (!receiverId || !text) return;

    try {
      // 1. Fetch recipient's user document
      const receiverSnap = await admin.firestore().collection('users').doc(receiverId).get();
      if (!receiverSnap.exists) {
        console.log(`No user profile found for receiver ${receiverId}`);
        return;
      }
      
      const receiverData = receiverSnap.data()!;

      // 2. Fetch sender name (reused for push + email)
      let senderName = 'A member';
      const senderSnap = await admin.firestore().collection('users').doc(senderId).get();
      if (senderSnap.exists) {
        senderName = senderSnap.data()?.name || 'A member';
      }

      // 3. Push notification (FCM)
      const tokens = receiverData.fcmTokens || [];
      if (tokens.length > 0) {
        const payload = {
          notification: {
            title: `New Message from ${senderName}`,
            body: text.length > 100 ? `${text.substring(0, 97)}...` : text,
          }
        };

        console.log(`Sending push notification to ${tokens.length} tokens for receiver ${receiverId}...`);
        
        const response = await admin.messaging().sendEachForMulticast({
          tokens: tokens,
          notification: payload.notification
        });

        // Clean up failed/expired tokens
        const tokensToDelete: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const errCode = resp.error?.code;
            if (
              errCode === 'messaging/invalid-registration-token' || 
              errCode === 'messaging/registration-token-not-registered'
            ) {
              tokensToDelete.push(tokens[idx]);
            } else {
              console.error(`FCM sending error on token ${tokens[idx]}:`, resp.error);
            }
          }
        });

        if (tokensToDelete.length > 0) {
          console.log(`Cleaning up ${tokensToDelete.length} invalid tokens for user ${receiverId}`);
          await admin.firestore().collection('users').doc(receiverId).update({
            fcmTokens: admin.firestore.FieldValue.arrayRemove(...tokensToDelete)
          });
        }
      } else {
        console.log(`Receiver ${receiverId} has no registered FCM tokens, skipping push.`);
      }

      // 4. Session-based email notification
      // Only email if recipient is offline AND no email has been sent since they last logged in
      const recipientEmail = receiverData.email;
      if (!recipientEmail) {
        console.log(`No email for receiver ${receiverId}, skipping email notification.`);
        return;
      }

      // Check RTDB presence status
      const statusSnapshot = await admin.database().ref(`status/${receiverId}`).get();
      const statusData = statusSnapshot.val();

      if (statusData && statusData.state !== 'offline') {
        console.log(`Receiver ${receiverId} is online, skipping email.`);
        return;
      }

      // Session-based digest: only send one email per offline session
      const lastActive = receiverData.lastActive?.toMillis?.() || 0;
      const lastEmailSent = receiverData.lastEmailSent?.toMillis?.() || 0;

      if (lastEmailSent >= lastActive) {
        console.log(`Email already sent this offline session for ${receiverId}, skipping.`);
        return;
      }

      // Send the email
      const transporter = await getTransporter();
      const mailOptions = {
        from: `"Kingdom Alliance" <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        subject: 'You have a new message on Kingdom Alliance',
        html: `
          <div style="font-family: Arial, sans-serif; color: #040e2a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <h2 style="color: #d4af37;">New Message Received</h2>
              <p>Hello,</p>
              <p><strong>${senderName}</strong> has sent you a new message on Kingdom Alliance.</p>
              <p style="font-size: 14px; color: #64748b;">For your privacy and security, we do not include message contents in emails. Please log in to your Kingdom Alliance messages to read and reply.</p>
              <br/>
              <p style="margin-bottom: 5px;">Regards,</p>
              <p style="margin-top: 0;"><strong>Thank You,</strong><br/>The Kingdom Alliance Team</p>
          </div>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`New message email sent to ${recipientEmail}`);

        // Update lastEmailSent to prevent duplicate emails this session
        await admin.firestore().collection('users').doc(receiverId).update({
          lastEmailSent: admin.firestore.FieldValue.serverTimestamp()
        });
      } catch (err: any) {
        console.error(`Failed to send new message email to ${recipientEmail}:`, err.message);
      }

    } catch (err: any) {
      console.error('Error handling chat message notification:', err.message);
    }
  }
);

/**
 * Cloud Function to send FCM push notification when a new interest is created.
 * This ensures the recipient is notified even if the sender's browser is closed.
 */
export const onInterestCreated = onDocumentCreated(
  'interests/{connectionId}',
  async (event) => {
    const data = event.data?.data();
    if (!data) return;
    if (data.status !== 'pending') return;

    const { fromId, toId } = data;
    if (!fromId || !toId) return;

    try {
      // 1. Fetch recipient's FCM tokens
      const receiverSnap = await admin.firestore().collection('users').doc(toId).get();
      if (!receiverSnap.exists) {
        console.log(`No user profile found for receiver ${toId}`);
        return;
      }
      const receiverData = receiverSnap.data()!;

      // 2. Fetch sender name
      let senderName = 'A member';
      const senderSnap = await admin.firestore().collection('users').doc(fromId).get();
      if (senderSnap.exists) {
        senderName = senderSnap.data()?.name || 'A member';
      }

      // 3. Send FCM push notification
      const tokens = receiverData.fcmTokens || [];
      if (tokens.length === 0) {
        console.log(`Receiver ${toId} has no FCM tokens, skipping push.`);
        return;
      }

      const payload = {
        notification: {
          title: 'New Connection Request',
          body: `${senderName} is interested in connecting with you!`,
        },
        data: {
          type: 'interest',
          fromId: fromId,
          connectionId: event.params.connectionId,
        }
      };

      console.log(`Sending interest push notification to ${toId} (${tokens.length} tokens)...`);

      const response = await admin.messaging().sendEachForMulticast({
        tokens,
        notification: payload.notification,
        data: payload.data,
      });

      // Clean up invalid tokens
      const tokensToDelete: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errCode = resp.error?.code;
          if (
            errCode === 'messaging/invalid-registration-token' ||
            errCode === 'messaging/registration-token-not-registered'
          ) {
            tokensToDelete.push(tokens[idx]);
          } else {
            console.error(`FCM interest push error on token ${tokens[idx]}:`, resp.error);
          }
        }
      });

      if (tokensToDelete.length > 0) {
        console.log(`Cleaning up ${tokensToDelete.length} invalid tokens for user ${toId}`);
        await admin.firestore().collection('users').doc(toId).update({
          fcmTokens: admin.firestore.FieldValue.arrayRemove(...tokensToDelete)
        });
      }

      console.log(`Interest push notification sent successfully to ${toId}`);

    } catch (err: any) {
      console.error('Error sending interest push notification:', err.message);
    }
  }
);

/**
 * Cloud Function to send FCM push notification when an interest is accepted.
 */
export const onInterestAccepted = onDocumentWritten(
  'interests/{connectionId}',
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    // Only trigger on status change from pending to accepted
    if (before.status !== 'pending' || after.status !== 'accepted') return;

    const { fromId, toId } = after;
    if (!fromId || !toId) return;

    // The sender of the original interest (fromId) should be notified
    // that their interest was accepted by toId
    const recipientUid = fromId;
    const accepterUid = toId;

    try {
      const recipientSnap = await admin.firestore().collection('users').doc(recipientUid).get();
      if (!recipientSnap.exists) return;
      const recipientData = recipientSnap.data()!;

      let accepterName = 'A member';
      const accepterSnap = await admin.firestore().collection('users').doc(accepterUid).get();
      if (accepterSnap.exists) {
        accepterName = accepterSnap.data()?.name || 'A member';
      }

      const tokens = recipientData.fcmTokens || [];
      if (tokens.length === 0) return;

      const payload = {
        notification: {
          title: 'Connection Accepted!',
          body: `${accepterName} accepted your connection request!`,
        },
        data: {
          type: 'accepted',
          fromId: accepterUid,
          connectionId: event.params.connectionId,
        }
      };

      const response = await admin.messaging().sendEachForMulticast({
        tokens,
        notification: payload.notification,
        data: payload.data,
      });

      // Clean up invalid tokens
      const tokensToDelete: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errCode = resp.error?.code;
          if (
            errCode === 'messaging/invalid-registration-token' ||
            errCode === 'messaging/registration-token-not-registered'
          ) {
            tokensToDelete.push(tokens[idx]);
          }
        }
      });

      if (tokensToDelete.length > 0) {
        await admin.firestore().collection('users').doc(recipientUid).update({
          fcmTokens: admin.firestore.FieldValue.arrayRemove(...tokensToDelete)
        });
      }

      console.log(`Interest accepted push notification sent to ${recipientUid}`);

    } catch (err: any) {
      console.error('Error sending interest accepted notification:', err.message);
    }
  }
);
