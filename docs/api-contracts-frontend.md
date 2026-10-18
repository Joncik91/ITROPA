# API Contracts - Frontend

**Part:** Frontend (React + Vite)
**Generated:** 2025-12-10
**Scan Level:** Deep

## Overview

The frontend communicates with Vercel Serverless Functions via REST API calls. The API client supports both production (backend proxy) and development (direct Gemini API) modes.

## API Client Architecture

**File:** `src/services/api-client.service.ts`

### Endpoints

#### 1. `/api/gemini` - Main Content Generation
**Method:** POST
**Purpose:** Generate AI content for predictions, industries, and analysis

**Request:**
```typescript
{
  prompt: string;
  maxTokens?: number;  // Default: 8000
  temperature?: number; // Default: 0.9
}
```

**Response:**
```typescript
{
  text: string; // JSON-formatted response
}
```

**Error Handling:**
- 429: API quota exceeded
- 400: Invalid model or parameters
- 500: Server error

---

#### 2. `/api/ai-assistant` - AI Assistant Chat
**Method:** POST
**Purpose:** Provide contextual suggestions and guidance

**Request:**
```typescript
{
  prompt: string;
  maxTokens?: number;  // Default: 8000
  temperature?: number; // Default: 0.7 (more conservative)
}
```

**Response:**
```typescript
{
  text: string; // JSON-formatted AIAssistantResponse
}
```

**AIAssistantResponse Interface:**
```typescript
{
  suggestions: Array<{
    id: string;
    action: string;
    reasoning: string;
    actionType: "create_need" | "branch" | "find_similar" | "analyze" | "compare" | "extract";
    params: Record<string, any>;
  }>;
  reasoning: string;
}
```

---

## Service Layer

### AI Assistant Service
**File:** `src/services/ai-assistant.service.ts`

**Methods:**
- `suggestMechanismActions(mechanismId: string)` - Suggest next steps for mechanism analysis
- `suggestDeepDiveActions(deepDiveId: string)` - Suggest actions for business opportunities
- `suggestNeedActions(needId: string)` - Guide research exploration
- `suggestPatternActions(patternType: string, currentNeedId?: string)` - Apply patterns across domains

**Context Building:**
- Loads related data from IndexedDB
- Builds comprehensive context for AI prompts
- Integrates mechanisms, deep dives, and cross-pollinations

---

## Development vs Production

There is a single code path. The browser always calls the same-origin endpoints
`/api/gemini` and `/api/ai-assistant`; the Gemini key never reaches the browser.

- **Production:** Vercel Serverless Functions in `/api` (thin adapters over `api/_lib/core.ts`).
- **Development:** `npm run dev` serves the same handlers through Vite middleware
  (`vite-plugin-dev-api.ts`), reading `GEMINI_API_KEY` and `GEMINI_MODEL` from `.env`.
- **Model:** `GEMINI_MODEL` (default `gemini-2.5-flash`). Gemini models run in native JSON mode;
  2.5 Flash runs with thinking disabled so the output budget is spent on the answer.

### Request / response

`POST /api/gemini` and `POST /api/ai-assistant`

```json
{ "prompt": "string (≤ 60,000 chars)", "maxTokens": 256–8192, "temperature": 0–1.5 }
```

Success: `{ "text": "<model output>", "truncated": false }`.
Errors: `{ "error": "message", "code": "quota|timeout|invalid|config|model|blocked|empty|upstream" }`
with status 400/405/422/429/500/502/504.

---

## Client behaviour (`src/services/api-client.service.ts`)

- At most 4 requests in flight; extra calls queue.
- 70 s client timeout (server-side upstream timeout is 55 s; Vercel `maxDuration` is 60 s).
- Retries only transient failures (network, timeout, 429, 5xx, empty or malformed output), with
  jittered exponential backoff (longer for 429). Client errors (400/401) are never retried.
- Every response is parsed and then normalised (`src/utils/need-model.ts`, `src/utils/ai-normalizers.ts`):
  IDs are assigned client-side, and arrays and strings are guaranteed before data reaches state or IndexedDB.

---

## Authentication

None. The app has no login; the AI endpoints are open to anyone who can reach the deployment.

---

## Related Files

- `src/services/api-client.service.ts` - API client implementation
- `src/services/ai-assistant.service.ts` - AI assistant service
- `src/utils/json-parser.ts` - JSON extraction from AI responses
- `api/gemini.ts` - Backend Gemini endpoint
- `api/ai-assistant.ts` - Backend AI assistant endpoint
