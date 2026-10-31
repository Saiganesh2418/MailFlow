const nodemailer = require('nodemailer');

function createTransporter() {
  const port = parseInt(process.env.SMTP_PORT || '465');
  const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.resend.com',
    port: port,
    secure: isSecure, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER || 'resend',
      pass: process.env.SMTP_PASS,
    },
    // Useful timeout settings to prevent hangs
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

/**
 * Replace any variable token {{key}} dynamically from contact data.
 */
function personalize(template, contact) {
  if (!template) return '';
  if (!contact || typeof contact !== 'object') return template;

  const normalizedMap = {};
  for (const [key, value] of Object.entries(contact)) {
    const cleanKey = String(key).trim().toLowerCase();
    normalizedMap[cleanKey] = value !== undefined && value !== null ? String(value) : '';
  }

  if (!normalizedMap['name']) {
    normalizedMap['name'] = normalizedMap['first_name'] || normalizedMap['firstname'] || normalizedMap['full_name'] || normalizedMap['fullname'] || '';
  }

  return template.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/gi, (match, varName) => {
    const key = varName.trim().toLowerCase();
    return normalizedMap[key] !== undefined ? normalizedMap[key] : match;
  });
}

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Send a single email with proper 'from' format for Resend.
 * Resend strictly requires a verified domain or 'onboarding@resend.dev'.
 */
async function sendMail({ to, subject, html, fromName }) {
  const transporter = createTransporter();
  
  // Default from address: onboarding@resend.dev (or whatever EMAIL_FROM is in .env)
  const fromAddress = process.env.EMAIL_FROM || 'onboarding@resend.dev';
  const senderDisplayName = fromName || 'MailFlow';
  const formattedFrom = `"${senderDisplayName}" <${fromAddress}>`;

  const info = await transporter.sendMail({
    from: formattedFrom,
    to: to.trim(),
    subject,
    html,
  });

  return info;
}

module.exports = { sendMail, personalize, isValidEmail };
