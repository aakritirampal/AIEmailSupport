const { fetchUnreadEmails, sendEmail, markAsRead } = require('./gmailService');
const { categorizeEmail } = require('./emailCategorizer');
const { generateResponse } = require('./responseGenerator');
const { addEmail, isProcessed } = require('./emailStore');
require('dotenv').config();

let isPolling = false;
let lastPollTime = null;
let pollCount = 0;

// ─── Main Pipeline: Process a Single Email ─────────────────────────────────
const processEmail = async (email) => {
  console.log(`\n📧 Processing: "${email.subject}" from ${email.from}`);

  try {
    // Step 1: Categorize using Gemini AI
    console.log('  🤖 Categorizing...');
    const categorization = await categorizeEmail(email);
    console.log(`  📂 Category: ${categorization.category} | Sentiment: ${categorization.sentiment} | Urgency: ${categorization.urgency}`);

    // Step 2: Skip spam emails — no reply, no forwarding
    if (categorization.category === 'Spam') {
      console.log('  🚫 Spam detected — skipping reply');
      await markAsRead(email.id);
      addEmail({
        ...email,
        ...categorization,
        responseSubject: null,
        responseBody: null,
        status: 'spam_ignored',
        forwardedTo: null,
      });
      console.log(`  ✅ Spam email marked as read and ignored: "${email.subject}"`);
      return true;
    }

    // Step 3: Generate response using Gemini AI
    console.log('  ✍️  Generating response...');
    const response = await generateResponse(email, categorization);

    // Extract sender's email address
    const senderEmail = extractEmail(email.from);

    // Step 4: Send the auto-reply
    console.log(`  📤 Sending reply to ${senderEmail}...`);
    await sendEmail({
      to: senderEmail,
      subject: response.subject,
      body: response.body,
      threadId: email.threadId,
    });

    let status = 'responded';
    let forwardedTo = null;

    // Step 5: If complaint, also forward to admin
    if (categorization.category === 'Complaint') {
      const adminEmail = process.env.COMPLAINT_FORWARD_EMAIL;
      console.log(`  🚨 Complaint detected — forwarding to ${adminEmail}...`);

      await sendEmail({
        to: adminEmail,
        subject: `⚠️ [COMPLAINT] ${email.subject}`,
        body: buildForwardBody(email, categorization, response),
      });

      status = 'forwarded';
      forwardedTo = adminEmail;
      console.log(`  ✅ Forwarded to admin: ${adminEmail}`);
    }

    // Step 5: Mark original email as read
    await markAsRead(email.id);

    // Step 6: Save to store
    addEmail({
      ...email,
      ...categorization,
      responseSubject: response.subject,
      responseBody: response.body,
      status,
      forwardedTo,
    });

    console.log(`  ✅ Done processing "${email.subject}"`);
    return true;
  } catch (error) {
    console.error(`  ❌ Failed to process "${email.subject}":`, error.message);

    // Save failed attempt
    addEmail({
      ...email,
      category: 'Unknown',
      sentiment: 'neutral',
      summary: 'Processing failed',
      keyIssue: 'Error',
      urgency: 'medium',
      responseSubject: null,
      responseBody: null,
      status: 'failed',
    });

    return false;
  }
};

// ─── Poll Gmail for New Emails ─────────────────────────────────────────────
const pollEmails = async () => {
  if (isPolling) {
    console.log('⏳ Poll skipped — previous poll still running');
    return;
  }

  isPolling = true;
  lastPollTime = new Date();
  pollCount++;

  console.log(`\n🔄 Poll #${pollCount} started at ${lastPollTime.toLocaleTimeString()}`);

  try {
    const emails = await fetchUnreadEmails();
    console.log(`📬 Found ${emails.length} unread email(s)`);

    if (emails.length === 0) {
      console.log('📭 No new emails to process');
      return;
    }

    // Filter out already-processed emails
    const newEmails = emails.filter((e) => !isProcessed(e.id));
    console.log(`🆕 ${newEmails.length} new email(s) to process`);

    // Process sequentially to avoid rate limiting
    for (const email of newEmails) {
      await processEmail(email);
      // Small delay between emails to respect API limits
      await sleep(1500);
    }
  } catch (error) {
    console.error('❌ Poll error:', error.message);
  } finally {
    isPolling = false;
    console.log(`✅ Poll #${pollCount} complete`);
  }
};

// ─── Build Complaint Forward Email Body ───────────────────────────────────
const buildForwardBody = (email, categorization, response) => {
  return `
⚠️  CUSTOMER COMPLAINT — ACTION REQUIRED
${'─'.repeat(50)}

COMPLAINT DETAILS
─────────────────
From:        ${email.from}
Subject:     ${email.subject}
Date:        ${email.date}
Urgency:     ${categorization.urgency?.toUpperCase()}
Key Issue:   ${categorization.keyIssue}
Summary:     ${categorization.summary}

ORIGINAL MESSAGE
─────────────────
${email.body}

AUTO-REPLY SENT TO CUSTOMER
─────────────────────────────
Subject: ${response.subject}

${response.body}

${'─'.repeat(50)}
This is an automated notification from the ${process.env.APP_NAME} Email Agent.
Please review and take necessary action.
`.trim();
};

// ─── Helpers ───────────────────────────────────────────────────────────────
const extractEmail = (fromHeader) => {
  const match = fromHeader.match(/<(.+?)>/);
  return match ? match[1] : fromHeader.trim();
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Status for API ────────────────────────────────────────────────────────
const getPollStatus = () => ({
  isPolling,
  lastPollTime: lastPollTime?.toISOString() || null,
  pollCount,
});

module.exports = { pollEmails, getPollStatus };
