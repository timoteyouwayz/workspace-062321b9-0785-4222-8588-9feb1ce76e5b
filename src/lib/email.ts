import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.EMAIL_SMTP_HOST;
  const port = parseInt(process.env.EMAIL_SMTP_PORT || '587');
  const user = process.env.EMAIL_SMTP_USER;
  const password = process.env.EMAIL_SMTP_PASSWORD;

  if (!host || !user || !password) {
    console.warn('Email service not configured. Email notifications will be disabled.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass: password,
    },
  });

  return transporter;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transport = getTransporter();
    if (!transport) {
      console.warn(`Email not sent to ${options.to} - email service not configured`);
      return false;
    }

    const from = process.env.EMAIL_FROM || process.env.EMAIL_SMTP_USER || 'noreply@system.local';
    const fromName = process.env.EMAIL_FROM_NAME || 'System';

    const result = await transport.sendMail({
      from: `${fromName} <${from}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log(`Email sent to ${options.to}: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string,
  appUrl: string
): Promise<boolean> {
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      
      <p>Hi ${name},</p>
      
      <p>We received a request to reset your password. Click the link below to create a new password:</p>
      
      <div style="margin: 30px 0; text-align: center;">
        <a href="${resetUrl}" style="
          display: inline-block;
          padding: 12px 30px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        ">Reset Password</a>
      </div>
      
      <p>Or copy this link into your browser:</p>
      <p style="word-break: break-all; color: #666;"><small>${resetUrl}</small></p>
      
      <p style="color: #666; font-size: 14px;">
        This link will expire in 1 hour. If you didn't request this reset, you can ignore this email.
      </p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        This is an automated email. Please do not reply to this message.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Password Reset Request',
    html,
    text: `Password Reset Request\n\nHi ${name},\n\nReset your password here: ${resetUrl}\n\nThis link expires in 1 hour.`,
  });
}

/**
 * Send receipt verification notification
 */
export async function sendReceiptVerificationEmail(
  userEmail: string,
  userName: string,
  requisitionId: string,
  reason: string,
  amount: number,
  verified: boolean,
  appUrl: string
): Promise<boolean> {
  const statusText = verified ? 'Approved' : 'Rejected';
  const statusColor = verified ? '#28a745' : '#dc3545';
  const statusMessage = verified 
    ? 'Your receipt has been verified and approved.'
    : 'Your receipt has been reviewed but requires additional information.';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Receipt Verification Update</h2>
      
      <p>Hi ${userName},</p>
      
      <p>${statusMessage}</p>
      
      <div style="
        background-color: #f8f9fa;
        border-left: 4px solid ${statusColor};
        padding: 15px;
        margin: 20px 0;
      ">
        <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
        <p><strong>Requisition ID:</strong> ${requisitionId}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Amount:</strong> KES ${amount.toLocaleString()}</p>
      </div>
      
      <p>
        <a href="${appUrl}/requisitions/${requisitionId}" style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        ">View Requisition</a>
      </p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        This is an automated email. Please do not reply to this message.
      </p>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject: `Receipt ${statusText}: ${reason}`,
    html,
    text: `Receipt Verification Update\n\nHi ${userName},\n\n${statusMessage}\n\nRequisition: ${requisitionId}\nReason: ${reason}\nAmount: KES ${amount.toLocaleString()}\n\nStatus: ${statusText}`,
  });
}

/**
 * Send admin notification for new requisition
 */
export async function sendAdminRequisitionNotification(
  adminEmail: string,
  requesterName: string,
  requesterDept: string,
  reason: string,
  amount: number,
  requisitionId: string,
  appUrl: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Requisition Submitted</h2>
      
      <p>A new requisition has been submitted and requires review:</p>
      
      <div style="
        background-color: #f8f9fa;
        border-left: 4px solid #007bff;
        padding: 15px;
        margin: 20px 0;
      ">
        <p><strong>Requester:</strong> ${requesterName}</p>
        <p><strong>Department:</strong> ${requesterDept || 'N/A'}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Amount:</strong> KES ${amount.toLocaleString()}</p>
        <p><strong>ID:</strong> ${requisitionId}</p>
      </div>
      
      <p>
        <a href="${appUrl}/admin/requisitions" style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        ">Review Requisitions</a>
      </p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">
        This is an automated email. Please do not reply to this message.
      </p>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `New Requisition: ${reason}`,
    html,
    text: `New Requisition Submitted\n\nRequester: ${requesterName}\nDepartment: ${requesterDept || 'N/A'}\nReason: ${reason}\nAmount: KES ${amount.toLocaleString()}\nID: ${requisitionId}`,
  });
}
