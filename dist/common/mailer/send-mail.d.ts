import { StudentResultEmailPayload } from '../helpers/email-templates/student-result.template';
import { SubebOfficerWelcomeEmailPayload } from '../helpers/email-templates/subeb-officer-welcome.template';
interface SendMailProps {
    to: string;
    subject: string;
    html: string;
}
export declare function sendMail({ to, subject, html }: SendMailProps): Promise<void>;
export declare function sendStudentResultEmail(to: string, payload: StudentResultEmailPayload): Promise<void>;
export declare function sendSubebOfficerWelcomeEmail(to: string, payload: SubebOfficerWelcomeEmailPayload): Promise<void>;
export {};
