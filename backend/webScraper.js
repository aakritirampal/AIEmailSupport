const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://www.tracfone.com';
const SUPPORT_URL = 'https://www.tracfone.com/support';

// ─── Scrape Tracfone Pages for Relevant Content ────────────────────────────
const scrapeTracfoneForQuery = async (query) => {
  try {
    const results = [];

    // Try to scrape the main support page
    const supportContent = await scrapePage(SUPPORT_URL);
    if (supportContent) results.push(supportContent);

    // Try homepage for general info
    const homeContent = await scrapePage(BASE_URL);
    if (homeContent) results.push(homeContent);

    // Try FAQ page
    const faqContent = await scrapePage(`${BASE_URL}/faq`);
    if (faqContent) results.push(faqContent);

    if (results.length === 0) {
      return getStaticFallback(query);
    }

    // Combine and filter content relevant to the query
    const combined = results.join('\n\n');
    return filterRelevantContent(combined, query);
  } catch (error) {
    console.error('Scraping error:', error.message);
    return getStaticFallback(query);
  }
};

// ─── Scrape a Single Page ──────────────────────────────────────────────────
const scrapePage = async (url) => {
  try {
    const response = await axios.get(url, {
      timeout: 8000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    const $ = cheerio.load(response.data);

    // Remove non-content elements
    $('script, style, nav, footer, header, .cookie-banner, .popup').remove();

    // Extract meaningful text
    const textContent = [];

    // Grab headings and paragraphs
    $('h1, h2, h3, p, li, .faq-question, .faq-answer, [class*="support"], [class*="help"]').each(
      (_, el) => {
        const text = $(el).text().trim();
        if (text.length > 20 && text.length < 500) {
          textContent.push(text);
        }
      }
    );

    return textContent.slice(0, 30).join('\n');
  } catch {
    return null;
  }
};

// ─── Filter content relevant to the query ─────────────────────────────────
const filterRelevantContent = (content, query) => {
  const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const lines = content.split('\n');

  const scored = lines.map((line) => {
    const lineLower = line.toLowerCase();
    const score = queryWords.reduce((acc, word) => {
      return acc + (lineLower.includes(word) ? 1 : 0);
    }, 0);
    return { line, score };
  });

  const relevant = scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((item) => item.line);

  return relevant.length > 0 ? relevant.join('\n') : getStaticFallback(query);
};

// ─── Static Fallback Knowledge Base ───────────────────────────────────────
const getStaticFallback = (query) => {
  const lowerQuery = query.toLowerCase();

  const knowledgeBase = {
    plan: `
TracFone offers several prepaid wireless plans:
- Basic Plans: Airtime cards starting from $9.99 (30 days)
- Smartphone Plans: Starting from $20/month with data included
- Annual Plans: Cost-effective yearly options available
- BYOP (Bring Your Own Phone) plans available
Visit tracfone.com/shop/plans for current pricing and availability.
    `,
    data: `
TracFone data options:
- Data-only add-ons available in various sizes (1GB, 2GB, 5GB)
- Data rollover available when you renew before expiration
- High-speed LTE data on compatible devices
- Mobile hotspot available on select plans
    `,
    activation: `
To activate your TracFone service:
1. Visit tracfone.com/activate or call 1-800-867-7183
2. Enter your phone's serial number (IMEI/MEID)
3. Choose or enter your SIM card number
4. Select your plan and complete payment
5. Follow the on-screen instructions to complete activation
    `,
    byop: `
TracFone's Bring Your Own Phone (BYOP) program:
- Compatible with most GSM and CDMA unlocked phones
- Check compatibility at tracfone.com/byop
- SIM kits available at retail stores or online
- Keep your current number (number transfer available)
    `,
    refill: `
To refill your TracFone:
- Online: tracfone.com/refill
- TracFone app on iOS or Android
- Retail stores (Walmart, Target, CVS, etc.)
- Call 1-800-867-7183
- Auto-refill available to never lose service
    `,
    coverage: `
TracFone Coverage:
- TracFone uses America's largest networks (Verizon, AT&T, T-Mobile)
- Coverage varies by device and location
- Check your coverage at tracfone.com/coverage-map
- Both 4G LTE and 5G available on select devices and plans
    `,
    default: `
TracFone Wireless offers prepaid phone plans with no annual contracts.
For detailed information, please visit tracfone.com or call customer support at 1-800-867-7183.
Support hours: Mon-Sun 8am-11:45pm EST
    `,
  };

  for (const [key, value] of Object.entries(knowledgeBase)) {
    if (lowerQuery.includes(key)) return value;
  }

  return knowledgeBase.default;
};

module.exports = { scrapeTracfoneForQuery };
