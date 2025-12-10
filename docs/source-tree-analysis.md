# Source Tree Analysis

## Project Structure Overview

```
industry-family-tree/
├── src/                          # React frontend source code (ENTRY POINT: src/main.tsx)
│   ├── main.tsx                  # App entry point - initializes React DOM
│   ├── App.tsx                   # Root component - main app layout
│   ├── index.css                 # Global styles
│   ├── types.ts                  # TypeScript type definitions
│   │
│   ├── components/               # React UI components (24 components)
│   │   ├── AIAssistant.tsx                   # AI conversation interface
│   │   ├── HomePage.tsx                     # Landing page
│   │   ├── LibraryView.tsx                  # Industry library grid
│   │   ├── NeedView.tsx                     # Need/category view
│   │   ├── PatternsView.tsx                 # Pattern analysis display
│   │   ├── PriorArtDisplay.tsx              # Prior art research results
│   │   ├── ChainAnalyticsView.tsx           # Inspiration chain visualization
│   │   ├── TimelineView.tsx                 # Timeline visualization
│   │   ├── IndustryBranch.tsx               # Industry hierarchy component
│   │   ├── HistoryPanel.tsx                 # User action history
│   │   ├── Breadcrumb.tsx                   # Navigation breadcrumbs
│   │   ├── ContextMenu.tsx                  # Right-click context menu
│   │   ├── MiniMap.tsx                      # Map overview
│   │   ├── PasswordPrompt.tsx               # Auth prompt (production)
│   │   │
│   │   ├── ModalWrapper.tsx                 # Modal container wrapper
│   │   ├── ModalContent.tsx                 # Base modal content
│   │   │
│   │   ├── modals/                          # Modal dialog components
│   │   │   ├── AddPredictionModalContent.tsx
│   │   │   ├── CrossPollinateModalContent.tsx
│   │   │   ├── DeepDiveModalContent.tsx
│   │   │   ├── MechanismModalContent.tsx
│   │   │   ├── KeyboardShortcutsModalContent.tsx
│   │   │   └── index.ts                     # Modal exports
│   │   │
│   │   └── sidebars/                        # Sidebar panels
│   │       ├── LeftSidebar.tsx              # Navigation and controls
│   │       ├── RightSidebar.tsx             # Details and information
│   │       ├── CenterPanel.tsx              # Main content area
│   │       └── index.ts                     # Sidebar exports
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useHistory.ts                    # History management
│   │   ├── useKeyboardShortcuts.ts          # Keyboard event handling
│   │   ├── useNeedManager.ts                # Main state hook
│   │   ├── usePatterns.ts                   # Pattern analysis state
│   │   ├── useTheme.ts                      # Theme management
│   │   │
│   │   └── need-manager/                    # Specialized state hooks
│   │       ├── useNeedState.ts              # Base state management
│   │       ├── useNeedCRUD.ts               # Create, read, update, delete
│   │       ├── useTreeOperations.ts         # Tree manipulation
│   │       ├── useAIAssistant.ts            # AI operations
│   │       ├── useCrossPollination.ts       # Cross-pollination logic
│   │       ├── useExpressionAnalysis.ts     # Analysis operations
│   │       ├── useUIState.ts                # UI state management
│   │       └── index.ts                     # Hook exports
│   │
│   ├── services/                 # Business logic and API integration
│   │   ├── api-client.service.ts            # HTTP client for backend API
│   │   ├── ai-assistant.service.ts          # AI interaction wrapper
│   │   ├── db.service.ts                    # Database initialization
│   │   │
│   │   ├── db/                              # Database layer (IndexedDB)
│   │   │   ├── db.service.ts                # Database main service
│   │   │   ├── db-client.ts                 # IndexedDB client
│   │   │   ├── base.repository.ts           # Base CRUD operations
│   │   │   ├── search.service.ts            # Full-text search
│   │   │   │
│   │   │   └── repositories/                # Data repositories
│   │   │       ├── need.repository.ts
│   │   │       ├── deep-dive.repository.ts
│   │   │       ├── cross-pollinate.repository.ts
│   │   │       ├── mechanism.repository.ts
│   │   │       ├── pattern-analysis.repository.ts
│   │   │       ├── prior-art-analysis.repository.ts
│   │   │       ├── chain-analysis.repository.ts
│   │   │       └── search-cache.repository.ts
│   │   │
│   │   └── gemini/                          # AI model integration
│   │       ├── gemini.service.ts            # Main Gemini service
│   │       ├── gemini-client.ts             # API client
│   │       │
│   │       ├── operations/                  # AI operation handlers
│   │       │   ├── need.operation.ts        # Need generation
│   │       │   ├── branch.operation.ts      # Industry branching
│   │       │   ├── deep-dive.operation.ts   # Deep analysis
│   │       │   ├── cross-pollinate.operation.ts
│   │       │   ├── mechanism.operation.ts
│   │       │   ├── pattern.operation.ts
│   │       │   ├── prior-art.operation.ts
│   │       │   ├── chain.operation.ts
│   │       │   └── index.ts
│   │       │
│   │       └── prompts/                     # AI prompt templates
│   │           ├── common.ts                # Shared prompt utilities
│   │           ├── need-prompts.ts
│   │           ├── branch-prompts.ts
│   │           ├── deep-dive-prompts.ts
│   │           ├── cross-pollinate-prompts.ts
│   │           ├── mechanism-prompts.ts
│   │           ├── pattern-prompts.ts
│   │           ├── prior-art-prompts.ts
│   │           ├── chain-prompts.ts
│   │           └── index.ts
│   │
│   ├── config/                   # Configuration files
│   │   ├── constants.ts          # App-wide constants
│   │   ├── analysis-frameworks.ts # AI analysis framework definitions
│   │   └── theme.ts              # Theme configuration
│   │
│   ├── utils/                    # Utility functions
│   │   ├── index.ts              # Utility exports
│   │   ├── async-handler.ts      # Error handling for async operations
│   │   ├── badge-styles.ts       # Badge styling utilities
│   │   ├── export.ts             # Data export functionality
│   │   ├── framework-analyzer.ts # Analysis framework utilities
│   │   ├── json-parser.ts        # JSON parsing utilities
│   │   ├── string-helpers.ts     # String manipulation
│   │   └── tree-search.ts        # Tree data structure search
│   │
│   └── types/                    # Additional type definitions
│       └── manager-interfaces.ts # Interface definitions
│
├── api/                          # Vercel Serverless Functions (BACKEND ENTRY POINTS)
│   ├── gemini.ts                 # Gemini API endpoint handler
│   ├── ai-assistant.ts           # AI assistant endpoint handler
│   ├── auth.js                   # Authentication utility
│   └── tsconfig.json             # API-specific TypeScript config
│
├── docs/                         # Documentation
│   ├── project-overview.md       # This file's parent documentation
│   ├── source-tree-analysis.md   # Structure analysis
│   ├── component-inventory-frontend.md
│   ├── development-guide-frontend.md
│   ├── deployment-guide.md
│   └── bmm-workflow-status.yaml  # Workflow tracking
│
├── dist/                         # Built output (generated)
├── node_modules/                 # Dependencies
│
├── Configuration Files
│   ├── package.json              # npm dependencies and scripts
│   ├── package-lock.json         # Locked dependency versions
│   ├── tsconfig.json             # TypeScript configuration
│   ├── tsconfig.node.json        # Node.js TypeScript config
│   ├── vite.config.ts            # Vite build configuration
│   ├── tailwind.config.js        # Tailwind CSS configuration
│   ├── postcss.config.js         # PostCSS configuration
│   ├── vercel.json               # Vercel deployment config
│   ├── .env.example              # Environment variable template
│   ├── .gitignore                # Git ignore rules
│   └── index.html                # HTML entry point
│
└── Root Documentation
    └── README.md                 # Main project README
```

