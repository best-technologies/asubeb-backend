export interface SendMailProps {
  to: string;
  subject: string;
  html: string;
}

export type EmailProvider = 'gmail' | 'sendgrid' | 'resend';


