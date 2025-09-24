import { StudentResultEmailPayload } from '../helpers/email-templates/student-result.template';
interface SendMailProps {
    to: string;
    subject: string;
    html: string;
}
export declare function sendMail({ to, subject, html }: SendMailProps): Promise<void>;
export declare function sendStudentResultEmail(to: string, payload: StudentResultEmailPayload): Promise<void>;
export {};
