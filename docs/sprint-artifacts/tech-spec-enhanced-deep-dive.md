# Tech-Spec: Enhanced Deep Dive with Opportunity Scoring

**Created:** 2025-12-11
**Status:** Completed

## Overview

### Problem Statement

Deep Dive analysis provides valuable market intelligence (market opportunity, timeline, challenges, key players) but:
1. Doesn't score or rank opportunities for quick comparison
2. Doesn't personalize assessment to YOUR constraints (skills, time, goals)
3. Doesn't suggest monetization models
4. Leaves you to manually evaluate "should I build this?"

### Solution

Enhance the existing Deep Dive feature to include:
1. **Opportunity Scorecard** - Numeric scores across 5 dimensions
2. **Solo Dev Assessment** - Personalized evaluation for your constraints
3. **Monetization Models** - Specific revenue approaches
4. **Build Recommendation** - Clear yes/no/maybe with reasoning

### Scope

**In Scope:**
- Extend `DeepDiveDetails` type with new scoring fields
- Extend `buildDeepDivePrompt` to request scoring data
- Extend `DeepDiveModalContent` to display scores
- Add score visualization (radar chart or bar display)
- Store enhanced data in existing `deepDives` table

**Out of Scope:**
- New database tables
- New UI modals (extends existing)
- User profile/constraints storage (hardcoded for now, Constraints-First handles this later)

## Context for Development

### Codebase Patterns

1. **Operation Pattern**: Each AI feature has a dedicated operation class
   - Location: `src/services/gemini/operations/`
   - Pattern: Class with methods that call `geminiClient.callAPI(prompt, timeout)`

2. **Prompt Pattern**: Prompts are in separate files
   - Location: `src/services/gemini/prompts/`
   - Pattern: Export function that builds prompt string with JSON schema

3. **Type Pattern**: All types in central file
   - Location: `src/types.ts`
   - Pattern: Interfaces with optional fields for backwards compatibility

4. **Modal Pattern**: Modal content is separate component
   - Location: `src/components/modals/`
   - Pattern: Props include data, theme, AI suggestions

### Files to Reference

| File | Purpose |
|------|---------|
| `src/services/gemini/operations/deep-dive.operation.ts` | Extend this operation |
| `src/services/gemini/prompts/deep-dive-prompts.ts` | Extend this prompt |
| `src/types.ts` | Extend `DeepDiveDetails` interface |
| `src/components/modals/DeepDiveModalContent.tsx` | Extend this UI |
| `src/services/db/db-client.ts` | No changes needed (schema handles `details: any`) |

### Technical Decisions

1. **Backwards Compatibility**: All new fields are optional - existing deep dives still work
2. **No Schema Migration**: `DBDeepDive.details` is typed as `any`, so new fields just work
3. **Hardcoded Constraints**: For MVP, your constraints (React/Node, solo dev, etc.) are in the prompt. Constraints-First feature will externalize later.

## Implementation Plan

### Tasks

- [x] Task 1: Extend `DeepDiveDetails` type in `src/types.ts`
  ```typescript
  // Add to DeepDiveDetails interface:
  opportunityScore?: {
    marketTiming: number;      // 0-100: Is the window now?
    technicalFit: number;      // 0-100: Can you build this?
    effortEstimate: number;    // 0-100: How much work? (100=easy)
    monetizationClarity: number; // 0-100: How obvious is revenue?
    competitionDensity: number;  // 0-100: Blue ocean score (100=wide open)
    overallScore: number;      // Weighted average
  };
  soloDevAssessment?: {
    feasibility: 'high' | 'medium' | 'low';
    timeToMVP: string;         // e.g., "2-4 weeks"
    techStack: string[];       // e.g., ["React", "Node", "Gemini API"]
    biggestChallenge: string;
    unfairAdvantage: string;   // What edge could you have?
  };
  monetizationModels?: Array<{
    model: string;             // e.g., "SaaS Subscription"
    description: string;
    revenueRange: string;      // e.g., "$500-2000/mo"
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  buildRecommendation?: {
    verdict: 'build' | 'explore' | 'skip';
    confidence: number;        // 0-100
    reasoning: string;
    nextStep: string;          // Actionable next step
  };
  ```

- [x] Task 2: Extend prompt in `src/services/gemini/prompts/deep-dive-prompts.ts`
  - Add scoring request to JSON schema
  - Include your constraints context: "Assume the builder is a solo developer proficient in React, TypeScript, Node.js, and has access to AI APIs (Gemini, Claude). They prefer SaaS, tools, or API products. Time budget is typically 2-6 weeks for MVP."

- [x] Task 3: Update `DeepDiveModalContent.tsx` to display new data
  - Add score visualization section (5 horizontal bars with percentages)
  - Add Solo Dev Assessment card
  - Add Monetization Models list
  - Add Build Recommendation banner (color-coded: green/yellow/red)

- [x] Task 4: Test with existing industries
  - Run Deep Dive on 3-5 existing industries
  - Verify backwards compatibility (old deep dives still display)
  - Verify new scores appear for new analyses

### Acceptance Criteria

- [ ] AC 1: Given an industry, when I run Deep Dive, then I see the existing analysis PLUS opportunity scores (5 dimensions + overall)
- [ ] AC 2: Given an industry, when I run Deep Dive, then I see a Solo Dev Assessment with feasibility, time estimate, and tech stack
- [ ] AC 3: Given an industry, when I run Deep Dive, then I see 2-3 monetization model suggestions with revenue ranges
- [ ] AC 4: Given an industry, when I run Deep Dive, then I see a clear Build/Explore/Skip recommendation with reasoning
- [ ] AC 5: Given an OLD deep dive (before this feature), when I view it, then the modal still displays correctly (no errors)

## Additional Context

### Dependencies

- None - extends existing feature

### Testing Strategy

- Manual testing: Run Deep Dive on various industries, verify all new fields populate
- Backwards compatibility: View existing cached deep dives, verify no errors

### Notes

- The prompt will be ~2x longer due to additional JSON fields
- Consider increasing timeout from 3000ms if responses are slow
- Scores should be calibrated to YOUR constraints - this is subjective on purpose
