"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = sendMail;
exports.sendStudentResultEmail = sendStudentResultEmail;
exports.sendSubebOfficerWelcomeEmail = sendSubebOfficerWelcomeEmail;
const nodemailer = require("nodemailer");
const student_result_template_1 = require("../helpers/email-templates/student-result.template");
const subeb_officer_welcome_template_1 = require("../helpers/email-templates/subeb-officer-welcome.template");
async function sendMail({ to, subject, html }) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        throw new Error('SMTP credentials missing in environment variables');
    }
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: process.env.GOOGLE_SMTP_HOST,
        port: process.env.GOOGLE_SMTP_PORT ? parseInt(process.env.GOOGLE_SMTP_PORT) : 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    const mailOptions = {
        from: {
            name: 'ASUBEB',
            address: process.env.EMAIL_USER,
        },
        to,
        subject,
        html,
    };
    await transporter.sendMail(mailOptions);
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