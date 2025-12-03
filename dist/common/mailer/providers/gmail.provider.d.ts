import * as nodemailer from 'nodemailer';
import { EmailProvider, SendMailProps } from './mail-provider.interface';
export declare function getEmailProvider(): EmailProvider;
export declare function getGmailTransporter(): nodemailer.Transporter;
export declare function sendWithGmail({ to, subject, html }: SendMailProps): Promise<void>;
