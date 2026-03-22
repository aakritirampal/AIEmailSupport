const express = require('express');
const router = express.Router();
const { getEmails, getStats } = require('../emailStore');
const { pollEmails, getPollStatus } = require('../emailPoller');
const { getAuthUrl, getTokensFromCode } = require('../gmailService');

// ─── Auth: Login ───────────────────────────────────────────────────────────
router.post('/auth/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.DASHBOARD_PASSWORD) {
    res.json({ success: true, token: 'authenticated' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

// ─── Get Dashboard Stats ───────────────────────────────────────────────────
router.get('/stats', (req, res) => {
  res.json(getStats());
});

// ─── Get Emails (with pagination & filter) ────────────────────────────────
router.get('/emails', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const filter = req.query.filter || 'all';
  res.json(getEmails(page, limit, filter));
});

// ─── Get Poll Status ───────────────────────────────────────────────────────
router.get('/poll-status', (req, res) => {
  res.json(getPollStatus());
});

// ─── Trigger Manual Poll ───────────────────────────────────────────────────
router.post('/poll-now', async (req, res) => {
  res.json({ success: true, message: 'Poll triggered' });
  // Run in background
  pollEmails().catch(console.error);
});

// ─── Gmail OAuth Setup Endpoints ───────────────────────────────────────────
router.get('/auth/gmail-url', (req, res) => {
  try {
    const url = getAuthUrl();
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate auth URL. Check your Gmail credentials.' });
  }
});

router.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing auth code');

  try {
    const tokens = await getTokensFromCode(code);
    res.send(`
      <html>
        <body style="font-family: monospace; padding: 40px; background: #0a0a0a; color: #00ff88;">
          <h2>✅ Gmail Authentication Successful!</h2>
          <p>Add this to your <strong>.env</strong> file:</p>
          <pre style="background:#111; padding:20px; border-radius:8px; border:1px solid #00ff88;">
GMAIL_REFRESH_TOKEN=${tokens.refresh_token || 'TOKEN_NOT_RETURNED_USE_EXISTING'}
          </pre>
          <p style="color:#888">You can close this window and restart the server.</p>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('Auth failed: ' + err.message);
  }
});

// ─── Health Check ──────────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: process.env.APP_NAME,
    time: new Date().toISOString(),
    pollInterval: `${process.env.POLL_INTERVAL_MINUTES} minutes`,
  });
});

module.exports = router;
