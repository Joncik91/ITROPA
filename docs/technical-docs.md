# ITROPA Technical Documentation

**Developer & Architecture Guide**

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Data Models](#data-models)
5. [Services & APIs](#services--apis)
6. [Component Architecture](#component-architecture)
7. [State Management](#state-management)
8. [AI Integration](#ai-integration)
9. [Storage & Persistence](#storage--persistence)
10. [Security](#security)
11. [Deployment](#deployment)
12. [Development Guide](#development-guide)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│  ┌─────────────────────────────────────────┐   │
│  │         React Frontend (Vite)            │   │
│  │  ┌────────────┐      ┌────────────┐     │   │
│  │  │ Components │      │   Hooks    │     │   │
│  │  └────────────┘      └────────────┘     │   │
│  │  ┌────────────┐      ┌────────────┐     │   │
│  │  │  Services  │      │ IndexedDB  │     │   │
│  │  └────────────┘      └────────────┘     │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                    │
                    │ HTTPS
                    ▼
┌─────────────────────────────────────────────────┐
│         Vercel Serverless Functions              │
│  ┌─────────────────────────────────────────┐   │
│  │  /api/gemini        - AI generation     │   │
│  │  /api/auth          - Authentication    │   │
│  │  /api/ai-assistant  - AI suggestions    │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                    │
                    │ API Key (Server-side)
                    ▼
┌─────────────────────────────────────────────────┐
│          Google Gemini AI APIs                   │
│  - 2.0-flash-exp (Complex analysis)             │
│  - 2.5-flash-lite (Fast generation)             │
└─────────────────────────────────────────────────┘
```

### Key Architectural Decisions

**Client-Side Heavy:**
- All UI rendering in browser
- Local-first data storage
- Minimal server dependencies

**API Security:**
- Serverless functions protect API keys
- No client-side secrets
- Environment variable management

**Offline-Capable:**
- IndexedDB for persistence
- Search cache for speed
- No server-side database

**AI-Powered:**
- Multiple Gemini models for different tasks
- Streaming responses where possible
- Error handling and retries

---

## Technology Stack

### Frontend

**React 18.3.1**
- Functional components
- Hooks for state management
- Concurrent rendering

**TypeScript**
- Full type safety
- Strict mode enabled
- Custom type definitions

**Vite 7.2.7**
- Fast HMR development
- Optimized production builds
- ES modules

**Tailwind CSS 3.4.1**
- Utility-first styling
- Custom theme configuration
- Dark mode support

**Framer Motion 11.0.0**
- Smooth animations
- Layout animations
- Gesture support

**Lucide React 0.344.0**
- Icon library
- Tree-shakeable
- Consistent design

**React Hot Toast 2.6.0**
- Toast notifications
- Promise-based
- Customizable styling

### Backend (Serverless)

**Vercel Functions**
- Node.js runtime
- Edge network deployment
- Automatic scaling

**@google/generative-ai 0.21.0**
- Official Gemini SDK
- Streaming support
- Function calling

### Storage

**Dexie 4.2.1**
- IndexedDB wrapper
- Promise-based API
- Schema versioning
- Full-text search

### Build Tools

**PostCSS 8.4.35**
- Tailwind CSS processing
- Autoprefixer

**TypeScript Compiler**
- Type checking
- ES modules
- Strict mode

---

## Project Structure

```
industry-family-tree/
├── api/                        # Serverless functions
│   ├── ai-assistant.ts         # AI suggestions endpoint
│   ├── auth.ts                 # Authentication endpoint
│   └── gemini.ts               # AI generation endpoint
├── src/
│   ├── components/             # React components
│   │   ├── AIAssistant.tsx     # AI suggestions UI
│   │   ├── Breadcrumb.tsx      # Navigation breadcrumb
│   │   ├── ContextMenu.tsx     # Right-click menu
│   │   ├── HistoryPanel.tsx    # Undo/redo UI
│   │   ├── HomePage.tsx        # Main workspace
│   │   ├── IndustryBranch.tsx  # Industry card component
│   │   ├── LibraryView.tsx     # Saved data browser
│   │   ├── MiniMap.tsx         # Tree overview
│   │   ├── ModalContent.tsx    # Modal body components
│   │   ├── ModalWrapper.tsx    # Modal container
│   │   ├── NeedView.tsx        # Single need display
│   │   ├── PasswordPrompt.tsx  # Auth UI
│   │   ├── PatternsView.tsx    # Pattern library
│   │   ├── PriorArtDisplay.tsx # Prior art sections
│   │   └── TimelineView.tsx    # Era timeline
│   ├── config/                 # Configuration
│   │   ├── constants.ts        # App constants
│   │   └── theme.ts            # Theme definitions
│   ├── hooks/                  # Custom React hooks
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── useNeedManager.ts   # Main state logic
│   │   ├── usePatterns.ts      # Pattern extraction
│   │   └── useTheme.ts         # Theme switching
│   ├── services/               # Business logic
│   │   ├── ai-assistant.service.ts
│   │   ├── api-client.service.ts
│   │   ├── db.service.ts       # IndexedDB wrapper
│   │   └── gemini.service.ts   # AI client
│   ├── utils/                  # Utility functions
│   │   └── export.ts           # Export formats
│   ├── types.ts                # TypeScript definitions
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── docs/                       # Documentation (this!)
│   ├── user-guide.md
│   ├── quick-start.md
│   ├── feature-reference.md
│   └── technical-docs.md
├── index.html                  # HTML entry
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Tailwind config
├── vite.config.ts              # Vite config
├── vercel.json                 # Vercel deployment
├── .env                        # Environment variables (local)
└── README.md                   # Setup instructions
```

---

## Data Models

### Core Types

#### Need
```typescript
interface Need {
  id: string;                    // Unique identifier
  name: string;                  // Human need name
  icon: string;                  // Lucide icon name
  description: string;           // AI-generated description
  priorArt?: PriorArt;          // Historical solutions
  eras: Era[];                   // Timeline of predictions
  relatedNeeds?: string[];       // Connected needs
}
```

#### Era
```typescript
interface Era {
  name: string;                  // "Past", "Present", etc.
  expressions: IndustryExpression[]; // Industries in this era
}
```

#### IndustryExpression
```typescript
interface IndustryExpression {
  id: string;                    // Unique ID
  type: 'future';                // Type marker
  name: string;                  // Industry name
  mutation: string;              // How it evolved
  insight: string;               // Why it matters
  inspirations: Inspiration[];   // Prior art sources
  children: IndustryExpression[]; // Sub-industries
  userAdded?: boolean;           // Created by user
  crossPollinated?: boolean;     // From cross-pollination
  sourceExpressions?: string[];  // Parent expression IDs
}
```

#### PriorArt
```typescript
interface PriorArt {
  currentLeaders?: PriorArtItem[];
  historicalPrecedents?: PriorArtItem[];
  adjacentDomains?: PriorArtItem[];
  natureSolutions?: PriorArtItem[];
}

interface PriorArtItem {
  name: string;
  domain?: string;
  mechanism: string;
  limitation?: string;
  era?: string;
  lesson?: string;
  originalDomain?: string;
  transferPotential?: string;
  biomimicryPotential?: string;
}
```

### Analysis Types

#### MechanismDetails
```typescript
interface MechanismDetails {
  coreMechanism: string;         // Core pattern
  abstractPattern: string;       // Universal principle
  historicalApplications?: Array<{
    domain: string;
    example: string;
    era: string;
  }>;
  untappedDomains?: Array<{
    domain: string;
    opportunity: string;
    novelty: string;
  }>;
  combinationPotential?: string[];
}
```

#### DeepDiveDetails
```typescript
interface DeepDiveDetails {
  marketOpportunity: string;
  keyEnablers: string[];
  challenges: Array<{
    challenge: string;
    potentialSolution: string;
  }>;
  timeline: string;
  firstMoverAdvantage?: string;
  priorArtLeverage?: string;
  keyPlayers?: string[];
  risks?: string[];
}
```

### AI Types

#### AIActionSuggestion
```typescript
interface AIActionSuggestion {
  id: string;                    // Unique ID
  action: string;                // What to do
  reasoning: string;             // Why suggest it
  actionType: 'create_need' | 'compare' | 'branch' | 
              'analyze' | 'find_similar' | 'extract' | 
              'apply_pattern';
  params: Record<string, any>;   // Action parameters
}
```

#### HistoryAction
```typescript
interface HistoryAction {
  id: string;
  type: 'add_need' | 'delete_need' | 'close_need' | 
        'branch' | 'add_child' | 'delete_expression' | 
        'cross_pollinate' | 'fetch_mechanism' | 
        'fetch_deepdive';
  timestamp: number;
  description: string;
  data: {
    needId?: string;
    expressionId?: string;
    parentId?: string;
    previousState?: any;
    newState?: any;
  };
}
```

---

## Services & APIs

### DBService

**Purpose:** IndexedDB data persistence layer.

**Location:** `src/services/db.service.ts`

**Database Schema:**
```typescript
const db = new Dexie('ITROPADatabase');
db.version(1).stores({
  needs: 'id, name, *relatedNeeds',
  mechanisms: 'id, needId, expressionId, expressionName',
  deepDives: 'id, needId, expressionId, expressionName',
  crossPollinations: 'id, timestamp, *sourceIds',
  searchCache: 'query, timestamp'
});
```

**Key Methods:**

```typescript
// Needs
static async saveNeed(need: Need): Promise<void>
static async getNeed(id: string): Promise<DBNeed | undefined>
static async getAllNeeds(): Promise<DBNeed[]>
static async deleteNeed(id: string): Promise<void>
static async searchNeeds(query: string): Promise<DBNeed[]>

// Mechanisms
static async saveMechanism(data: SaveMechanismData): Promise<void>
static async getMechanismsByNeed(needId: string): Promise<DBMechanism[]>
static async searchMechanisms(query: string): Promise<DBMechanism[]>

// Deep Dives
static async saveDeepDive(data: SaveDeepDiveData): Promise<void>
static async getDeepDivesByNeed(needId: string): Promise<DBDeepDive[]>
static async searchDeepDives(query: string): Promise<DBDeepDive[]>

// Cross-Pollinations
static async saveCrossPollination(data: CrossPollinationData): Promise<void>

// Analytics
static async getDatabaseStats(): Promise<Stats>
static async getRecentActivity(limit: number): Promise<Activity[]>

// Management
static async clearAllData(): Promise<void>
```

**Indexing Strategy:**
- Primary keys on IDs
- Full-text search on names
- Multi-entry indexes for relationships
- Timestamp indexes for recency

### GeminiService

**Purpose:** AI generation and analysis client.

**Location:** `src/services/gemini.service.ts`

**Configuration:**
```typescript
const generationConfig = {
  temperature: 0.8,              // Creativity vs consistency
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  // ... other categories
];
```

**Key Methods:**

```typescript
// Need exploration
static async searchNeed(needName: string): Promise<Need>

// Mechanism extraction
static async extractMechanism(
  expression: IndustryExpression,
  need: Need
): Promise<MechanismDetails>

// Deep dive analysis
static async analyzeDeepDive(
  expression: IndustryExpression,
  need: Need
): Promise<DeepDiveDetails>

// Cross-pollination
static async crossPollinate(
  items: IndustryExpression[]
): Promise<IndustryExpression[]>

// AI assistance
static async requestAIAssist(
  context: AIAssistantContext
): Promise<AIAssistantResponse>
```

**Model Selection:**
```typescript
// Complex analysis (mechanism extraction)
model: "gemini-2.0-flash-exp"

// Fast generation (deep dive, cross-pollination)
model: "gemini-2.5-flash-lite"

// AI suggestions (function calling)
model: "gemini-2.5-flash-lite"
```

**Prompt Engineering:**
Each method uses carefully crafted system instructions and prompts optimized for:
- Consistent JSON structure
- Detailed, actionable insights
- Proper attribution to sources
- Creative but grounded predictions

### API Client

**Purpose:** Server-side API communication.

**Location:** `src/services/api-client.service.ts`

**Endpoints:**

```typescript
// AI generation (POST /api/gemini)
static async generateNeed(needName: string): Promise<Need>
static async generateMechanism(data: any): Promise<MechanismDetails>
static async generateDeepDive(data: any): Promise<DeepDiveDetails>
static async generateCrossPollination(data: any): Promise<IndustryExpression[]>

// AI assistant (POST /api/ai-assistant)
static async getAISuggestions(context: any): Promise<AIAssistantResponse>

// Authentication (POST /api/auth)
static async verifyPassword(password: string): Promise<boolean>
```

**Error Handling:**
```typescript
try {
  const response = await fetch(endpoint, config);
  if (!response.ok) throw new Error(`${response.status}`);
  return await response.json();
} catch (error) {
  console.error('API Error:', error);
  throw error;
}
```

---

## Component Architecture

### Component Hierarchy

```
App
├── Header
│   ├── Navigation Buttons
│   ├── Theme Toggle
│   └── Keyboard Shortcuts
├── HomePage (page === "home")
│   ├── Search Bar
│   ├── Need Tabs
│   ├── NeedView (for active tab)
│   │   ├── PriorArtDisplay
│   │   └── TimelineView
│   │       └── IndustryBranch (recursive)
│   │           └── ContextMenu
│   └── Modals
│       ├── MechanismModal
│       │   └── AIAssistant
│       ├── DeepDiveModal
│       │   └── AIAssistant
│       ├── CrossPollinateModal
│       └── AddPredictionModal
├── LibraryView (page === "library")
│   ├── Statistics
│   ├── Search
│   └── Recent Activity
├── PatternsView (page === "patterns")
│   └── Pattern Cards
└── Footer
```

### Key Components

#### App.tsx

**Responsibilities:**
- Root component
- Authentication check
- Page routing
- Theme management
- Global modals

**State:**
```typescript
const [page, setPage] = useState<"home" | "library" | "patterns">("home");
const [authenticated, setAuthenticated] = useState(false);
const [showKeys, setShowKeys] = useState(false);
```

#### HomePage.tsx

**Responsibilities:**
- Main workspace
- Need tab management
- Search functionality
- Modal orchestration

**Key Features:**
- Export dropdown
- Prior art toggle
- Breadcrumb navigation
- View density controls
- Mini-map (future)

#### IndustryBranch.tsx

**Responsibilities:**
- Render industry cards
- Recursive tree rendering
- Context menu
- Drag and drop
- Visual indicators

**Props:**
```typescript
interface IndustryBranchProps {
  expression: IndustryExpression;
  depth: number;
  needId: string;
  theme: any;
  dark: boolean;
  onContextMenu: (expr: IndustryExpression, e: MouseEvent) => void;
  onDelete?: () => void;
  isAnalyzed: boolean;
  hasDeepDive: boolean;
}
```

**Recursive Pattern:**
```typescript
return (
  <div>
    <Card>...</Card>
    {expression.children && (
      <div className="ml-6">
        {expression.children.map(child => (
          <IndustryBranch
            expression={child}
            depth={depth + 1}
            {...otherProps}
          />
        ))}
      </div>
    )}
  </div>
);
```

#### AIAssistant.tsx

**Responsibilities:**
- Display AI suggestions
- Execute actions
- Batch execution
- Progress tracking

**State Management:**
```typescript
const [executing, setExecuting] = useState<string | null>(null);
const [executed, setExecuted] = useState<Set<string>>(new Set());
const [executingAll, setExecutingAll] = useState(false);
```

---

## State Management

### useNeedManager Hook

**Purpose:** Central state management for all need-related operations.

**Location:** `src/hooks/useNeedManager.ts`

**State:**
```typescript
const [needs, setNeeds] = useState<Need[]>([]);
const [activeTab, setActiveTab] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
const [modal, setModal] = useState<ModalState>({...});
const [mechanism, setMechanism] = useState<MechanismDetails | null>(null);
const [deepDive, setDeepDive] = useState<DeepDiveDetails | null>(null);
const [crossPollinate, setCrossPollinate] = useState<CrossPollinateState>({...});
const [history, setHistory] = useState<HistoryState>({...});
```

**Key Functions:**

```typescript
// Need operations
const fetchNeed = async (needName: string) => {...}
const addNeed = (need: Need) => {...}
const deleteNeed = (needId: string) => {...}

// Prediction operations
const addPrediction = (needId: string, parentId?: string) => {...}
const deletePrediction = (needId: string, exprId: string) => {...}

// Analysis operations
const requestMechanismExtraction = async (exprId: string) => {...}
const requestDeepDiveAnalysis = async (exprId: string) => {...}
const requestMechanismAIAssist = async (mechId: string) => {...}
const requestDeepDiveAIAssist = async (diveId: string) => {...}

// Cross-pollination
const toggleCrossItem = (expr: IndustryExpression) => {...}
const executeCrossPollinate = async () => {...}
const addCrossPollinationResult = (result: IndustryExpression, needId: string) => {...}

// History
const undo = () => {...}
const redo = () => {...}
const addHistoryAction = (action: HistoryAction) => {...}
```

**Benefits:**
- Centralized business logic
- Consistent state updates
- Easy testing
- Reusable across components

### Local State Patterns

**Component-level state:**
```typescript
// UI state only
const [expanded, setExpanded] = useState(false);
const [hovering, setHovering] = useState(false);

// Form state
const [formData, setFormData] = useState<FormData>({...});

// Loading indicators
const [loading, setLoading] = useState(false);
```

**When to use local vs hook:**
- Local: UI state, animations, temporary values
- Hook: Business logic, data mutations, cross-component state

---

## AI Integration

### Prompt Engineering

**Need Search Prompt:**
```
You are researching human needs and their solutions across time.

Given the need: "{needName}"

Provide:
1. Description of the need
2. Prior art in 4 categories
3. Timeline of future predictions

Format as JSON...
```

**Mechanism Extraction Prompt:**
```
Analyze this industry and extract:

1. Core mechanism (what makes it work)
2. Abstract pattern (universal principle)
3. Historical applications
4. Untapped domains
5. Combination potential

Industry: {name}
Context: {need description}
```

**Deep Dive Prompt:**
```
Perform market analysis on this predicted industry:

1. Market opportunity
2. Key enablers
3. Challenges & solutions
4. Timeline
5. First mover advantage
6. Risks

Prediction: {name}
Context: {mutation and insight}
```

### Function Calling (AI Assistant)

**Tool Definitions:**
```typescript
const tools: AIToolDefinition[] = [
  {
    name: "create_need",
    description: "Explore a new human need",
    parameters: {
      type: "object",
      properties: {
        needName: {
          type: "string",
          description: "The human need to explore"
        }
      },
      required: ["needName"]
    }
  },
  // ... more tools
];
```

**Tool Execution:**
```typescript
const executeAIAction = async (suggestion: AIActionSuggestion) => {
  switch (suggestion.actionType) {
    case 'create_need':
      await fetchNeed(suggestion.params.needName);
      break;
    case 'branch':
      setModal({
        open: true,
        needId: suggestion.params.needId,
        parentId: suggestion.params.parentId
      });
      break;
    // ... other actions
  }
};
```

### Streaming Responses

**Pattern:**
```typescript
const response = await model.generateContentStream(prompt);

for await (const chunk of response.stream) {
  const text = chunk.text();
  // Update UI progressively
  setPartialResponse(prev => prev + text);
}

const finalResponse = await response.response;
```

**Use Cases:**
- Long-form content generation
- Real-time feedback
- Better UX for slow operations

---

## Storage & Persistence

### IndexedDB Schema

**Database:** `ITROPADatabase`

**Stores:**

```typescript
// Needs
{
  id: string (primary key),
  name: string,
  icon: string,
  description: string,
  priorArt: object,
  eras: array,
  relatedNeeds: array (multi-entry index),
  timestamp: number
}

// Mechanisms
{
  id: string (primary key),
  needId: string (index),
  expressionId: string,
  expressionName: string,
  details: object,
  timestamp: number
}

// Deep Dives
{
  id: string (primary key),
  needId: string (index),
  expressionId: string,
  expressionName: string,
  details: object,
  timestamp: number
}

// Cross-Pollinations
{
  id: string (primary key),
  sourceIds: array (multi-entry index),
  results: array,
  timestamp: number
}

// Search Cache
{
  query: string (primary key),
  result: object,
  timestamp: number
}
```

### Caching Strategy

**Search Cache:**
```typescript
// Check cache first
const cached = await db.searchCache.get(query);
if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
  return cached.result;
}

// Fetch from API
const result = await api.generateNeed(query);

// Cache result
await db.searchCache.put({ query, result, timestamp: Date.now() });
```

**TTL:** 24 hours for search cache

**Benefits:**
- Instant repeated searches
- Reduced API costs
- Offline capability
- Better UX

### Data Migration

**Version Management:**
```typescript
db.version(1).stores({...});  // Initial schema

db.version(2).stores({...}).upgrade(tx => {
  // Migration logic
  return tx.table('needs').toCollection().modify(need => {
    need.newField = defaultValue;
  });
});
```

**Best Practices:**
- Never remove stores in upgrades
- Provide migration functions
- Test with real data
- Document changes

---

## Security

### API Key Protection

**Problem:** Gemini API key must not be exposed in client code.

**Solution:** Vercel Serverless Functions

**Architecture:**
```
Browser (no key)
    ↓
Vercel Function (has key)
    ↓
Gemini API
```

**Implementation:**
```typescript
// api/gemini.ts
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.GEMINI_API_KEY;  // Server-side only
  
  // Call Gemini API
  const result = await generateContent(apiKey, req.body);
  
  res.status(200).json(result);
}
```

### Authentication

**Production Only:**
- Password check on first load
- Stored in localStorage
- No persistent sessions
- Simple protection layer

**Implementation:**
```typescript
// api/auth.ts
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { password } = req.body;
  const correctPassword = process.env.APP_PASSWORD;
  
  res.status(200).json({ 
    authenticated: password === correctPassword 
  });
}
```

**Client-side:**
```typescript
useEffect(() => {
  if (import.meta.env.PROD) {
    const isAuth = localStorage.getItem('authenticated') === 'true';
    setAuthenticated(isAuth);
  } else {
    setAuthenticated(true);  // No auth in dev
  }
}, []);
```

### Data Privacy

**Local-First:**
- All user data in browser
- No server-side database
- No user tracking
- No analytics

**GDPR Compliance:**
- No personal data collected
- User controls all data
- Easy deletion (clear browser data)
- No third-party data sharing

### Content Security

**Safety Settings:**
```typescript
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE
  },
  // ... allow all content for research purposes
];
```

**Reasoning:** Research tool needs unfiltered results.

**User Responsibility:** Content generated is for research and should be evaluated critically.

---

## Deployment

### Vercel Configuration

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 60
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Key Settings:**
- **memory:** 1024MB for AI processing
- **maxDuration:** 60s timeout
- **rewrites:** SPA routing support

### Environment Variables

**Required:**
```
GEMINI_API_KEY=your_gemini_api_key_here
APP_PASSWORD=your_secure_password_here
```

**Setup:**
1. Vercel Dashboard → Project Settings
2. Environment Variables
3. Add both variables
4. Select all environments (Production, Preview, Development)
5. Redeploy

### Build Process

**Local Build:**
```bash
npm run build
```

**Output:**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── [other assets]
```

**Vercel Build:**
1. Push to GitHub
2. Vercel auto-deploys
3. Runs `npm run build`
4. Deploys to edge network
5. Functions deployed separately

### CI/CD Pipeline

**Automatic:**
- Push to `main` → Production deploy
- Push to other branches → Preview deploy
- Pull requests → Preview deploy

**Manual:**
```bash
vercel --prod  # Deploy to production
vercel         # Deploy preview
```

---

## Development Guide

### Local Setup

**1. Clone Repository:**
```bash
git clone https://github.com/Joncik91/industry-family-tree.git
cd industry-family-tree
```

**2. Install Dependencies:**
```bash
npm install
```

**3. Environment Setup:**
```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

**4. Run Dev Server:**
```bash
npm run dev
```

**5. Access App:**
```
http://localhost:5173
```

### Development Workflow

**Code Structure:**
```typescript
// 1. Types first
interface MyType {
  field: string;
}

// 2. Component definition
export const MyComponent = ({ prop }: Props) => {
  // 3. Hooks at top
  const [state, setState] = useState();
  const { data } = useCustomHook();
  
  // 4. Effects
  useEffect(() => {...}, [deps]);
  
  // 5. Handlers
  const handleClick = () => {...};
  
  // 6. Render helpers
  const renderItem = (item) => {...};
  
  // 7. Return JSX
  return <div>...</div>;
};
```

**Best Practices:**
- TypeScript strict mode
- Functional components only
- Custom hooks for logic
- Props interfaces
- Descriptive names
- Comments for complex logic

### Adding New Features

**1. Define Types:**
```typescript
// src/types.ts
export interface NewFeature {
  id: string;
  data: any;
}
```

**2. Add Service Method:**
```typescript
// src/services/db.service.ts
static async saveNewFeature(data: NewFeature): Promise<void> {
  await db.newFeatures.put(data);
}
```

**3. Create Component:**
```typescript
// src/components/NewFeature.tsx
export const NewFeature = () => {...};
```

**4. Integrate in App:**
```typescript
// src/App.tsx
import { NewFeature } from './components/NewFeature';
// ... use it
```

**5. Add Tests (future):**
```typescript
// src/components/NewFeature.test.tsx
describe('NewFeature', () => {...});
```

### Debugging

**Browser DevTools:**
- React DevTools extension
- IndexedDB inspector
- Network tab for API calls
- Console for errors

**Logging:**
```typescript
console.log('State:', state);
console.table(arrayData);
console.error('Error:', error);
```

**Common Issues:**

**API not working:**
```bash
# Check environment variables
echo $GEMINI_API_KEY

# Check serverless function logs
vercel logs
```

**IndexedDB errors:**
```javascript
// Clear database
await Dexie.delete('ITROPADatabase');

// Recreate
const db = new Dexie('ITROPADatabase');
db.version(1).stores({...});
```

**Build errors:**
```bash
# Clear cache
rm -rf node_modules dist .vite
npm install
npm run build
```

### Performance Optimization

**Lazy Loading:**
```typescript
const LazyComponent = lazy(() => import('./Component'));

<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

**Memoization:**
```typescript
const MemoComponent = memo(Component);

const memoizedValue = useMemo(() => expensiveCalc(), [deps]);

const memoizedCallback = useCallback(() => {...}, [deps]);
```

**Virtualization (future):**
```typescript
// For large lists
import { FixedSizeList } from 'react-window';
```

### Testing (Future)

**Unit Tests:**
```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

test('renders correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

**Integration Tests:**
```typescript
test('full workflow', async () => {
  // Render app
  // Interact with UI
  // Assert expected results
});
```

**E2E Tests:**
```typescript
// Playwright or Cypress
test('user can search and branch', async () => {
  await page.goto('http://localhost:5173');
  await page.fill('[data-testid="search"]', 'belonging');
  // ... complete workflow
});
```

---

## API Reference

### Serverless Functions

#### POST /api/gemini

**Request:**
```typescript
{
  type: 'search' | 'mechanism' | 'deepdive' | 'cross',
  data: {
    // Type-specific data
  }
}
```

**Response:**
```typescript
// Varies by type
Need | MechanismDetails | DeepDiveDetails | IndustryExpression[]
```

#### POST /api/auth

**Request:**
```typescript
{
  password: string
}
```

**Response:**
```typescript
{
  authenticated: boolean
}
```

#### POST /api/ai-assistant

**Request:**
```typescript
{
  contextType: string,
  contextId: string,
  data: any,
  relatedData?: any
}
```

**Response:**
```typescript
{
  suggestions: AIActionSuggestion[],
  reasoning: string
}
```

---

## Future Enhancements

### Planned Features

**User Accounts:**
- Cloud sync
- Collaboration
- Sharing

**Advanced Search:**
- Semantic search
- Filter combinations
- Saved searches

**Visualizations:**
- Force-directed graphs
- Timeline animations
- Heat maps

**Export Enhancements:**
- PDF generation
- Interactive embeds
- Presentation mode

**AI Improvements:**
- Multi-model comparison
- Custom prompts
- Fine-tuning

### Architecture Evolution

**Backend Database:**
- Optional cloud sync
- Multi-device support
- Collaboration features

**Real-time Updates:**
- WebSocket connections
- Collaborative editing
- Live cursors

**Mobile Apps:**
- React Native
- Native features
- Offline-first

---

## Contributing

### Code Style

**TypeScript:**
- Strict mode
- Explicit types
- No `any` (use `unknown`)

**React:**
- Functional components
- Hooks over classes
- Props interfaces

**Naming:**
- Components: PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case or PascalCase for components

**Comments:**
```typescript
/**
 * Brief description of function.
 * 
 * @param param1 - Description
 * @returns Description
 */
```

### Pull Request Process

1. Fork repository
2. Create feature branch
3. Commit changes
4. Write/update tests
5. Update documentation
6. Submit PR

### Issue Reporting

**Bug Reports:**
- Steps to reproduce
- Expected vs actual behavior
- Browser/environment details
- Screenshots if relevant

**Feature Requests:**
- Use case description
- Proposed solution
- Alternative approaches
- Mockups if helpful

---

## License & Credits

**License:** MIT (see LICENSE file)

**Technologies:**
- React, Vite, TypeScript
- Tailwind CSS, Framer Motion
- Google Gemini AI
- Dexie.js
- Vercel

**Author:** Joncik91

**Repository:** https://github.com/Joncik91/industry-family-tree

---

This technical documentation is a living document. As the project evolves, please keep it updated with architectural decisions, new patterns, and lessons learned.