---

## Directory Descriptions

### Frontend Source (`src/`)

The React application source code. Contains all UI components, business logic, and state management.

**Entry Point**: `src/main.tsx` → renders `<App />` from `App.tsx`

### Components (`src/components/`)

24 React components organized by function:

- **View Components**: HomePage, LibraryView, NeedView, PatternsView, ChainAnalyticsView
- **Modal Components**: ModalWrapper, AddPredictionModalContent, CrossPollinateModalContent, etc.
- **Sidebar Components**: LeftSidebar, RightSidebar, CenterPanel
- **Display Components**: PriorArtDisplay, TimelineView, IndustryBranch, HistoryPanel
- **UI Components**: PasswordPrompt, ContextMenu, Breadcrumb, MiniMap, AIAssistant

### Hooks (`src/hooks/`)

Custom React hooks for state management and logic:

- `useNeedManager` - Main orchestration hook
- `useNeedState` - Core state management
- `useAIAssistant` - AI operations
- `useCrossPollination` - Cross-pollination logic
- Specialized hooks for specific features

### Services (`src/services/`)

Business logic and external integrations:

- **API Client**: HTTP requests to Vercel serverless functions
- **Database**: IndexedDB wrapper for persistent storage
- **Gemini**: Google Gemini AI model integration
- **AI Assistant**: Wrapper for AI operations

