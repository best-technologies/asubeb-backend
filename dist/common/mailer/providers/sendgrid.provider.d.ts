import { SendMailProps } from './mail-provider.interface';
export declare function sendWithSendGrid({ to, subject, html }: SendMailProps): Promise<void>;
