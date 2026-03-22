const { google } = require('googleapis');
require('dotenv').config();

// ─── OAuth2 Client Setup ───────────────────────────────────────────────────
const createOAuth2Client = () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });
  return oauth2Client;
};

// ─── Generate Auth URL (run once to get refresh token) ────────────────────
const getAuthUrl = () => {
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
    ],
    prompt: 'consent',
  });
};

// ─── Exchange code for tokens ──────────────────────────────────────────────
const getTokensFromCode = async (code) => {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

// ─── Fetch Unread Emails ───────────────────────────────────────────────────
const fetchUnreadEmails = async () => {
  try {
    const auth = createOAuth2Client();
    const gmail = google.gmail({ version: 'v1', auth });

    // Get list of unread messages
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread -from:me',
      maxResults: 20,
    });

    const messages = listResponse.data.messages || [];
    if (messages.length === 0) return [];

    // Fetch full details for each message
    const emailDetails = await Promise.all(
      messages.map(async (msg) => {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'full',
        });
        return parseEmail(detail.data);
      })
    );

    return emailDetails.filter(Boolean);
  } catch (error) {
    console.error('Error fetching emails:', error.message);
    throw error;
  }
};

// ─── Parse Raw Gmail Message ───────────────────────────────────────────────
const parseEmail = (message) => {
  try {
    const headers = message.payload.headers;
    const getHeader = (name) =>
      headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    // Extract body
    let body = '';
    const extractBody = (parts) => {
      if (!parts) return;
      for (const part of parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          body += Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (part.parts) {
          extractBody(part.parts);
        }
      }
    };

    if (message.payload.body?.data) {
      body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    } else {
      extractBody(message.payload.parts);
    }

    return {
      id: message.id,
      threadId: message.threadId,
      from: getHeader('From'),
      to: getHeader('To'),
      subject: getHeader('Subject'),
      date: getHeader('Date'),
      body: body.trim(),
      snippet: message.snippet,
    };
  } catch (err) {
    console.error('Error parsing email:', err.message);
    return null;
  }
};

// ─── Send Email ────────────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, body, replyToMessageId, threadId }) => {
  try {
    const auth = createOAuth2Client();
    const gmail = google.gmail({ version: 'v1', auth });

    const fromEmail = process.env.APP_EMAIL;
    const appName = process.env.APP_NAME || 'Team Tracfone';

    let emailLines = [
      `From: ${appName} <${fromEmail}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
    ];

    if (replyToMessageId) {
      emailLines.push(`In-Reply-To: ${replyToMessageId}`);
      emailLines.push(`References: ${replyToMessageId}`);
    }

    emailLines.push('', body);

    const rawEmail = emailLines.join('\r\n');
    const encodedEmail = Buffer.from(rawEmail)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const requestBody = { raw: encodedEmail };
    if (threadId) requestBody.threadId = threadId;

    await gmail.users.messages.send({
      userId: 'me',
      requestBody,
    });

    console.log(`✅ Email sent to: ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error;
  }
};

// ─── Mark Email as Read ────────────────────────────────────────────────────
const markAsRead = async (messageId) => {
  try {
    const auth = createOAuth2Client();
    const gmail = google.gmail({ version: 'v1', auth });

    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['UNREAD'],
      },
    });
  } catch (error) {
    console.error('Error marking as read:', error.message);
  }
};

module.exports = {
  fetchUnreadEmails,
  sendEmail,
  markAsRead,
  getAuthUrl,
  getTokensFromCode,
};
