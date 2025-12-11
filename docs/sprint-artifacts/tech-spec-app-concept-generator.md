# Tech-Spec: App Concept Generator

**Created:** 2025-12-11
**Status:** Done

## Overview

### Problem Statement

After Deep Dive analysis tells you "this industry has opportunity", you still face:
1. "What exactly should I build?"
2. "What form should it take?" (SaaS, tool, API, marketplace?)
3. "Who is the target user?"
4. "What's the one-liner pitch?"

The gap: Industry opportunity → Concrete app idea

### Solution

New feature that takes an industry (ideally after Deep Dive) and generates:
1. **Multiple App Concepts** - 4-6 concrete product ideas
2. **Varied Form Factors** - SaaS, tool, API, marketplace, browser extension
3. **Complete Concept Cards** - Name, pitch, target user, core feature, monetization, effort
4. **Comparison View** - Side-by-side evaluation

### Scope

**In Scope:**
- New `AppConceptOperation` class
- New `app-concept-prompts.ts` file
- New `AppConceptDetails` type
- New `AppConceptModalContent` component
- New context menu action: "Generate App Concepts"
- Store results in new `appConcepts` table (DB version 5)

**Out of Scope:**
- Automatic execution after Deep Dive (user triggers manually)
- Saving/favoriting concepts (future feature)
- Export to other formats (future feature)

## Context for Development

### Codebase Patterns

Follow existing patterns exactly:

1. **New Operation**: Create `src/services/gemini/operations/app-concept.operation.ts`
2. **New Prompts**: Create `src/services/gemini/prompts/app-concept-prompts.ts`
3. **New Type**: Add `AppConceptDetails` to `src/types.ts`
4. **New Repository**: Create `src/services/db/repositories/app-concept.repository.ts`
5. **New Modal**: Create `src/components/modals/AppConceptModalContent.tsx`
6. **Wire Up**: Add to `gemini.service.ts`, `db.service.ts`, hooks, context menu

### Files to Reference

| File | Purpose |
|------|---------|
| `src/services/gemini/operations/mechanism.operation.ts` | Pattern for new operation |
| `src/services/gemini/prompts/mechanism-prompts.ts` | Pattern for new prompts |
| `src/types.ts` | Add new types here |
| `src/services/db/db-client.ts` | Add new table (version 5) |
| `src/services/db/repositories/mechanism.repository.ts` | Pattern for new repository |
| `src/components/modals/MechanismModalContent.tsx` | Pattern for new modal |
| `src/hooks/need-manager/useExpressionAnalysis.ts` | Wire up new analysis function |

### Technical Decisions

1. **New DB Table**: App concepts are distinct enough to warrant separate storage
2. **Triggered from Industry**: Takes `IndustryExpression` + optional `DeepDiveDetails` as input
3. **Card-based UI**: Each concept is a card with all details visible
4. **Your Constraints in Prompt**: Same approach as Enhanced Deep Dive - hardcoded for now

## Implementation Plan

### Tasks

- [x] Task 1: Add `AppConceptDetails` type to `src/types.ts`
  ```typescript
  export interface AppConcept {
    id: string;
    name: string;                    // e.g., "InsightFlow"
    tagline: string;                 // e.g., "AI-powered industry analysis for indie hackers"
    formFactor: 'saas' | 'tool' | 'api' | 'marketplace' | 'extension' | 'mobile';
    targetUser: string;              // e.g., "Solo entrepreneurs exploring new markets"
    problemSolved: string;           // One sentence
    coreFeature: string;             // The ONE thing it does
    monetization: {
      model: string;                 // e.g., "Freemium SaaS"
      pricing: string;               // e.g., "$19/mo Pro, $49/mo Team"
      revenueEstimate: string;       // e.g., "$2-5k MRR at 100 users"
    };
    techStack: string[];             // e.g., ["React", "Supabase", "Gemini"]
    mvpScope: string;                // What's the smallest viable version?
    effortEstimate: 'weekend' | '1-2 weeks' | '2-4 weeks' | '1-2 months' | '3+ months';
    competitiveEdge: string;         // Why would this win?
    risks: string[];                 // Top 2-3 risks
    score: number;                   // 0-100 overall viability
  }

  export interface AppConceptAnalysis {
    industryId: string;
    industryName: string;
    concepts: AppConcept[];
    generatedAt: number;
    inputContext?: {
      deepDiveAvailable: boolean;
      marketOpportunity?: string;
    };
  }
  ```

