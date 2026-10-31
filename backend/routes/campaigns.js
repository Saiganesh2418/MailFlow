const express = require('express');
const authMiddleware = require('../middleware/auth');
const db = require('../lib/db');

const router = express.Router();
const demoCampaigns = [];

// GET /api/campaigns/stats/summary
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    if (!db.isConnected()) {
      const mine = demoCampaigns.filter(c => c.user_id === req.user.id);
      return res.json({ campaigns: mine.length, emails_sent: 0, successful: 0, failed: 0 });
    }

    const campaigns = await db.query('campaigns', { user_id: req.user.id });
    const ids = campaigns.map(c => c.id);

    if (ids.length === 0)
      return res.json({ campaigns: 0, emails_sent: 0, successful: 0, failed: 0 });

    let all = [];
    for (const id of ids) {
      const rows = await db.query('campaign_recipients', { campaign_id: id });
      all = all.concat(rows);
    }

    return res.json({
      campaigns:    campaigns.length,
      emails_sent:  all.length,
      successful:   all.filter(r => r.status === 'sent').length,
      failed:       all.filter(r => r.status === 'failed').length,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/campaigns
router.get('/', authMiddleware, async (req, res) => {
  try {
    const campaigns = await db.query('campaigns', { user_id: req.user.id });
    return res.json({ campaigns });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/campaigns
router.post('/', authMiddleware, async (req, res) => {
  const { name, subject, body, sender_name, contacts } = req.body;
  if (!name || !subject || !body)
    return res.status(400).json({ error: 'name, subject, and body are required' });

  try {
    if (!db.isConnected()) {
      const campaign = {
        id: 'demo-' + Date.now(),
        user_id: req.user.id, name, subject, body, sender_name,
        status: 'draft', contacts: contacts || [],
        created_at: new Date().toISOString(),
      };
      demoCampaigns.push(campaign);
      return res.json({ campaign });
    }

    const campaign = await db.insert('campaigns', {
      user_id: req.user.id, name, subject, body,
      sender_name: sender_name || '', status: 'draft',
    });

    if (contacts && contacts.length > 0) {
      const isMySQL = process.env.DB_TYPE === 'mysql';
      const recipients = contacts.map(c => ({
        campaign_id: campaign.id,
        name: c.name || '',
        email: c.email || '',
        company: c.company || '',
        data: isMySQL ? JSON.stringify(c) : c, // stores full custom fields dynamically
        status: 'pending',
      }));

      try {
        await db.insertMany('campaign_recipients', recipients);
      } catch (insertErr) {
        // Fallback if data column hasn't been added yet in user's DB
        const basicRecipients = contacts.map(c => ({
          campaign_id: campaign.id,
          name: c.name || '',
          email: c.email || '',
          company: c.company || '',
          status: 'pending',
        }));
        await db.insertMany('campaign_recipients', basicRecipients);
      }
    }

    return res.json({ campaign });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/campaigns/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    if (!db.isConnected()) {
      const campaign = demoCampaigns.find(c => c.id === req.params.id && c.user_id === req.user.id);
      if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
      return res.json({ campaign, recipients: campaign.contacts || [] });
    }

    const campaign = await db.queryOne('campaigns', { id: req.params.id, user_id: req.user.id });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const recipients = await db.query('campaign_recipients', { campaign_id: req.params.id });
    return res.json({ campaign, recipients });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
