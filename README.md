# ITROPA

An interactive tool for exploring human needs and generating future industry predictions using AI.

## Setup

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Get a Gemini API key:**
   - Visit https://aistudio.google.com/app/apikey
   - Create a new API key
   - Copy the key

3. **Configure your API key:**
   - Copy `.env.example` to `.env`
   - Replace `your_gemini_api_key_here` with your actual API key:
     ```
     GEMINI_API_KEY=your_actual_api_key
     ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - The app will be available at `http://localhost:5173`

### Vercel Deployment (Secure Remote Access)

**Important:** This app uses Vercel Serverless Functions to protect your API key. Never expose your Gemini API key in the browser.

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel
   ```

3. **Set environment variables:**
   - In Vercel Dashboard, go to: Project Settings → Environment Variables
   - Add `GEMINI_API_KEY` = `your_actual_api_key`
   - Add `APP_PASSWORD` = `your_secure_password` (for authentication)
   - Select all environments (Production, Preview, Development)

4. **Redeploy:**
   ```bash
   vercel --prod
   ```

**Security:** 
- Your API key is stored as a Vercel environment variable and only accessible by serverless functions
- Password protection is automatically enabled in production
- No authentication required for local development

## Features

- Explore human needs (Belonging, Status, Mastery, etc.)
- Research prior art from existing solutions
- Generate future industry predictions using AI
- Branch industries into sub-categories
- Cross-pollinate ideas from different industries
- Deep dive into market analysis
- Extract transferable mechanisms

## Architecture

### Secure API Design

```
Browser → Vercel Serverless Function → Google Gemini API
         (No API key)        (Has API key)      (Protected)
```

- **Frontend:** React app (no secrets)
- **Backend:** Vercel Serverless Functions (`/api` directory)
- **Storage:** IndexedDB (local browser storage)
- **API Key:** Stored as Vercel environment variable

## Technologies

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Google Gemini AI (2.0-flash-exp & 2.5-flash-lite)
- Lucide React Icons
- Vercel Serverless Functions
