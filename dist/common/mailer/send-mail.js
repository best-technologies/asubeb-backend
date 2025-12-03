"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = sendMail;
exports.sendStudentResultEmail = sendStudentResultEmail;
exports.sendSubebOfficerWelcomeEmail = sendSubebOfficerWelcomeEmail;
const gmail_provider_1 = require("./providers/gmail.provider");
const sendgrid_provider_1 = require("./providers/sendgrid.provider");
const resend_provider_1 = require("./providers/resend.provider");
const student_result_template_1 = require("../helpers/email-templates/student-result.template");
const subeb_officer_welcome_template_1 = require("../helpers/email-templates/subeb-officer-welcome.template");
async function sendMail({ to, subject, html }) {
    const provider = (0, gmail_provider_1.getEmailProvider)();
    try {
        if (provider === 'sendgrid') {
            await (0, sendgrid_provider_1.sendWithSendGrid)({ to, subject, html });
        }
        else if (provider === 'resend') {
            await (0, resend_provider_1.sendWithResend)({ to, subject, html });
        }
        else {
            await (0, gmail_provider_1.sendWithGmail)({ to, subject, html });
        }
    }
    catch (error) {
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
        throw new Error(`Failed to send email to ${to}: ${error?.message || 'Unknown error'}. ` +
            `Error code: ${error?.code || 'N/A'}, Response: ${error?.response || 'N/A'}`);
    }
}
async function sendStudentResultEmail(to, payload) {
    const html = (0, student_result_template_1.studentResultEmailTemplate)(payload);
    await sendMail({ to, subject: `Student Result - ${payload.studentName} (${payload.sessionName} - ${payload.termName})`, html });
}
async function sendSubebOfficerWelcomeEmail(to, payload) {
    const html = (0, subeb_officer_welcome_template_1.subebOfficerWelcomeEmailTemplate)(payload);
    await sendMail({ to, subject: 'Welcome to ASUBEB Platform (SUBEB Officer)', html });
}
//# sourceMappingURL=send-mail.js.map