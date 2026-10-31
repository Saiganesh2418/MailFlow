export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  body: string;
}

export const PRESET_TEMPLATES: EmailTemplate[] = [
  {
    id: 'internship-cert',
    name: '🎓 Internship Certificate',
    description: 'Congratulatory letter with completion status and variable tags',
    subject: 'Congratulations {{name}}! Your Internship Completion Certificate',
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #4f46e5; margin: 0; font-size: 26px;">Certificate of Completion</h1>
    <p style="color: #64748b; font-size: 14px; margin-top: 6px;">MailFlow Training & Internship Program</p>
  </div>

  <p style="font-size: 16px; color: #1e293b;">Dear <strong>{{name}}</strong>,</p>

  <p style="font-size: 15px; color: #475569; line-height: 1.6;">
    Congratulations on successfully completing your internship at <strong>{{company}}</strong>. Throughout your tenure, you demonstrated remarkable commitment, technical acumen, and passion for excellence.
  </p>

  <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 16px; margin: 20px 0; border-radius: 6px;">
    <p style="margin: 0 0 6px 0; font-size: 14px; color: #334155;"><strong>Recipient:</strong> {{name}}</p>
    <p style="margin: 0 0 6px 0; font-size: 14px; color: #334155;"><strong>Organization:</strong> {{company}}</p>
    <p style="margin: 0; font-size: 14px; color: #334155;"><strong>Email:</strong> {{email}}</p>
  </div>

  <p style="font-size: 15px; color: #475569; line-height: 1.6;">
    We wish you the very best in all your future professional endeavors!
  </p>

  <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
    <p style="margin: 0; font-size: 14px; color: #64748b;">Best regards,</p>
    <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: bold; color: #1e293b;">MailFlow Internship Team</p>
  </div>
</div>`
  },
  {
    id: 'hackathon-invite',
    name: '🚀 Event / Hackathon Invite',
    description: 'Modern card with action button and event schedule',
    subject: 'You\'re Invited, {{name}}! Join Our Hackathon',
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; overflow: hidden; padding: 32px 24px; text-align: center;">
  <span style="background: #3b82f6; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Invitation</span>
  <h1 style="font-size: 28px; margin: 16px 0 8px 0; color: #ffffff;">Innovate & Build Together</h1>
  <p style="font-size: 15px; color: #94a3b8; max-width: 480px; margin: 0 auto 24px auto; line-height: 1.5;">
    Hi {{name}}, we're thrilled to welcome members from {{company}} to join developers and designers in our upcoming national sprint.
  </p>

  <div style="background: #1e293b; border-radius: 8px; padding: 18px; margin: 24px 0; text-align: left;">
    <p style="margin: 0 0 8px 0; font-size: 14px; color: #cbd5e1;">📍 <strong>Venue:</strong> Virtual / Online</p>
    <p style="margin: 0 0 8px 0; font-size: 14px; color: #cbd5e1;">🎯 <strong>Track:</strong> AI, Web3 & Cloud Engineering</p>
    <p style="margin: 0; font-size: 14px; color: #cbd5e1;">👥 <strong>Invited Guest:</strong> {{name}} ({{email}})</p>
  </div>

  <a href="https://example.com/register" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 15px; font-weight: bold; margin-top: 12px;">Confirm Registration</a>

  <p style="font-size: 12px; color: #64748b; margin-top: 32px;">Questions? Simply reply directly to this email.</p>
</div>`
  },
  {
    id: 'product-update',
    name: '📣 Product Newsletter / Announcement',
    description: 'Clean SaaS newsletter template with feature highlight',
    subject: 'What\'s new at {{company}}, {{name}}',
    body: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; color: #334155; line-height: 1.6;">
  <div style="border-bottom: 2px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 24px;">
    <h2 style="margin: 0; color: #0f172a; font-size: 20px;">Monthly Product Digest</h2>
  </div>

  <p style="font-size: 16px; color: #1e293b;">Hello {{name}},</p>
  <p>Here are the latest tools and improvements designed to streamline your workflows at <strong>{{company}}</strong> this month:</p>

  <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #4f46e5; font-size: 16px;">⚡ Automated Campaign Workflows</h3>
    <p style="margin-bottom: 0; font-size: 14px; color: #64748b;">
      Import contacts from CSV, format emails in rich HTML or plain text, and monitor delivery in real time with our newly upgraded engine.
    </p>
  </div>

  <p>Thank you for being part of our journey.</p>
  <p style="margin-top: 24px; font-size: 14px; color: #64748b;">— The Team</p>
</div>`
  },
  {
    id: 'simple-text',
    name: '✉️ Clean Personal Letter',
    description: 'Minimal, direct outreach email with no extra styling',
    subject: 'Quick note regarding {{company}}',
    body: `<div style="font-family: Arial, sans-serif; font-size: 15px; color: #222222; line-height: 1.6;">
  <p>Hi {{name}},</p>
  <p>I wanted to reach out directly to see how things are going with your team at {{company}}.</p>
  <p>We've recently rolled out a few updates that I thought might be helpful for you. Would you be open to a quick 5-minute chat this week?</p>
  <p>Looking forward to hearing from you.</p>
  <p>Best,<br>Saiganesh</p>
</div>`
  }
];
