import { Injectable } from '@nestjs/common';
import { SendMailProps } from './providers/mail-provider.interface';
import { sendMail } from './send-mail';
import {
  sendStudentResultEmail as sendStudentResultEmailHelper,
  sendSubebOfficerWelcomeEmail as sendSubebOfficerWelcomeEmailHelper,
} from './send-mail';
import { StudentResultEmailPayload } from '../helpers/email-templates/student-result.template';
import { SubebOfficerWelcomeEmailPayload } from '../helpers/email-templates/subeb-officer-welcome.template';

@Injectable()
export class MailService {
  async sendMail(payload: SendMailProps): Promise<void> {
    return sendMail(payload);
  }

  async sendStudentResultEmail(
    to: string,
    payload: StudentResultEmailPayload,
  ): Promise<void> {
    return sendStudentResultEmailHelper(to, payload);
  }

  async sendSubebOfficerWelcomeEmail(
    to: string,
    payload: SubebOfficerWelcomeEmailPayload,
  ): Promise<void> {
    return sendSubebOfficerWelcomeEmailHelper(to, payload);
  }
}


