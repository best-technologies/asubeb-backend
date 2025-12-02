"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = sendMail;
exports.sendStudentResultEmail = sendStudentResultEmail;
exports.sendSubebOfficerWelcomeEmail = sendSubebOfficerWelcomeEmail;
const nodemailer = require("nodemailer");
const student_result_template_1 = require("../helpers/email-templates/student-result.template");
const subeb_officer_welcome_template_1 = require("../helpers/email-templates/subeb-officer-welcome.template");
let cachedTransporter = null;
function getTransporter() {
    if (cachedTransporter) {
        return cachedTransporter;
    }
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        throw new Error('SMTP credentials missing in environment variables');
    }
    const port = process.env.GOOGLE_SMTP_PORT ? parseInt(process.env.GOOGLE_SMTP_PORT) : 587;
    const isSecure = port === 465;
    const host = process.env.GOOGLE_SMTP_HOST || 'smtp.gmail.com';
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD
        ? `${process.env.EMAIL_PASSWORD.substring(0, 4)}****${process.env.EMAIL_PASSWORD.substring(process.env.EMAIL_PASSWORD.length - 2)}`
        : 'NOT_SET';
    console.log(`[Email Config] Creating SMTP transporter: Host=${host}, Port=${port}, Secure=${isSecure}, User=${emailUser}, Password=${emailPassword}`);
    cachedTransporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: isSecure,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
        connectionTimeout: 60000,
        socketTimeout: 60000,
        greetingTimeout: 30000,
        pool: true,
        maxConnections: 3,
        maxMessages: 100,
        retry: {
            attempts: 2,
            delay: 3000,
        },
        tls: {
            rejectUnauthorized: true,
            minVersion: 'TLSv1.2',
        },
        debug: process.env.NODE_ENV === 'development',
        logger: process.env.NODE_ENV === 'development',
    });
    return cachedTransporter;
}
async function sendMail({ to, subject, html }) {
    const transporter = getTransporter();
    const mailOptions = {
        from: {
            name: 'ASUBEB',
            address: process.env.EMAIL_USER,
        },
        to,
        subject,
        html,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        if (process.env.NODE_ENV === 'development') {
            console.log('Email sent successfully:', {
                messageId: info.messageId,
                to,
                subject,
            });
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