import { transporter } from "../smtp.js";
import { buildInviteEmail } from "./templates/invite.template.js";

export async function sendInviteEmail({
  to,
  businessName,
  businessLogo,
  inviteLink,
}) {
  const { subject, html } = buildInviteEmail({
    businessName,
    businessLogo,
    inviteLink,
  });

  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}
