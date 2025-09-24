import * as nodemailer from 'nodemailer';
import { studentResultEmailTemplate, StudentResultEmailPayload } from '../helpers/email-templates/student-result.template';

interface SendMailProps {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendMailProps): Promise<void> {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('SMTP credentials missing in environment variables');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.GOOGLE_SMTP_HOST,
    port: process.env.GOOGLE_SMTP_PORT ? parseInt(process.env.GOOGLE_SMTP_PORT) : 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: {
      name: 'ASUBEB',
      address: process.env.EMAIL_USER as string,
    },
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendStudentResultEmail(to: string, payload: StudentResultEmailPayload): Promise<void> {
  const html = studentResultEmailTemplate(payload);
  await sendMail({ to, subject: `Student Result - ${payload.studentName} (${payload.sessionName} - ${payload.termName})`, html });
}


