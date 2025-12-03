import { SendMailProps, EmailProvider } from './providers/mail-provider.interface';
import { getEmailProvider, sendWithGmail } from './providers/gmail.provider';
import { sendWithSendGrid } from './providers/sendgrid.provider';
import { sendWithResend } from './providers/resend.provider';
import { studentResultEmailTemplate, StudentResultEmailPayload } from '../helpers/email-templates/student-result.template';
import { subebOfficerWelcomeEmailTemplate, SubebOfficerWelcomeEmailPayload } from '../helpers/email-templates/subeb-officer-welcome.template';
// Facade that chooses the right provider implementation based on EMAIL_PROVIDER

export async function sendMail({ to, subject, html }: SendMailProps): Promise<void> {
  const provider = getEmailProvider();

  try {
    if (provider === 'sendgrid') {
      await sendWithSendGrid({ to, subject, html });
    } else if (provider === 'resend') {
      await sendWithResend({ to, subject, html });
    } else {
      await sendWithGmail({ to, subject, html });
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
      provider,
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



