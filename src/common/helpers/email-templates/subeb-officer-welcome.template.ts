export interface SubebOfficerWelcomeEmailPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export const subebOfficerWelcomeEmailTemplate = (
  payload: SubebOfficerWelcomeEmailPayload,
): string => {
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; color: #1f2937;">
    <div style="max-width: 640px; margin: 24px auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #14532d 0%, #15803d 40%, #22c55e 100%); padding: 24px 24px 20px; color: white;">
        <h2 style="margin:0 0 4px 0; font-size: 22px; font-weight: 600;">ASUBEB Platform</h2>
        <p style="margin: 0; opacity: 0.9; font-size: 14px;">SUBEB Officer Account Creation</p>
      </div>
      <div style="padding: 24px 24px 20px;">
        <p style="margin: 0 0 16px 0; font-size: 14px;">Dear <strong>${payload.firstName} ${payload.lastName}</strong>,</p>

        <p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.6;">
          We are pleased to inform you that your account as a
          <strong>SUBEB Officer</strong> has been created on the ASUBEB platform.
        </p>

        <div style="margin: 16px 0; padding: 12px 14px; border-radius: 6px; background-color: #f9fafb; border: 1px solid #e5e7eb;">
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #4b5563;">Your login details are as follows:</p>
          <p style="margin: 0 0 4px 0; font-size: 13px;">
            <strong>Email:</strong> <span style="color:#111827;">${payload.email}</span>
          </p>
          <p style="margin: 0; font-size: 13px;">
            <strong>Temporary Password:</strong>
            <span style="color:#b91c1c; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">
              ${payload.password}
            </span>
          </p>
        </div>

        <p style="margin: 0 0 12px 0; font-size: 13px; line-height: 1.6;">
          For security reasons, please log in as soon as possible and change this temporary password
          to a strong, personal password.
        </p>

        <p style="margin: 0 0 12px 0; font-size: 13px; line-height: 1.6;">
          Once logged in, you will be able to:
        </p>

        <ul style="margin: 0 0 12px 20px; padding: 0; font-size: 13px; line-height: 1.6; color: #4b5563;">
          <li>View and manage academic sessions and terms for your state.</li>
          <li>Oversee grade entry and related academic records.</li>
          <li>Support data quality and reporting for basic education.</li>
        </ul>

        <p style="margin: 0 0 12px 0; font-size: 13px; line-height: 1.6;">
          If you did not expect this email, or believe it was sent to you in error,
          please contact your system administrator or the SUBEB ICT support team immediately.
        </p>

        <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">
          Kind regards,<br/>
          <span style="font-weight: 500;">ASUBEB Platform Team</span>
        </p>
      </div>
    </div>
  </div>`;
};