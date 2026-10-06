export interface SchoolItWelcomeEmailPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  schoolItId: string;
  schoolName: string;
  schoolCode?: string;
  schoolLevel?: string;
  lgaName?: string;
  officerName?: string;
  loginUrl?: string;
}

export const schoolItWelcomeEmailTemplate = (
  payload: SchoolItWelcomeEmailPayload,
): string => {
  const loginUrl = payload.loginUrl || 'http://localhost:3000/login';

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ASUBEB Platform</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; color: #1f2937;">
    <div style="max-width: 620px; margin: 30px auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      <!-- Header Banner -->
      <div style="background: linear-gradient(135deg, #14532d 0%, #15803d 50%, #22c55e 100%); padding: 28px 24px; color: #ffffff; text-align: left;">
        <h1 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 700; letter-spacing: -0.025em;">ASUBEB Student Management System</h1>
        <p style="margin: 0; opacity: 0.95; font-size: 14px; font-weight: 500;">School IT Officer Account Created</p>
      </div>

      <!-- Main Body -->
      <div style="padding: 28px 24px 24px;">
        <p style="margin: 0 0 16px 0; font-size: 15px; color: #111827;">
          Dear <strong>${payload.firstName} ${payload.lastName}</strong>,
        </p>

        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #374151;">
          We are pleased to inform you that your official account as a <strong>School IT Officer</strong> has been registered on the ASUBEB platform.
        </p>

        <!-- Assignment Information Box -->
        <div style="margin: 18px 0; padding: 16px; border-radius: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
          <h3 style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #0f172a;">
            School Assignment Details
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 4px 0; color: #64748b; width: 140px;">Assigned School:</td>
              <td style="padding: 4px 0; font-weight: 600; color: #0f172a; text-transform: capitalize;">${payload.schoolName}</td>
            </tr>
            ${payload.schoolCode ? `
            <tr>
              <td style="padding: 4px 0; color: #64748b;">School Code:</td>
              <td style="padding: 4px 0; font-weight: 600; color: #0f172a; font-family: monospace;">${payload.schoolCode}</td>
            </tr>` : ''}
            ${payload.schoolLevel ? `
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Education Level:</td>
              <td style="padding: 4px 0; font-weight: 600; color: #0f172a;">${payload.schoolLevel}</td>
            </tr>` : ''}
            ${payload.lgaName ? `
            <tr>
              <td style="padding: 4px 0; color: #64748b;">LGA Jurisdiction:</td>
              <td style="padding: 4px 0; font-weight: 600; color: #0f172a;">${payload.lgaName} LGA</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 4px 0; color: #64748b;">Your School IT ID:</td>
              <td style="padding: 4px 0; font-weight: 700; color: #15803d; font-family: monospace;">${payload.schoolItId}</td>
            </tr>
          </table>
        </div>

        <!-- Credentials Card -->
        <div style="margin: 18px 0; padding: 16px; border-radius: 8px; background-color: #f0fdf4; border: 1px solid #bbf7d0;">
          <h3 style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #14532d;">
            Your Login Credentials
          </h3>
          <p style="margin: 0 0 6px 0; font-size: 13px;">
            <strong>Email:</strong> <span style="color: #111827;">${payload.email}</span>
          </p>
          <p style="margin: 0 0 10px 0; font-size: 13px;">
            <strong>Temporary Password:</strong>
            <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background-color: #ffffff; border: 1px solid #86efac; color: #b91c1c; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 700; font-size: 14px;">
              ${payload.password}
            </span>
          </p>
          <p style="margin: 0; font-size: 12px; color: #15803d;">
            Please log in and change your temporary password immediately upon first sign-in.
          </p>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 24px 0;">
          <a href="${loginUrl}" style="display: inline-block; background-color: #15803d; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            Log in to ASUBEB Portal →
          </a>
        </div>

        <!-- Responsibilities -->
        <div style="margin: 20px 0; font-size: 13px; line-height: 1.6; color: #475569;">
          <p style="margin: 0 0 8px 0; font-weight: 600; color: #1e293b;">As School IT Officer, you can:</p>
          <ul style="margin: 0 0 0 16px; padding: 0;">
            <li style="margin-bottom: 4px;">Enroll and update student records for your assigned school.</li>
            <li style="margin-bottom: 4px;">Enter and upload continuous assessment scores and term exam results.</li>
            <li style="margin-bottom: 4px;">Submit result sheets to your LGA Exam Officer for approval.</li>
          </ul>
        </div>

        <!-- Footer Notice -->
        <p style="margin: 20px 0 0 0; font-size: 12px; line-height: 1.5; color: #6b7280; border-top: 1px solid #f1f5f9; padding-top: 14px;">
          If you did not expect this invitation or have questions about your school assignment, please contact your LGA Exam Officer or SUBEB ICT Support immediately.
        </p>

        <p style="margin: 16px 0 0 0; font-size: 12px; color: #4b5563;">
          Warm regards,<br/>
          <strong>Abia State Universal Basic Education Board (ASUBEB)</strong>
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
};
