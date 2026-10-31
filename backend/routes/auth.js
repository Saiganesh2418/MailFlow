const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../lib/db');

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email, and password are required' });

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    if (db.isConnected()) {
      const existing = await db.queryOne('users', { email });
      if (existing) return res.status(409).json({ error: 'Email already registered' });

      const user = await db.insert('users', { name, email, password_hash: passwordHash });
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET, { expiresIn: '7d' }
      );
      return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    }

    // Demo mode (no DB)
    const mockUser = { id: 'demo-1', name, email };
    const token = jwt.sign(mockUser, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
    return res.json({ token, user: mockUser });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    if (db.isConnected()) {
      const user = await db.queryOne('users', { email });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET, { expiresIn: '7d' }
      );
      return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    }

    // Demo mode
    const mockUser = { id: 'demo-1', name: 'Saiganesh', email };
    const token = jwt.sign(mockUser, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
    return res.json({ token, user: mockUser });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
