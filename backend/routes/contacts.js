const express = require('express');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const { isValidEmail } = require('../lib/mailer');
const authMiddleware = require('../middleware/auth');
const db = require('../lib/db');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Helper to extract email and name robustly from any CSV column headers
function extractStandardFields(row) {
  let email = '';
  let name = '';
  let company = '';

  for (const [rawKey, rawVal] of Object.entries(row)) {
    const key = rawKey.trim().toLowerCase();
    const val = typeof rawVal === 'string' ? rawVal.trim() : String(rawVal || '');

    if (!email && (key === 'email' || key === 'e-mail' || key === 'email_address' || key === 'mail')) {
      email = val;
    }
    if (!name && (key === 'name' || key === 'full_name' || key === 'fullname' || key === 'first_name' || key === 'firstname' || key === 'student_name' || key === 'recipient_name')) {
      name = val;
    }
    if (!company && (key === 'company' || key === 'organization' || key === 'org' || key === 'college' || key === 'university' || key === 'workplace')) {
      company = val;
    }
  }

  // Fallback: look for any column containing "@" if email header didn't catch it
  if (!email) {
    for (const val of Object.values(row)) {
      if (typeof val === 'string' && isValidEmail(val.trim())) {
        email = val.trim();
        break;
      }
    }
  }

  return { email, name, company };
}

// GET /api/contacts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const contacts = await db.query('contacts', { user_id: req.user.id });
    return res.json({ contacts });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/contacts/upload — dynamic CSV parser keeping all columns as variables
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const csvText = req.file.buffer.toString('utf8');
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true, // Handle UTF-8 Byte Order Mark properly so first header is clean
    });

    if (!records || records.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty or formatted incorrectly' });
    }

    // Detect all column headers from first record
    const columns = Object.keys(records[0]).map(col => col.trim()).filter(Boolean);

    const valid = [];
    const invalid = [];

    for (const rawRow of records) {
      // Clean up whitespace in row keys & values
      const cleanedRow = {};
      for (const [k, v] of Object.entries(rawRow)) {
        const cleanK = k.trim();
        cleanedRow[cleanK] = typeof v === 'string' ? v.trim() : v;
      }

      const { email, name, company } = extractStandardFields(cleanedRow);

      // Ensure name and company exist in cleanedRow even if headers were variations
      cleanedRow.name = name || cleanedRow.name || '';
      cleanedRow.email = email || cleanedRow.email || '';
      cleanedRow.company = company || cleanedRow.company || '';

      if (isValidEmail(email)) {
        valid.push(cleanedRow);
      } else {
        invalid.push({
          row: cleanedRow,
          name: name || 'Unknown',
          email: email || 'No valid email',
          reason: email ? 'Invalid email format' : 'Email column missing or empty'
        });
      }
    }

    if (db.isConnected() && valid.length > 0) {
      for (const c of valid) {
        await db.upsert(
          'contacts',
          { user_id: req.user.id, name: c.name, email: c.email, company: c.company },
          'user_id,email'
        ).catch(() => {});
      }
    }

    return res.json({
      total: records.length,
      columns,
      valid,
      invalid
    });
  } catch (err) {
    return res.status(400).json({ error: 'Failed to parse CSV: ' + err.message });
  }
});

module.exports = router;
