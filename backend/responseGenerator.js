const { GoogleGenerativeAI } = require('@google/generative-ai');
const { scrapeTracfoneForQuery } = require('./webScraper');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const APP_NAME = process.env.APP_NAME || 'Team Tracfone';

// ─── Master Response Generator ─────────────────────────────────────────────
const generateResponse = async (email, categorization) => {
  const { category, sentiment } = categorization;

  switch (category) {
    case 'Feedback':
      return generateFeedbackResponse(email, sentiment);
    case 'Query':
      return generateQueryResponse(email);
    case 'Complaint':
      return generateComplaintResponse(email);
    default:
      return generateQueryResponse(email);
  }
};

// ─── Feedback Response ─────────────────────────────────────────────────────
const generateFeedbackResponse = async (email, sentiment) => {
  const isPositive = sentiment === 'positive';

  const prompt = isPositive
    ? `
You are a friendly customer support representative for ${APP_NAME}, a prepaid wireless service.

A customer has sent POSITIVE feedback. Write a warm, genuine thank-you email response.

Guidelines:
- Express sincere gratitude for taking time to share feedback
- Acknowledge their specific positive experience if mentioned
- Mention you're committed to continuing to provide great service
- Keep it warm, personal, and concise (3-4 short paragraphs max)
- End with a friendly closing
- Do NOT use generic corporate language
- Sign off as "${APP_NAME} Support Team"

Customer's original email:
Subject: ${email.subject}
Message: ${email.body}

Write ONLY the email body, no subject line, no JSON.
`
    : `
You are a professional, empathetic customer support representative for ${APP_NAME}, a prepaid wireless service.

A customer has sent NEGATIVE feedback. Write a sincere apology email response.

Guidelines:
- Sincerely apologize for the issue mentioned
- Acknowledge their specific concerns (mention what they said)
- Assure them you are taking their feedback seriously and will work to improve
- Mention the team is actively working on improvements
- Offer them to reach out directly if they need further assistance
- Keep it professional yet human (3-4 short paragraphs max)
- Do NOT make excuses or be defensive
- Sign off as "${APP_NAME} Support Team"

Customer's original email:
Subject: ${email.subject}
Message: ${email.body}

Write ONLY the email body, no subject line, no JSON.
`;

  try {
    const result = await model.generateContent(prompt);
    return {
      body: result.response.text().trim(),
      subject: isPositive
        ? `Re: ${email.subject} - Thank You for Your Feedback!`
        : `Re: ${email.subject} - We're Sorry to Hear This`,
    };
  } catch (error) {
    console.error('❌ Gemini error (feedback response):', error.message, error.status || '');
    throw error;
  }
};

// ─── Query Response ────────────────────────────────────────────────────────
const generateQueryResponse = async (email) => {
  // First, scrape Tracfone website for relevant info
  const scrapedInfo = await scrapeTracfoneForQuery(email.body + ' ' + email.subject);

  const prompt = `
You are a knowledgeable customer support representative for ${APP_NAME}, a prepaid wireless service.

A customer has a question/query. Answer it using the website information provided below.

Guidelines:
- Answer their specific question directly and clearly
- Use the website info provided to give accurate details
- If the info doesn't fully cover their question, provide what you know and direct them to tracfone.com or call 1-800-867-7183
- Be helpful, clear, and concise (3-4 paragraphs max)
- Use bullet points if listing multiple items
- Do NOT make up information you don't have
- Sign off as "${APP_NAME} Support Team"

Information from tracfone.com:
${scrapedInfo}

Customer's question:
Subject: ${email.subject}
Message: ${email.body}

Write ONLY the email body, no subject line, no JSON.
`;

  try {
    const result = await model.generateContent(prompt);
    return {
      body: result.response.text().trim(),
      subject: `Re: ${email.subject} - Here's the Information You Requested`,
    };
  } catch (error) {
    console.error('❌ Gemini error (query response):', error.message, error.status || '');
    throw error;
  }
};

// ─── Complaint Response ────────────────────────────────────────────────────
const generateComplaintResponse = async (email) => {
  const prompt = `
You are an empathetic, professional customer support representative for ${APP_NAME}, a prepaid wireless service.

A customer has filed a COMPLAINT. Write a sincere apology and assurance response.

Guidelines:
- Open with a genuine, heartfelt apology
- Acknowledge the specific issue they experienced
- Assure them their complaint has been escalated to the relevant team
- Tell them a specialist will be looking into this and will resolve it as soon as possible
- Provide a realistic expectation (e.g., within 24-48 hours)
- Offer an alternative contact (1-800-867-7183) for urgent matters
- Be compassionate, not robotic or corporate
- Keep it concise but thorough (3-4 paragraphs max)
- Sign off as "${APP_NAME} Support Team"

Customer's complaint:
Subject: ${email.subject}
Message: ${email.body}

Write ONLY the email body, no subject line, no JSON.
`;

  try {
    const result = await model.generateContent(prompt);
    return {
      body: result.response.text().trim(),
      subject: `Re: ${email.subject} - We Sincerely Apologize`,
    };
  } catch (error) {
    console.error('❌ Gemini error (complaint response):', error.message, error.status || '');
    throw error;
  }
};

// ─── Fallback Responses (if Gemini fails) ─────────────────────────────────
const getFallbackFeedbackResponse = (email, isPositive) => ({
  subject: isPositive
    ? `Re: ${email.subject} - Thank You!`
    : `Re: ${email.subject} - We Apologize`,
  body: isPositive
    ? `Dear Customer,\n\nThank you so much for your kind feedback! We truly appreciate you taking the time to share your experience with us.\n\nYour satisfaction is our top priority, and it's wonderful to hear that we're meeting your expectations. We'll continue to work hard to provide you with the best service possible.\n\nThank you for being a valued ${APP_NAME} customer!\n\nWarm regards,\n${APP_NAME} Support Team`
    : `Dear Customer,\n\nWe sincerely apologize for the experience you've described. Your feedback is extremely important to us, and we are sorry that we fell short of your expectations.\n\nPlease know that we take your concerns seriously and will work diligently to improve. Your feedback has been noted and shared with our team.\n\nIf you need further assistance, please don't hesitate to reach out to us at 1-800-867-7183.\n\nSincerely,\n${APP_NAME} Support Team`,
});

const getFallbackQueryResponse = (email) => ({
  subject: `Re: ${email.subject} - Response to Your Inquiry`,
  body: `Dear Customer,\n\nThank you for reaching out to ${APP_NAME}!\n\nFor the most accurate and up-to-date information regarding your query, please visit our website at tracfone.com or contact our support team directly at 1-800-867-7183 (available Mon-Sun, 8am-11:45pm EST).\n\nWe're happy to assist you with any questions you may have.\n\nBest regards,\n${APP_NAME} Support Team`,
});

const getFallbackComplaintResponse = (email) => ({
  subject: `Re: ${email.subject} - We Sincerely Apologize`,
  body: `Dear Customer,\n\nWe sincerely apologize for the inconvenience you have experienced. We understand how frustrating this must be, and we are truly sorry.\n\nYour complaint has been escalated to our specialist team, who will be reviewing and resolving your issue as soon as possible — typically within 24-48 hours.\n\nFor urgent matters, please contact us directly at 1-800-867-7183 (Mon-Sun, 8am-11:45pm EST).\n\nWe appreciate your patience and will do everything we can to make this right.\n\nSincerely,\n${APP_NAME} Support Team`,
});

module.exports = { generateResponse };
