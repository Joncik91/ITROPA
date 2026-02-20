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
- **Advanced Cross-Pollination** - Combine industries using 5 systematic strategies:
  - Additive Integration (side-by-side combination)
  - Substitution (replace core components)
  - Complementary (fill gaps)
  - Sequential Enablement (one enables the other)
  - Contradiction Synthesis (resolve conflicts)
  - Synergy scoring and novelty ratings for each combination
- **Sophisticated Mechanism Extraction** - Analyze mechanisms through 5 analytical frameworks:
  - Functional Decomposition (what it does, why it's essential)
  - Structural Analysis (how components interact)
  - Causal Chain Mapping (cause-effect sequences)
  - Constraint-Opportunity Analysis (leveraging limitations)
  - Scale-Context Transfer (how it scales across contexts)
  - Transfer potential scores and maturity ratings
  - Enhanced historical applications with success factors
  - Actionable untapped domain recommendations with barriers & adaptations
- **AI-Powered Pattern Recognition** - Identify recurring patterns across needs with 5 frameworks:
  - Frequency & Distribution (where patterns appear, hot/cold zones)
  - Need-Mapping (how patterns serve different needs)
  - Evolution Trajectory (historical progression, next-stage predictions)
  - Combination Synergies (compatible patterns, optimal stacks)
  - Transfer Potential (expansion opportunities with actionable roadmaps)
  - Strength, universality, maturity, and adoption rate metrics
  - Strategic implications and risk assessments
- **Enhanced Prior Art Analysis** - Transform basic research into competitive intelligence with 5 frameworks:
  - Competitive Landscape Mapping (market segments, leader profiles, dynamics)
  - Gap Analysis (unmet needs, underserved segments, white spaces)
  - Evolution Pattern Recognition (timeline, future stages, disruptive triggers)
  - Innovation Potential Assessment (incremental/adjacent/breakthrough opportunities)
  - Strategic Positioning Recommendations (strategies, differentiation, entry tactics)
  - Competitive intensity, market maturity, innovation opportunity, and white space metrics
  - Categorical ratings: entry barriers, competitive structure, innovation pace, satisfaction
  - Actionable strategic insights for entrepreneurs, investors, and product managers
- **Inspiration Chain Visualization** - Analyze innovation genealogy and evolution with 5 frameworks:
  - Lineage Tracing (generation depth, branching points, evolutionary pathways, ancestor influence)
  - Influence Mapping (central nodes, inspiration sources, influence flows, network density)
  - Divergence Patterns (branching strategy, diversity scores, novelty hotspots, convergence points)
  - Innovation Velocity (speed metrics, acceleration zones, stagnation detection, maturity curves)
  - Coherence Assessment (logical gaps, strong/weak connections, thematic clusters)
  - Chain complexity, innovation potential, and strategic value metrics
  - Per-expression analysis showing role in overall innovation network
  - Visual analytics revealing leverage points and optimization opportunities
- Deep dive into market analysis
- Extract transferable mechanisms with quantified metrics

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
- Google Gemini AI (2.5-flash)
- Lucide React Icons
- Vercel Serverless Functions
