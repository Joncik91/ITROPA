# ITROPA - Project Overview

## Project Identity

**Name:** ITROPA (Industry Family Tree)

**Purpose:** An interactive tool for exploring human needs and generating future industry predictions using AI

**Status:** Production-Ready

---

## About ITROPA

ITROPA is an innovative platform designed to bridge the gap between human psychology and industry innovation. It enables users to explore fundamental human needs (Belonging, Status, Mastery, Security, etc.) and systematically discover how industries can evolve to serve those needs.

### Core Vision

Rather than starting with existing industries, ITROPA inverts the question: "Given a human need, what industries could emerge to serve it?" This approach uncovers novel industry opportunities and reveals hidden connections between seemingly unrelated sectors.

---

## Architecture Overview

ITROPA follows a modern, secure architecture with clear separation of concerns:

```
User Browser → React Frontend (no secrets)
              ↓
           Vercel Deployment
              ↓
    Serverless Functions (API layer)
    - Contains API keys
    - Secures all external calls
              ↓
    Google Gemini API
    - Industry predictions
    - Pattern analysis
    - Cross-pollination strategies
```

### Multi-Part Structure

1. **Frontend Application**
   - React 18 SPA (Single Page Application)
   - Built with Vite for fast development
   - Runs entirely in the browser
   - Styled with Tailwind CSS and Framer Motion

2. **Backend API**
   - Vercel Serverless Functions
   - Protects Google Gemini API key
   - Handles all AI requests
   - Includes password protection for production

3. **Data Storage**
   - IndexedDB for local browser storage
   - No server-side database required
   - Full offline capability

---

## Technology Stack

### Frontend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.6.3 | Type-safe development |
| Vite | 7.2.7 | Build tool and dev server |
| Tailwind CSS | 3.4.1 | Styling system |
| Framer Motion | 11.0.0 | Animations and transitions |
| Lucide React | 0.344.0 | Icon library |

### Backend Stack

| Technology | Purpose |
|-----------|---------|
| Node.js + Express | API runtime |
| Vercel Functions | Serverless deployment |
| Google Generative AI | AI models (Gemini 2.5 Flash) |

### Development Tools

| Tool | Purpose |
|-----|---------|
| TypeScript | Type checking |
| PostCSS | CSS processing |
| Autoprefixer | Vendor prefixes |

---

## Key Features

- **Need Exploration**: Browse and understand fundamental human needs
- **Industry Prediction**: Generate future industry possibilities using AI
- **Prior Art Research**: Analyze existing solutions and competitive landscape
- **Pattern Recognition**: Identify recurring patterns across industries using AI frameworks
- **Cross-Pollination**: Combine industries using 5 systematic strategies
- **Mechanism Extraction**: Break down transferable mechanisms across domains
- **Inspiration Chain Analysis**: Trace innovation genealogy and evolution
- **Deep Dive Analysis**: Market analysis with competitive intelligence
- **Local Storage**: All data persisted in browser via IndexedDB

---

## Documentation Structure

Explore the other documentation files for more details:

- **[source-tree-analysis.md](./source-tree-analysis.md)** - Complete project structure and directory layout
- **[component-inventory-frontend.md](./component-inventory-frontend.md)** - UI component catalog with design system
- **[development-guide-frontend.md](./development-guide-frontend.md)** - Setup, development, and build instructions
- **[deployment-guide.md](./deployment-guide.md)** - Production deployment to Vercel with security configuration

---

## Security Model

- **API Keys**: Never exposed in browser code
- **Serverless Functions**: Handles all sensitive operations
- **Environment Variables**: Gemini API key and password stored securely in Vercel
- **Production Access**: Optional password protection via APP_PASSWORD
- **CORS Configuration**: Configured for safe cross-origin requests

---

## Getting Started

### Quick Start

1. **Install dependencies**: `npm install`
2. **Set up API key**: Copy `.env.example` to `.env` and add your Gemini API key
3. **Run dev server**: `npm run dev`
4. **Open browser**: http://localhost:5173

### Deployment

1. Install Vercel CLI: `npm install -g vercel`
2. Deploy: `vercel`
3. Configure environment variables in Vercel Dashboard
4. Redeploy: `vercel --prod`

For detailed instructions, see [deployment-guide.md](./deployment-guide.md)

---

## Project Metadata

- **Repository**: Git-managed project
- **Package Manager**: npm
- **Node.js Target**: ES2020
- **Module System**: ESNext

---

## Next Steps

1. Read [development-guide-frontend.md](./development-guide-frontend.md) to set up your development environment
2. Explore [source-tree-analysis.md](./source-tree-analysis.md) to understand the codebase structure
3. Review [component-inventory-frontend.md](./component-inventory-frontend.md) for UI component details
4. Check [deployment-guide.md](./deployment-guide.md) when ready to deploy to production
