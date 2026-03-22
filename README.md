# Team Tracfone Email Agent

An AI-powered email agent that automatically categorizes and responds to customer emails using **Gemini 2.0 Flash** and **Gmail API**.

---

## Features

| Category | Behavior |
|----------|----------|
| **Feedback (Positive)** | Sends a warm thank-you response |
| **Feedback (Negative)** | Apologizes and promises improvement |
| **Query** | Scrapes tracfone.com and answers with relevant info |
| **Complaint** | Apologizes + forwards email to aakritirampal2209@gmail.com |

---

## Quick Start

### Step 1 — Get a Gemini API Key (Free)

1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with Google → Click **"Create API Key"**
3. Copy the key — you'll need it in `.env`

---

### Step 2 — Set Up Gmail API (Free)

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (e.g. "Tracfone Email Agent")
3. Go to **APIs & Services → Library**
4. Search for **"Gmail API"** → Enable it
5. Go to **APIs & Services → Credentials**
6. Click **"Create Credentials" → "OAuth 2.0 Client IDs"**
7. Application type: **Web application**
8. Add Authorized redirect URI: `http://localhost:5000/api/auth/callback`
9. Download the credentials (or copy Client ID and Client Secret)

---

### Step 3 — Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GMAIL_CLIENT_ID=your_client_id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your_client_secret_here
GMAIL_REDIRECT_URI=http://localhost:5000/api/auth/callback
APP_EMAIL=your_gmail@gmail.com
DASHBOARD_PASSWORD=your_chosen_password
```

---

### Step 4 — Get Gmail Refresh Token

```bash
cd backend
npm install
node server.js
```

Then visit: [http://localhost:5000/api/auth/gmail-url](http://localhost:5000/api/auth/gmail-url)

- Copy the URL → Open in browser → Authorize with your Gmail account
- You'll be redirected and shown your **GMAIL_REFRESH_TOKEN**
- Copy it into your `.env` file

---

### Step 5 — Restart & Run

```bash
# Terminal 1 — Backend
cd backend
npm start

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → Enter your dashboard password.

---

## Project Structure

```
tracfone-email-agent/
├── backend/
│   ├── server.js             # Express + cron scheduler (every 5 min)
│   ├── gmailService.js       # Gmail OAuth2 — read/send/markAsRead
│   ├── emailCategorizer.js   # Gemini AI — categorize emails
│   ├── responseGenerator.js  # Gemini AI — generate replies
│   ├── webScraper.js         # Scrape tracfone.com for query answers
│   ├── emailPoller.js        # Master pipeline orchestrator
│   ├── emailStore.js         # In-memory store + stats
│   └── routes/api.js         # REST API endpoints
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── pages/
│       │   ├── Login.jsx     # Password-protected login
│       │   └── Dashboard.jsx # Main monitoring dashboard
│       └── components/
│           ├── EmailList.jsx    # Filterable email list
│           ├── EmailDetail.jsx  # Full email + AI response viewer
│           ├── StatsCard.jsx    # Metric cards
│           └── Badges.jsx       # Category/status badges
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Dashboard login |
| GET | `/api/stats` | Email statistics |
| GET | `/api/emails?filter=all&page=1` | List emails |
| GET | `/api/poll-status` | Agent status |
| POST | `/api/poll-now` | Trigger manual poll |
| GET | `/api/health` | Health check |
| GET | `/api/auth/gmail-url` | Get Gmail OAuth URL |
| GET | `/api/auth/callback` | Gmail OAuth callback |

---

## Free Tier Limits

| Service | Free Limit |
|---------|-----------|
| Gemini 2.0 Flash | 1,500 requests/day, 15 req/min |
| Gmail API | 250 quota units/user/second |
| Web Scraping | Unlimited (no API) |

---

## Production Deployment

For production, replace the in-memory `emailStore.js` with a database:
- **MongoDB** (free tier on Atlas) — recommended
- **PostgreSQL** (free tier on Supabase or Railway)

Deploy backend to **Railway**, **Render**, or **Fly.io** (all have free tiers).
Deploy frontend to **Vercel** or **Netlify** (free).
