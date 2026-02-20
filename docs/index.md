# ITROPA - Project Documentation Index

**Generated:** 2025-12-10
**Workflow:** document-project v1.2.0
**Scan Level:** Deep
**Repository Type:** Multi-part (Frontend + Backend API)

---

## Project Overview

**ITROPA** is an interactive tool for exploring human needs and generating future industry predictions using AI.

- **Type:** Multi-part application (React Frontend + Vercel Serverless API)
- **Primary Language:** TypeScript
- **Architecture:** Client-Server with AI Integration
- **Database:** IndexedDB (client-side, Dexie)
- **AI Provider:** Google Gemini (2.5-flash)

---

## Quick Reference

### Frontend (React + Vite)
- **Type:** web
- **Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Root:** `/src`
- **Entry Point:** `src/main.tsx` → `src/App.tsx`
- **Components:** 24 React components
- **Services:** API client, AI assistant, Database (Dexie)
- **Hooks:** Custom hooks for state management, keyboard shortcuts, patterns, history

### Backend API (Vercel Serverless)
- **Type:** backend
- **Tech Stack:** Vercel Serverless Functions, TypeScript, Google Generative AI SDK
- **Root:** `/api`
- **Endpoints:**
  - `/api/gemini.ts` - Main content generation (temp 0.9)
  - `/api/ai-assistant.ts` - AI assistance/chat (temp 0.7)
- **Security:** API key stored as environment variable, CORS enabled

---

## Generated Documentation

### Core Documentation
- [Project Overview](./project-overview.md) - Executive summary, architecture, features
- [Source Tree Analysis](./source-tree-analysis.md) - Complete annotated directory structure

### Frontend Documentation
- [API Contracts - Frontend](./api-contracts-frontend.md) - REST API endpoints and client architecture
- [Data Models - Frontend](./data-models-frontend.md) - IndexedDB schema (8 tables, Dexie)
- [Component Inventory - Frontend](./component-inventory-frontend.md) - 24 React components catalog
- [Development Guide - Frontend](./development-guide-frontend.md) - Setup, development workflow, best practices

### Deployment & Operations
- [Deployment Guide](./deployment-guide.md) - Vercel deployment, environment variables, security

### AI Feature Documentation
- [Cross-Pollination Algorithm](./cross-pollination-algorithm.md) - Industry combination with 5 strategies
- [Mechanism Extraction](./mechanism-extraction.md) - 5 analytical frameworks for mechanisms
- [Pattern Recognition](./pattern-recognition.md) - Recurring pattern analysis across needs
- [Prior Art Analysis](./prior-art-analysis.md) - Competitive intelligence with 5 frameworks
- [Inspiration Chain Visualization](./inspiration-chain-visualization.md) - Innovation genealogy analysis

---

## Existing Project Documentation

- [README.md](../README.md) - Main project README with setup and features
- [AI Features](./cross-pollination-algorithm.md) - Detailed AI algorithm documentation

---

## Getting Started

### For Developers

1. **Setup Development Environment**
   - Read: [Development Guide - Frontend](./development-guide-frontend.md)
   - Prerequisites: Node.js, npm
   - Install: `npm install`
   - Configure: Create `.env` with `GEMINI_API_KEY`
   - Run: `npm run dev`

2. **Understand the Architecture**
   - Read: [Project Overview](./project-overview.md)
   - Review: [Source Tree Analysis](./source-tree-analysis.md)
   - Explore: [Component Inventory](./component-inventory-frontend.md)

3. **Work with Data**
   - Schema: [Data Models - Frontend](./data-models-frontend.md)
   - 8 IndexedDB tables with Dexie
   - Local browser storage (no server sync)

4. **Integrate with AI**
   - API: [API Contracts - Frontend](./api-contracts-frontend.md)
   - Two endpoints: `/api/gemini`, `/api/ai-assistant`
   - Retry logic, error handling, dev/prod modes

### For Deployment

1. **Prepare for Production**
   - Read: [Deployment Guide](./deployment-guide.md)
   - Set environment variables: `GEMINI_API_KEY`, `APP_PASSWORD`
   - Deploy to Vercel: `vercel --prod`

2. **Security Checklist**
   - API key protection (server-side only)
   - Password authentication (production)
   - CORS configuration
   - Rate limiting via Gemini quotas

---

## Project Structure Summary

```
industry-family-tree/
├── src/                    # Frontend source (React + TypeScript)
│   ├── components/         # 24 UI components
│   ├── services/           # API client, AI assistant, DB service
│   ├── hooks/              # Custom React hooks (5)
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utilities (JSON parser, tree search, etc.)
│   ├── config/             # Theme, constants, analysis frameworks
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Entry point
├── api/                    # Backend Vercel Serverless Functions
│   ├── gemini.ts           # Main content generation endpoint
│   └── ai-assistant.ts     # AI assistant endpoint
├── docs/                   # Generated documentation (you are here)
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite bundler configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vercel.json             # Vercel deployment configuration
```

