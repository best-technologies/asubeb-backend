import { SendMailProps } from './providers/mail-provider.interface';
import { StudentResultEmailPayload } from '../helpers/email-templates/student-result.template';
import { SubebOfficerWelcomeEmailPayload } from '../helpers/email-templates/subeb-officer-welcome.template';
export declare class MailService {
    sendMail(payload: SendMailProps): Promise<void>;
    sendStudentResultEmail(to: string, payload: StudentResultEmailPayload): Promise<void>;
    sendSubebOfficerWelcomeEmail(to: string, payload: SubebOfficerWelcomeEmailPayload): Promise<void>;
}
