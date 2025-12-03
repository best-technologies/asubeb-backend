import { SendMailProps } from './mail-provider.interface';
export declare function sendWithResend({ to, subject, html }: SendMailProps): Promise<void>;
