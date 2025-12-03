"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWithSendGrid = sendWithSendGrid;
const sgMail = require("@sendgrid/mail");
async function sendWithSendGrid({ to, subject, html }) {
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER;
    if (!apiKey) {
        throw new Error('SENDGRID_API_KEY is not set in environment variables');
    }
    if (!fromEmail) {
        throw new Error('SENDGRID_FROM_EMAIL or EMAIL_USER must be set for SendGrid provider');
    }
    const maskedKey = apiKey.length > 8 ? `${apiKey.substring(0, 4)}****${apiKey.substring(apiKey.length - 4)}` : 'SET';
    console.log(`[Email Config] [SENDGRID] Using SendGrid provider: From=${fromEmail}, API_KEY=${maskedKey}`);
    sgMail.setApiKey(apiKey);
    const msg = {
        to,
        from: fromEmail,
        subject,
        html,
    };
    const [response] = await sgMail.send(msg);
    if (process.env.NODE_ENV === 'development') {
        console.log('[Email] [SENDGRID] Email sent successfully:', {
            status: response.statusCode,
            to,
            subject,
        });
    }
}
//# sourceMappingURL=sendgrid.provider.js.map