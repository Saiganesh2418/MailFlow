const express = require('express');
const authMiddleware = require('../middleware/auth');
const { sendMail, personalize, isValidEmail } = require('../lib/mailer');
const db = require('../lib/db');

const router = express.Router();

// Small helper to pause between sending to prevent rate limits
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// POST /api/email/test — Sends ONLY 1 single test email
router.post('/test', authMiddleware, async (req, res) => {
  const { to, subject, body, senderName, contact } = req.body;
  if (!to || !subject || !body)
    return res.status(400).json({ error: 'to, subject, and body are required' });
  if (!isValidEmail(to))
    return res.status(400).json({ error: 'Invalid email address' });

  try {
    const testSubject = `[TEST] ${personalize(subject, contact || { name: 'Test User' })}`;
    const personalizedBody = personalize(body, contact || { name: 'Test User' });

    const banner = `<div style="background:#fff3cd;padding:10px 14px;margin-bottom:16px;border-left:4px solid #ffc107;font-family:sans-serif;font-size:13px;color:#856404;border-radius:4px;">
      ⚠ This is a <strong>TEST PREVIEW</strong> from MailFlow.
    </div>`;

    const testBody = personalizedBody.includes('<body') || personalizedBody.includes('<html')
      ? personalizedBody.replace(/<body[^>]*>/i, `$&${banner}`)
      : `${banner}${personalizedBody}`;

    console.log(`[TEST] Sending 1 test email to: ${to}`);

    await sendMail({
      to,
      subject: testSubject,
      html: testBody,
      fromName: senderName || 'MailFlow',
    });

    console.log(`✓ [TEST] Successfully delivered test to ${to}`);
    return res.json({ success: true, message: 'Test email sent successfully' });
  } catch (err) {
    console.error('Test email send error:', err);
    return res.status(500).json({
      error: err.message || "Failed to send test email.",
      detail: err.response || err.toString(),
    });
  }
});

// POST /api/email/send — Sends to ALL contacts in campaign
router.post('/send', authMiddleware, async (req, res) => {
  const { campaignId, contacts, subject, body, senderName } = req.body;

  if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
    return res.status(400).json({ error: 'No contacts provided in request.' });
  }

  console.log(`[CAMPAIGN START] Dispatching campaign to ${contacts.length} recipients...`);

  const results = [];

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];

    if (!contact || !contact.email || !isValidEmail(contact.email)) {
      results.push({
        email: contact?.email || 'unknown',
        name: contact?.name || '—',
        status: 'failed',
        error: 'Invalid or missing email address',
      });
      continue;
    }

    try {
      const personalizedSubject = personalize(subject, contact);
      const personalizedBody    = personalize(body, contact);

      console.log(`[SENDING ${i + 1}/${contacts.length}] Sending to: ${contact.email}`);

      await sendMail({
        to: contact.email,
        subject: personalizedSubject,
        html: personalizedBody,
        fromName: senderName || 'MailFlow',
      });

      console.log(`✓ Delivered to ${contact.email}`);
      results.push({ email: contact.email, name: contact.name, status: 'sent' });

      if (db.isConnected() && campaignId) {
        await db.update(
          'campaign_recipients',
          { status: 'sent', sent_at: new Date().toISOString() },
          { campaign_id: campaignId, email: contact.email }
        ).catch(() => {});
      }

      // Small 250ms spacing between emails to stay within SMTP provider rate limits
      if (i < contacts.length - 1) {
        await sleep(250);
      }
    } catch (err) {
      console.error(`✗ Error sending to ${contact.email}:`, err.message);
      results.push({
        email: contact.email,
        name: contact.name,
        status: 'failed',
        error: err.message || 'SMTP delivery rejected',
      });

      if (db.isConnected() && campaignId) {
        await db.update(
          'campaign_recipients',
          { status: 'failed', error_message: err.message },
          { campaign_id: campaignId, email: contact.email }
        ).catch(() => {});
      }
    }
  }

  if (db.isConnected() && campaignId) {
    await db.update('campaigns', { status: 'completed' }, { id: campaignId }).catch(() => {});
  }

  const sent   = results.filter(r => r.status === 'sent').length;
  const failed = results.filter(r => r.status === 'failed').length;

  console.log(`[CAMPAIGN COMPLETE] Total: ${results.length} | Sent: ${sent} | Failed: ${failed}`);

  return res.json({ results, sent, failed, total: results.length });
});

// POST /api/email/ai
router.post('/ai', authMiddleware, async (req, res) => {
  const { prompt, action, currentContent } = req.body;

  const hasKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  if (!hasKey)
    return res.status(503).json({ error: 'AI API key not configured. Set GEMINI_API_KEY in .env' });

  const actions = {
    generate:     'You are a professional email copywriter. Write a clear, personalized email. Use {{name}}, {{email}}, {{company}} placeholders where appropriate. Return only the plain-text or HTML email body.',
    improve:      'Improve the following email to be more compelling and professional. Return only the improved email body.',
    shorten:      'Shorten the following email. Keep it concise. Return only the shortened email body.',
    professional: 'Rewrite in a formal, professional tone. Return only the email body.',
    friendly:     'Rewrite in a warm, friendly tone. Return only the email body.',
    grammar:      'Fix grammar and spelling errors. Return only the corrected email body.',
  };

  const systemPrompt = actions[action] || actions.generate;
  const userPrompt   = action === 'generate'
    ? (prompt || 'Write a professional email.')
    : `${currentContent}\n\nInstruction: ${prompt || ''}`;

  try {
    if (process.env.GEMINI_API_KEY) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          }),
        }
      );
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return res.json({ content: text });
    }

    if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user',   content: userPrompt },
          ],
          max_tokens: 800,
        }),
      });
      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content || '';
      return res.json({ content: text });
    }
  } catch (err) {
    return res.status(500).json({ error: 'AI generation failed: ' + err.message });
  }
});

module.exports = router;
