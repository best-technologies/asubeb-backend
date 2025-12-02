import * as nodemailer from 'nodemailer';
import { studentResultEmailTemplate, StudentResultEmailPayload } from '../helpers/email-templates/student-result.template';
import { subebOfficerWelcomeEmailTemplate, SubebOfficerWelcomeEmailPayload } from '../helpers/email-templates/subeb-officer-welcome.template';

interface SendMailProps {
  to: string;
  subject: string;
  html: string;
}

// Create a reusable transporter with connection pooling and proper timeouts
let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('SMTP credentials missing in environment variables');
  }

  cachedTransporter = nodemailer.createTransport({
    host: process.env.GOOGLE_SMTP_HOST || 'smtp.gmail.com',
    port: process.env.GOOGLE_SMTP_PORT ? parseInt(process.env.GOOGLE_SMTP_PORT) : 587,
    secure: process.env.GOOGLE_SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Connection timeout settings (in milliseconds)
    connectionTimeout: 10000, // 10 seconds to establish connection
    socketTimeout: 30000, // 30 seconds for socket operations
    greetingTimeout: 10000, // 10 seconds for SMTP greeting
    // Enable connection pooling
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    // Retry configuration
    retry: {
      attempts: 3,
      delay: 2000, // 2 seconds between retries
    },
    // Debug mode (set to true for verbose logging in development)
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development',
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



