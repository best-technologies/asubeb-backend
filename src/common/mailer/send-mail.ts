import * as nodemailer from 'nodemailer';
import { studentResultEmailTemplate, StudentResultEmailPayload } from '../helpers/email-templates/student-result.template';
import { subebOfficerWelcomeEmailTemplate, SubebOfficerWelcomeEmailPayload } from '../helpers/email-templates/subeb-officer-welcome.template';

interface SendMailProps {
  to: string;
  subject: string;
  html: string;
}

// Reusable transporter (simple Gmail SMTP config, similar to other project)
let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('SMTP credentials missing in environment variables');
  }

  const host = process.env.GOOGLE_SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.GOOGLE_SMTP_PORT ? parseInt(process.env.GOOGLE_SMTP_PORT) : 587;

  // Log email configuration (mask password for security)
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD
    ? `${process.env.EMAIL_PASSWORD.substring(0, 4)}****${process.env.EMAIL_PASSWORD.substring(process.env.EMAIL_PASSWORD.length - 2)}`
    : 'NOT_SET';

  console.log(
    `[Email Config] Creating SMTP transporter: service=gmail, Host=${host}, Port=${port}, Secure=false, ` +
      `User=${emailUser}, Password=${emailPassword}`,
  );

  // Simple Gmail-style configuration (matches your working project)
  cachedTransporter = nodemailer.createTransport({
    service: 'gmail',
    host,
    port,
    secure: false, // same as your other project; STARTTLS is negotiated on 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  } as nodemailer.TransportOptions);

  return cachedTransporter;
}

export async function sendMail({ to, subject, html }: SendMailProps): Promise<void> {
  const transporter = getTransporter();

  const mailOptions = {
    from: {
      name: 'ASUBEB',
      address: process.env.EMAIL_USER as string,
    },
    to,
    subject,
    html,
  };

  try {
    // Verify connection before sending (optional, can be removed if too slow)
    // await transporter.verify();
    
    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Email sent successfully:', {
        messageId: info.messageId,
        to,
        subject,
      });
    }
  } catch (error: any) {
    // Log detailed error information
    const errorDetails = {
      message: error?.message,
      code: error?.code,
      command: error?.command,
      response: error?.response,
      responseCode: error?.responseCode,
      to,
      subject,
    };

    console.error('Email sending failed:', errorDetails);

    // Re-throw with more context
    throw new Error(
      `Failed to send email to ${to}: ${error?.message || 'Unknown error'}. ` +
      `Error code: ${error?.code || 'N/A'}, Response: ${error?.response || 'N/A'}`,
    );
  }
}

export async function sendStudentResultEmail(to: string, payload: StudentResultEmailPayload): Promise<void> {
  const html = studentResultEmailTemplate(payload);
  await sendMail({ to, subject: `Student Result - ${payload.studentName} (${payload.sessionName} - ${payload.termName})`, html });
}

export async function sendSubebOfficerWelcomeEmail(
  to: string,
  payload: SubebOfficerWelcomeEmailPayload,
): Promise<void> {
  const html = subebOfficerWelcomeEmailTemplate(payload);
  await sendMail({ to, subject: 'Welcome to ASUBEB Platform (SUBEB Officer)', html });
}



