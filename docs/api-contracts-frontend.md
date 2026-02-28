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

## Development vs Production Mode

### Development Mode
- **Condition:** No `VITE_API_URL` set AND `VITE_GEMINI_API_KEY` present
- **Behavior:** Direct calls to Google Gemini API
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent`
- **Model:** `gemma-3-27b-it`

### Production Mode
- **Condition:** `VITE_API_URL` is set
- **Behavior:** Calls to Vercel Serverless Functions
- **Endpoints:** `/api/gemini`, `/api/ai-assistant`
- **Model:** `gemma-3-27b-it` (backend)

---

## Retry Logic

Both endpoints implement automatic retry with exponential backoff:
- **Retries:** 1 (configurable)
- **Delay:** 2000ms between attempts
- **Quota Errors:** Immediate failure with user-friendly message
- **Network Errors:** Retry once before failing

---

## Error Messages

| Error Type | User Message |
|-----------|--------------|
| Quota Exceeded | "API quota exceeded. Please wait a minute or upgrade your Gemini API plan at https://ai.google.dev/pricing" |
| Model Not Found | "Model not available. Please check the model name." |
| Network Error | "API Error: [error message]" |
| Missing API Key | "VITE_GEMINI_API_KEY not found in environment variables" (dev mode only) |

---

## Security

- **API Keys:** Never exposed in frontend (production mode)
- **CORS:** Handled by backend serverless functions
- **Authentication:** Password protection in production (managed at app level)
- **Rate Limiting:** Handled by Gemini API quotas

---

## Related Files

- `src/services/api-client.service.ts` - API client implementation
- `src/services/ai-assistant.service.ts` - AI assistant service
- `src/utils/json-parser.ts` - JSON extraction from AI responses
- `api/gemini.ts` - Backend Gemini endpoint
- `api/ai-assistant.ts` - Backend AI assistant endpoint
