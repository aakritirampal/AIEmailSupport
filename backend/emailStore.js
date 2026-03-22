// ─── In-Memory Email Store ─────────────────────────────────────────────────
// In production, replace this with a database (MongoDB, PostgreSQL, etc.)

const emailStore = {
  emails: [],
  stats: {
    total: 0,
    feedback: 0,
    query: 0,
    complaint: 0,
    positive: 0,
    negative: 0,
    responded: 0,
    failed: 0,
  },
};

// ─── Add a processed email ─────────────────────────────────────────────────
const addEmail = (emailData) => {
  const entry = {
    id: emailData.id,
    threadId: emailData.threadId,
    from: emailData.from,
    subject: emailData.subject,
    date: emailData.date,
    snippet: emailData.snippet,
    body: emailData.body,
    category: emailData.category,
    sentiment: emailData.sentiment,
    summary: emailData.summary,
    keyIssue: emailData.keyIssue,
    urgency: emailData.urgency,
    responseSubject: emailData.responseSubject,
    responseBody: emailData.responseBody,
    status: emailData.status, // 'responded' | 'failed' | 'forwarded'
    processedAt: new Date().toISOString(),
    forwardedTo: emailData.forwardedTo || null,
  };

  // Avoid duplicates
  const exists = emailStore.emails.find((e) => e.id === entry.id);
  if (!exists) {
    emailStore.emails.unshift(entry); // newest first
    updateStats(entry);
  }

  return entry;
};

// ─── Update Stats ──────────────────────────────────────────────────────────
const updateStats = (entry) => {
  emailStore.stats.total++;

  const cat = entry.category?.toLowerCase();
  if (cat === 'feedback') emailStore.stats.feedback++;
  else if (cat === 'query') emailStore.stats.query++;
  else if (cat === 'complaint') emailStore.stats.complaint++;

  if (entry.sentiment === 'positive') emailStore.stats.positive++;
  else if (entry.sentiment === 'negative') emailStore.stats.negative++;

  if (entry.status === 'responded' || entry.status === 'forwarded') {
    emailStore.stats.responded++;
  } else if (entry.status === 'failed') {
    emailStore.stats.failed++;
  }
};

// ─── Get all emails (paginated) ────────────────────────────────────────────
const getEmails = (page = 1, limit = 20, filter = 'all') => {
  let filtered = emailStore.emails;

  if (filter !== 'all') {
    filtered = emailStore.emails.filter(
      (e) => e.category?.toLowerCase() === filter.toLowerCase()
    );
  }

  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return {
    emails: paginated,
    total: filtered.length,
    page,
    totalPages: Math.ceil(filtered.length / limit),
  };
};

// ─── Get stats ─────────────────────────────────────────────────────────────
const getStats = () => ({ ...emailStore.stats });

// ─── Check if email already processed ─────────────────────────────────────
const isProcessed = (emailId) => {
  return emailStore.emails.some((e) => e.id === emailId);
};

module.exports = { addEmail, getEmails, getStats, isProcessed };