- [x] Task 2: Create `src/services/gemini/prompts/app-concept-prompts.ts`
  ```typescript
  export function buildAppConceptPrompt(
    industry: IndustryExpression,
    deepDive?: DeepDiveDetails
  ): string {
    // Include industry context
    // Include deep dive context if available
    // Request 5 diverse concepts across form factors
    // Include your constraints context
  }
  ```

- [x] Task 3: Create `src/services/gemini/operations/app-concept.operation.ts`
  ```typescript
  export class AppConceptOperation {
    async generateConcepts(
      industry: IndustryExpression,
      deepDive?: DeepDiveDetails
    ): Promise<AppConcept[]> {
      const prompt = buildAppConceptPrompt(industry, deepDive);
      return geminiClient.callAPI(prompt, 5000); // Longer timeout
    }
  }
  ```

- [x] Task 4: Update DB schema (version 5) in `src/services/db/db-client.ts`
  ```typescript
  export interface DBAppConcept {
    id: string;              // industryId
    industryName: string;
    needId: string;
    concepts: AppConcept[];
    createdAt: number;
  }

  // Add to version 5:
  appConcepts: 'id, industryName, needId, createdAt'
  ```

- [x] Task 5: Create `src/services/db/repositories/app-concept.repository.ts`

- [x] Task 6: Create `src/components/modals/AppConceptModalContent.tsx`
  - Card grid layout (2 columns on desktop)
  - Each card shows: name, tagline, form factor badge, target user, core feature, pricing, effort badge, score
  - Expandable for full details
  - Sort by score option

- [x] Task 7: Wire up in `gemini.service.ts`
  ```typescript
  private appConceptOp = new AppConceptOperation();

  async generateAppConcepts(
    industry: IndustryExpression,
    deepDive?: DeepDiveDetails
  ): Promise<AppConcept[]> {
    return this.appConceptOp.generateConcepts(industry, deepDive);
  }
  ```

- [x] Task 8: Add to hooks and context menu
  - Add `generateAppConcepts` to `useExpressionAnalysis` hook
  - Add "Generate App Concepts" to industry context menu
  - Add loading state and modal trigger

### Acceptance Criteria

- [ ] AC 1: Given an industry, when I select "Generate App Concepts" from context menu, then I see 4-6 app concept cards
- [ ] AC 2: Given an app concept card, when I view it, then I see: name, tagline, form factor, target user, core feature, monetization, effort, and score
- [ ] AC 3: Given an industry WITH a Deep Dive, when I generate concepts, then the concepts reference market insights from the Deep Dive
- [ ] AC 4: Given an industry WITHOUT a Deep Dive, when I generate concepts, then concepts are still generated (Deep Dive is optional input)
- [ ] AC 5: Given generated concepts, when I return to the same industry later, then concepts are cached and load instantly
- [ ] AC 6: Given concept cards, when I view them, then they are sorted by score (highest first)

## Additional Context

### Dependencies

- Enhanced Deep Dive (optional but recommended to complete first)
- DB schema version 5 migration

### Testing Strategy

- Generate concepts for 3-5 different industries
- Test with and without Deep Dive data available
- Verify caching works (regenerate shows cached)
- Verify UI displays all fields correctly

### Notes

- Prompt needs to emphasize DIVERSITY of form factors - don't generate 5 SaaS apps
- Score should factor in YOUR constraints (solo dev, time budget)
- Consider adding "regenerate" button for new ideas
- Effort estimates should be realistic for solo dev
