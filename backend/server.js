require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const apiRoutes = require('./routes/api');
const { pollEmails } = require('./emailPoller');

const app = express();
const PORT = process.env.PORT || 5000;
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL_MINUTES) || 5;

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// Gmail OAuth callback (top-level route)
app.get('/auth/callback', (req, res) => {
  res.redirect(`/api/auth/callback?${new URLSearchParams(req.query)}`);
});

// ─── Start Cron Job (every N minutes) ─────────────────────────────────────
const startCronJob = () => {
  // Run immediately on startup
  console.log('🚀 Running initial email poll...');
  pollEmails().catch(console.error);

  // Schedule recurring poll
  const cronExpression = `*/${POLL_INTERVAL} * * * *`;
  cron.schedule(cronExpression, () => {
    console.log(`\n⏰ Scheduled poll triggered (every ${POLL_INTERVAL} minutes)`);
    pollEmails().catch(console.error);
  });

  console.log(`📅 Email polling scheduled every ${POLL_INTERVAL} minutes`);
};

// ─── Start Server ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n');
  console.log('╔════════════════════════════════════════╗');
  console.log(`║   ${process.env.APP_NAME} Email Agent        ║`);
  console.log('╠════════════════════════════════════════╣');
  console.log(`║  Server:  http://localhost:${PORT}          ║`);
  console.log(`║  Poll:    Every ${POLL_INTERVAL} minutes              ║`);
  console.log(`║  Forward: ${process.env.COMPLAINT_FORWARD_EMAIL} ║`);
  console.log('╚════════════════════════════════════════╝');
  console.log('\n');

  // Validate required env vars
  const required = ['GEMINI_API_KEY', 'GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REFRESH_TOKEN'];
  const missing = required.filter((k) => !process.env[k] || process.env[k].includes('your_'));

  if (missing.length > 0) {
    console.warn('⚠️  Missing environment variables:', missing.join(', '));
    console.warn('   → Server started but email polling is disabled until credentials are set');
    console.warn('   → Visit http://localhost:5000/api/auth/gmail-url to set up Gmail OAuth\n');
  } else {
    startCronJob();
  }
});

module.exports = app;
