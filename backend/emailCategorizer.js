const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// ─── Categorize Email ──────────────────────────────────────────────────────
const categorizeEmail = async (email) => {
  const prompt = `
You are an email classification AI for Team Tracfone customer support.

Analyze this customer email and return a JSON response with:
1. "category": one of exactly ["Feedback", "Query", "Complaint", "Spam"]
2. "sentiment": one of exactly ["positive", "negative", "neutral"] (only relevant for Feedback, else "neutral")
3. "summary": a 1-sentence summary of what the email is about
4. "keyIssue": the main topic/issue in 3-5 words
5. "urgency": one of ["low", "medium", "high"]

Classification rules:
- Feedback: Customer sharing their experience, opinion, or suggestion about the service/product
- Query: Customer asking a question or requesting information about plans, services, features
- Complaint: Customer expressing dissatisfaction, reporting a problem, issue, or failure
- Spam: Unsolicited bulk email, promotional/marketing messages not related to customer support, phishing attempts, automated newsletters, or any email that is clearly not a genuine customer inquiry

Email Subject: ${email.subject}
Email Body: ${email.body}

Respond ONLY with valid JSON, no markdown, no explanation.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Strip markdown code blocks if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Validate required fields
    const validCategories = ['Feedback', 'Query', 'Complaint', 'Spam'];
    const validSentiments = ['positive', 'negative', 'neutral'];
    
    if (!validCategories.includes(parsed.category)) {
      parsed.category = 'Query'; // safe default
    }
    if (!validSentiments.includes(parsed.sentiment)) {
      parsed.sentiment = 'neutral';
    }

    return {
      category: parsed.category,
      sentiment: parsed.sentiment,
      summary: parsed.summary || 'No summary available',
      keyIssue: parsed.keyIssue || 'General inquiry',
      urgency: parsed.urgency || 'medium',
    };
  } catch (error) {
    console.error('Categorization error:', error.message);
    // Return a safe default so the system doesn't break
    return {
      category: 'Query',
      sentiment: 'neutral',
      summary: 'Could not analyze email',
      keyIssue: 'Unknown',
      urgency: 'medium',
    };
  }
};

module.exports = { categorizeEmail };
