export interface PasswordResetOtpEmailPayload {
  name: string;
  email: string;
  otp: string;
  expiresInMinutes?: number;
}

export function passwordResetOtpEmailTemplate(payload: PasswordResetOtpEmailPayload): string {
  const { name, otp, expiresInMinutes = 15 } = payload;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Recovery Code</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f9fafb;
      color: #111827;
    }
    .container {
      max-width: 560px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .header {
      background: #008751;
      padding: 32px 24px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.025em;
    }
    .content {
      padding: 36px 32px;
    }
    .otp-card {
      background: #f0fdf4;
      border: 2px dashed #008751;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin: 28px 0;
    }
    .otp-code {
      font-family: monospace;
      font-size: 38px;
      font-weight: 700;
      letter-spacing: 12px;
      color: #008751;
      margin: 0;
    }
    .footer {
      background: #f9fafb;
      padding: 24px 32px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Abia State Basic Education Board (ASUBEB)</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Password Recovery Request</p>
    </div>
    <div class="content">
      <p style="font-size: 16px; line-height: 24px; margin-top: 0;">Hello <strong>${name}</strong>,</p>
      <p style="font-size: 15px; line-height: 22px; color: #4b5563;">
        We received a request to reset the password for your ASUBEB account. Use the verification code below to complete your password reset:
      </p>
      <div class="otp-card">
        <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #065f46; margin: 0 0 8px 0; font-weight: 600;">Your 6-Digit Recovery Code</p>
        <p class="otp-code">${otp}</p>
        <p style="font-size: 12px; color: #6b7280; margin: 12px 0 0 0;">Valid for <strong>${expiresInMinutes} minutes</strong></p>
      </div>
      <p style="font-size: 13px; color: #6b7280; line-height: 20px;">
        If you did not request a password reset, please ignore this email or contact the ASUBEB ICT team immediately.
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} ASUBEB. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}
