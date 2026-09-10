export function buildInviteEmail({ businessName, businessLogo, inviteLink }) {
  const subject = `You're invited to join ${businessName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 24px;">
        ${
          businessLogo
            ? `<img src="${businessLogo}" alt="${businessName}" style="max-height: 60px; margin-bottom: 12px;" />`
            : ""
        }
        <h2 style="margin: 0; color: #111827;">${businessName}</h2>
      </div>
      <p style="color: #374151; font-size: 15px; line-height: 1.5;">
        You've been invited to join <strong>${businessName}</strong>. Click the button below to set your password and activate your account.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${inviteLink}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 15px; display: inline-block;">
          Accept Invitation
        </a>
      </div>
      <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
        If the button doesn't work, copy and paste this link into your browser:<br />
        <a href="${inviteLink}" style="color: #2563eb;">${inviteLink}</a>
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
        This invite link will expire in 24 hours.
      </p>
    </div>
  `;

  return { subject, html };
}
