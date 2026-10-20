# ITROPA

An interactive tool for exploring human needs and generating future industry predictions using AI.

## Setup

### Local development

```bash
npm install
cp .env.example .env      # then set ANTHROPIC_API_KEY (https://console.anthropic.com/settings/keys)
npm run dev               # http://localhost:5173
```

`npm run dev` serves the same `/api/*` handlers as production through Vite middleware, so the
API key stays server-side in development too. Data lives in the browser (IndexedDB); in dev it is
also mirrored to `local-mirror.db` (SQLite) so it survives browser storage resets.

| Variable | Required | Purpose |
|----------|----------|---------|
| `AI_PROVIDER` | no | `gemini` or `anthropic`; default: Anthropic, unless only a Gemini key is set |
| `GEMINI_API_KEY` | if Gemini | Google AI Studio key (server-side only) |
| `GEMINI_MODEL` | no | Model id, default `gemini-2.5-flash` |
| `ANTHROPIC_API_KEY` | default provider | Anthropic API key (server-side only) |
| `ANTHROPIC_MODEL` | no | Model id, default `claude-sonnet-5-5` |

Never prefix these with `VITE_`: Vite inlines `VITE_*` variables into the browser bundle.

### Checks

```bash
npm run typecheck   # app, API functions, and Vite config
npm test            # unit + IndexedDB migration tests (Vitest)
npm run check       # typecheck + test + production build
```

### Vercel deployment

1. `npm install -g vercel && vercel`
2. In Project Settings → Environment Variables, add `ANTHROPIC_API_KEY` (and optionally
   `ANTHROPIC_MODEL`; or `GEMINI_API_KEY` for Gemini) for all environments.
3. `vercel --prod`

**Security model**
- The Gemini key exists only in the serverless functions.
- There is no login: anyone who can reach the deployment can use the AI endpoints (and your Gemini
  quota). Keep the URL private, or put Vercel Deployment Protection in front if that matters.
- Request bodies are validated and bounded: prompt size, token and temperature ranges.
- No wildcard CORS. The API is same-origin only.

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

```
Browser (React SPA, IndexedDB)
   │  same-origin fetch, ≤4 concurrent, retries transient errors only
   ▼
/api/gemini · /api/ai-assistant      ← Vercel functions (prod) / Vite middleware (dev)
   │  api/_lib/core.ts: validation, provider call, error mapping
   ▼
Anthropic Messages API (default) or Google Gemini (JSON mode)
```

- **State:** `src/hooks/need-manager/*`, composed by `useNeedManager`. Async operations read the
  latest state through refs, so concurrent AI results never overwrite each other. Every tree
  mutation is persisted and undoable (Ctrl/⌘+Z, Ctrl/⌘+Y).
- **AI output:** never trusted. `src/utils/need-model.ts` and `src/utils/ai-normalizers.ts` assign
  client-side IDs and guarantee shapes before anything reaches state or storage.
- **Storage:** Dexie (IndexedDB), schema v6. The v6 migration makes legacy expression IDs globally
  unique and re-attaches cached analyses to the correct need.
- **Workspace:** open tabs and the active need are remembered per browser. Closing a tab keeps the
  need in the Library.

## Technologies

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Anthropic Claude (default `claude-sonnet-5-5`) or Google Gemini (`gemini-2.5-flash`), configurable
- Lucide React Icons
- Vercel Serverless Functions
- Dexie (IndexedDB)
- Vitest