---

## Technology Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Frontend Framework** | React | 18.3.1 | UI library |
| **Build Tool** | Vite | 7.2.7 | Fast bundler with HMR |
| **Language** | TypeScript | 5.6.3 | Type-safe JavaScript |
| **Styling** | Tailwind CSS | 3.4.1 | Utility-first CSS |
| **Animation** | Framer Motion | 11.0.0 | React animation library |
| **Database** | Dexie | 4.2.1 | IndexedDB wrapper |
| **Icons** | Lucide React | 0.344.0 | Icon library |
| **AI SDK** | @google/generative-ai | 0.21.0 | Google Gemini integration |
| **Backend** | Vercel Serverless | 2.3.0 | Serverless functions |
| **Notifications** | react-hot-toast | 2.6.0 | Toast notifications |

---

## Key Features

### AI-Powered Analysis
- **Cross-Pollination** - Combine industries using 5 systematic strategies
- **Mechanism Extraction** - Analyze mechanisms through 5 analytical frameworks
- **Pattern Recognition** - Identify recurring patterns across needs with 5 frameworks
- **Prior Art Analysis** - Transform research into competitive intelligence
- **Inspiration Chain Visualization** - Analyze innovation genealogy and evolution

### User Experience
- **Interactive Tree Navigation** - Explore needs and predictions hierarchically
- **Deep Dive Analysis** - Market analysis with business opportunities
- **Library Management** - Save and load research sessions
- **Keyboard Shortcuts** - Efficient navigation (Ctrl+K for shortcuts)
- **Dark Mode** - Theme toggle for comfortable viewing
- **Export Functionality** - Export research to JSON/CSV

### Security & Deployment
- **Password Protection** - Production authentication
- **API Key Protection** - Server-side only (never exposed in browser)
- **CORS Configuration** - Secure cross-origin requests
- **Vercel Deployment** - Serverless architecture with auto-scaling

---

## Documentation Map

### By Role

**Product Manager / Analyst:**
→ Start with [Project Overview](./project-overview.md)
→ Understand features in [AI Feature Documentation](#ai-feature-documentation)
→ Review [Prior Art Analysis](./prior-art-analysis.md) for competitive intelligence

**Frontend Developer:**
→ Setup: [Development Guide](./development-guide-frontend.md)
→ Architecture: [Component Inventory](./component-inventory-frontend.md)
→ Data: [Data Models](./data-models-frontend.md)
→ API: [API Contracts](./api-contracts-frontend.md)

**Backend Developer:**
→ API: [API Contracts](./api-contracts-frontend.md)
→ Deployment: [Deployment Guide](./deployment-guide.md)
→ Architecture: [Source Tree Analysis](./source-tree-analysis.md)

**DevOps / SRE:**
→ Deployment: [Deployment Guide](./deployment-guide.md)
→ Architecture: [Project Overview](./project-overview.md)
→ Structure: [Source Tree Analysis](./source-tree-analysis.md)

---

## Next Steps for AI-Assisted Development

This documentation was generated to support **brownfield PRD creation** and **AI-assisted feature development**.

### For New Features

1. **UI-Only Features:**
   - Reference: [Component Inventory](./component-inventory-frontend.md)
   - Reference: [Development Guide](./development-guide-frontend.md)
   - Architecture: [Project Overview](./project-overview.md)

2. **API-Only Features:**
   - Reference: [API Contracts](./api-contracts-frontend.md)
   - Reference: [Deployment Guide](./deployment-guide.md)

3. **Full-Stack Features:**
   - Reference: All frontend docs + [API Contracts](./api-contracts-frontend.md)
   - Integration: [Source Tree Analysis](./source-tree-analysis.md)

### For PRD Creation

When creating a Product Requirements Document (PRD) for this brownfield project:

1. Use this **index.md** as the primary context source
2. Reference specific documentation based on feature scope
3. Include constraints from existing architecture
4. Consider data models when planning new features
5. Account for AI integration patterns already established

---

## Documentation Maintenance

**Generated By:** BMM document-project workflow
**Last Updated:** 2025-12-10
**Contact:** See README.md for project contacts
**Version Control:** All docs tracked in Git

To regenerate this documentation:
```bash
# Run the document-project workflow
/bmad:bmm:workflows:document-project
```

---

## Additional Resources

- **Project Repository:** GitHub (see README.md)
- **Vercel Dashboard:** For deployment monitoring
- **Google AI Studio:** https://aistudio.google.com/app/apikey
- **Dexie Documentation:** https://dexie.org
- **React Documentation:** https://react.dev
- **Vite Documentation:** https://vitejs.dev
- **Tailwind CSS:** https://tailwindcss.com

---

**End of Documentation Index**
*For detailed information, navigate to the specific documentation files linked above.*
