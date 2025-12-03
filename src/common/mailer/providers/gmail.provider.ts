import * as nodemailer from 'nodemailer';
import { EmailProvider, SendMailProps } from './mail-provider.interface';

// Reusable transporter for Gmail
let cachedGmailTransporter: nodemailer.Transporter | null = null;

export function getEmailProvider(): EmailProvider {
  const providerRaw = (process.env.EMAIL_PROVIDER || 'gmail').toLowerCase();
  if (providerRaw === 'sendgrid' || providerRaw === 'resend') {
    return providerRaw;
  }
  return 'gmail';
}

export function getGmailTransporter(): nodemailer.Transporter {
  if (cachedGmailTransporter) {
    return cachedGmailTransporter;
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('SMTP credentials missing in environment variables for Gmail provider');
  }

  const host = process.env.GOOGLE_SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.GOOGLE_SMTP_PORT ? parseInt(process.env.GOOGLE_SMTP_PORT) : 587;

  // Log email configuration (mask password for security)
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD
    ? `${process.env.EMAIL_PASSWORD.substring(0, 4)}****${process.env.EMAIL_PASSWORD.substring(
        process.env.EMAIL_PASSWORD.length - 2,
      )}`
    : 'NOT_SET';

  console.log(
    `[Email Config] [GMAIL] Creating SMTP transporter: service=gmail, Host=${host}, Port=${port}, Secure=false, ` +
      `User=${emailUser}, Password=${emailPassword}`,
  );

  cachedGmailTransporter = nodemailer.createTransport({
    service: 'gmail',
    host,
    port,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  } as nodemailer.TransportOptions);

  return cachedGmailTransporter;
}

export async function sendWithGmail({ to, subject, html }: SendMailProps): Promise<void> {
  const transporter = getGmailTransporter();

  const mailOptions = {
    from: {
      name: 'ASUBEB',
      address: process.env.EMAIL_USER as string,
    },
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);

  if (process.env.NODE_ENV === 'development') {
    console.log('[Email] [GMAIL] Email sent successfully:', {
      messageId: info.messageId,
      to,
      subject,
    });
  }
}


