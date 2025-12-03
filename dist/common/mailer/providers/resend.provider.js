"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWithResend = sendWithResend;
const resend_1 = require("resend");
async function sendWithResend({ to, subject, html }) {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_USER;
    if (!apiKey) {
        throw new Error('RESEND_API_KEY is not set in environment variables');
    }
    if (!fromEmail) {
        throw new Error('RESEND_FROM_EMAIL or EMAIL_USER must be set for Resend provider');
    }
    const maskedKey = apiKey.length > 8 ? `${apiKey.substring(0, 4)}****${apiKey.substring(apiKey.length - 4)}` : 'SET';
    console.log(`[Email Config] [RESEND] Using Resend provider: From=${fromEmail}, API_KEY=${maskedKey}`);
    const resend = new resend_1.Resend(apiKey);
    const { error } = await resend.emails.send({
        from: fromEmail,
        to,
        subject,
        html,
    });
    if (error) {
        throw new Error(error.message || 'Unknown Resend error');
    }
    if (process.env.NODE_ENV === 'development') {
        console.log('[Email] [RESEND] Email sent successfully:', {
            to,
            subject,
        });
    }
}
//# sourceMappingURL=resend.provider.js.map