### Config (`src/config/`)

Application configuration:
- Constants and feature flags
- Analysis framework definitions
- Theme settings

### Utils (`src/utils/`)

Helper functions for common tasks:
- String and JSON processing
- Tree data structure operations
- Export functionality
- Error handling

### Backend API (`api/`)

Vercel Serverless Functions - Node.js handlers:

**Entry Points**:
- `api/gemini.ts` - Handles Gemini API requests
- `api/ai-assistant.ts` - AI assistant operations

Both functions:
- Accept POST requests with prompts
- Return AI-generated text
- Include CORS headers
- Protect the Gemini API key

### Build Output (`dist/`)

Generated files from `npm run build`:
- Minified JavaScript/CSS
- Optimized assets
- Ready for Vercel deployment

---

## Critical Entry Points

| File | Type | Purpose |
|------|------|---------|
| `src/main.tsx` | Frontend | React DOM entry point |
| `src/App.tsx` | Frontend | Root component |
| `api/gemini.ts` | Backend | AI generation endpoint |
| `api/ai-assistant.ts` | Backend | AI assistant endpoint |
| `vercel.json` | Config | Vercel deployment configuration |
| `package.json` | Config | npm dependencies and scripts |

---

## Data Flow Architecture

```
User Interaction (UI Components)
    ↓
React Hooks (useNeedManager, etc.)
    ↓
Services Layer (API Client, Gemini Service)
    ↓
Local Storage (IndexedDB) OR Vercel API (Serverless Functions)
    ↓
Google Gemini API (for AI operations)
    ↓
Response back through services to components
    ↓
Component re-render with new data
```

---

## Technology by Directory

| Directory | Primary Tech | Framework |
|-----------|-------------|-----------|
| `src/components/` | React, TypeScript, Tailwind CSS | React 18 |
| `src/hooks/` | React Hooks, TypeScript | React 18 |
| `src/services/` | TypeScript, API clients, IndexedDB | Node.js |
| `api/` | Node.js, TypeScript, Vercel | Express-like |
| Config files | YAML, JSON, JavaScript | Various |

---

## Key Patterns

1. **Custom Hook Aggregation**: `useNeedManager` combines multiple specialized hooks
2. **Repository Pattern**: Data access through repository classes
3. **Service Layer**: Business logic separated from UI
4. **Component Composition**: Sidebar, modal, and view components compose into App
5. **Serverless Security**: API keys protected by Vercel functions

---

## Build & Deployment Pipeline

```
Source Code (src/ + api/)
    ↓
TypeScript Compilation (tsconfig.json)
    ↓
Vite Build (vite.config.ts)
    ↓
Tailwind CSS Processing (tailwind.config.js)
    ↓
Output (dist/ for frontend)
    ↓
Vercel Deployment (vercel.json config)
    ↓
Production App
```
