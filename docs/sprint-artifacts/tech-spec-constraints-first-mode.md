# Tech-Spec: Constraints-First Mode

**Created:** 2025-12-11
**Status:** Completed

## Overview

### Problem Statement

Current ITROPA flow:
1. Explore needs → generates industries → Deep Dive → App Concepts
2. Problem: You might analyze 20 industries before finding one that matches YOUR constraints
3. Wasted effort: Why Deep Dive industries you can't/won't build?

The gap: Constraints come LAST (implicit in prompts) instead of FIRST (explicit filter)

### Solution

Add a "Constraints Profile" that:
1. **Captures Your Constraints** - Skills, time, revenue goals, preferences
2. **Filters Before Analysis** - Only show/analyze industries matching your constraints
3. **Enhances All Prompts** - Deep Dive and App Concepts use your real profile
4. **Enables Comparison** - Score opportunities against YOUR specific criteria

### Scope

**In Scope:**
- New `ConstraintsProfile` type and storage
- Settings UI to configure constraints
- Filter logic for industry display
- Update all prompts to use dynamic constraints (not hardcoded)
- "Match Score" badge on industries based on constraints fit

**Out of Scope:**
- Multiple profiles (just one for now)
- Constraint-based industry generation (generate-time filter, not discovery-time)
- Sharing/exporting profiles

## Context for Development

### Codebase Patterns

1. **Settings Storage**: Use localStorage for simple settings (like theme)
2. **Profile Type**: Add to `src/types.ts`
3. **Settings UI**: New component or section in existing settings
4. **Filter Logic**: In hooks that display industries
5. **Prompt Updates**: Modify all prompt builder functions

### Files to Reference

| File | Purpose |
|------|---------|
| `src/types.ts` | Add `ConstraintsProfile` type |
| `src/hooks/need-manager/useNeedState.ts` | Potentially add constraints state |
| `src/services/gemini/prompts/*.ts` | Update ALL prompt builders |
| `src/components/LeftSidebar.tsx` | Add settings/profile section |
| `src/config/theme.ts` | Reference for how theme is stored |

### Technical Decisions

1. **localStorage for Profile**: Simple, no DB migration needed
2. **Optional Filtering**: User can toggle filter on/off
3. **Prompt Injection**: Constraints profile serialized to string and injected into prompts
4. **Match Score Algorithm**: Simple weighted score based on constraint alignment

## Implementation Plan

### Tasks

- [x] Task 1: Add `ConstraintsProfile` type to `src/types.ts`
  ```typescript
  export interface ConstraintsProfile {
    // Skills
    techStack: string[];           // e.g., ["React", "TypeScript", "Node.js", "Python"]
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    hasAIAccess: boolean;          // Can use AI APIs?

    // Time
    availableTime: 'weekend' | '1-2 weeks' | '2-4 weeks' | '1-2 months' | 'unlimited';
    workStyle: 'side-project' | 'full-time' | 'exploring';

    // Revenue Goals
    revenueGoal: 'learning' | 'side-income' | 'replace-salary' | 'build-business';
    targetMRR?: string;            // e.g., "$1-5k"

    // Preferences
    preferredFormFactors: Array<'saas' | 'tool' | 'api' | 'marketplace' | 'extension' | 'mobile'>;
    avoidCategories: string[];     // e.g., ["crypto", "gambling", "adult"]
    preferB2B: boolean;
    preferB2C: boolean;

    // Risk Tolerance
    riskTolerance: 'low' | 'medium' | 'high';  // Low = proven markets, High = blue ocean

    // Meta
    lastUpdated: number;
  }

  export const DEFAULT_CONSTRAINTS: ConstraintsProfile = {
    techStack: ['React', 'TypeScript', 'Node.js'],
    experienceLevel: 'intermediate',
    hasAIAccess: true,
    availableTime: '2-4 weeks',
    workStyle: 'side-project',
    revenueGoal: 'side-income',
    preferredFormFactors: ['saas', 'tool', 'api'],
    avoidCategories: [],
    preferB2B: true,
    preferB2C: true,
    riskTolerance: 'medium',
    lastUpdated: Date.now()
  };
  ```

- [x] Task 2: Create constraints storage utility
  ```typescript
  // src/utils/constraints-storage.ts
  const STORAGE_KEY = 'itropa-constraints-profile';

  export function getConstraintsProfile(): ConstraintsProfile {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return DEFAULT_CONSTRAINTS;
  }

  export function saveConstraintsProfile(profile: ConstraintsProfile): void {
    profile.lastUpdated = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }

  export function serializeConstraintsForPrompt(profile: ConstraintsProfile): string {
    return `
Builder Profile:
- Tech Stack: ${profile.techStack.join(', ')}
- Experience: ${profile.experienceLevel}
- AI Access: ${profile.hasAIAccess ? 'Yes' : 'No'}
- Available Time: ${profile.availableTime}
- Work Style: ${profile.workStyle}
- Revenue Goal: ${profile.revenueGoal}${profile.targetMRR ? ` (${profile.targetMRR})` : ''}
- Preferred Products: ${profile.preferredFormFactors.join(', ')}
- Target Market: ${[profile.preferB2B ? 'B2B' : '', profile.preferB2C ? 'B2C' : ''].filter(Boolean).join(', ')}
- Risk Tolerance: ${profile.riskTolerance}
    `.trim();
  }
  ```

- [x] Task 3: Create Constraints Settings UI component
  ```typescript
  // src/components/ConstraintsSettings.tsx
  // Form with sections for each constraint category
  // Save button that persists to localStorage
  // Reset to defaults button
  ```

- [x] Task 4: Add constraints hook
  ```typescript
  // src/hooks/useConstraints.ts
  export function useConstraints() {
    const [profile, setProfile] = useState<ConstraintsProfile>(getConstraintsProfile);

    const updateProfile = (updates: Partial<ConstraintsProfile>) => {
      const newProfile = { ...profile, ...updates };
      saveConstraintsProfile(newProfile);
      setProfile(newProfile);
    };

    const promptContext = useMemo(
      () => serializeConstraintsForPrompt(profile),
      [profile]
    );

    return { profile, updateProfile, promptContext };
  }
  ```

- [x] Task 5: Update ALL prompt builders to use constraints
  - `deep-dive-prompts.ts` - Replace hardcoded constraints
  - `app-concept-prompts.ts` - Replace hardcoded constraints
  - `mechanism-prompts.ts` - Add constraints for transfer potential assessment
  - Consider: `branch-prompts.ts` - Filter branches by feasibility?

- [x] Task 6: Add Match Score calculation
  ```typescript
  // src/utils/match-score.ts
  export function calculateMatchScore(
    industry: IndustryExpression,
    deepDive: DeepDiveDetails | null,
    profile: ConstraintsProfile
  ): number {
    let score = 50; // Base score

    // Time fit
    if (deepDive?.timeline) {
      // Parse timeline, compare to availableTime
    }

    // Competition fit (based on risk tolerance)
    if (deepDive?.keyPlayers) {
      // Few players + high risk tolerance = bonus
      // Many players + low risk tolerance = penalty
    }

    // Tech fit (if we can infer from industry type)
    // ... etc

    return Math.max(0, Math.min(100, score));
  }
  ```

- [x] Task 7: Add Match Score badge to industry display
  - Show colored badge (green 70+, yellow 40-69, red <40)
  - Tooltip explains why

- [x] Task 8: Add optional filter toggle
  - In settings or toolbar: "Only show matching industries"
  - When enabled, hides industries with Match Score < 40
  - Default: OFF (show all, but with scores)

### Acceptance Criteria

- [ ] AC 1: Given first app load, when I open settings, then I see a Constraints Profile form pre-filled with defaults
- [ ] AC 2: Given I update my constraints, when I save, then the profile persists across browser sessions
- [ ] AC 3: Given I have a constraints profile, when I run Deep Dive, then the analysis references MY specific constraints (not generic "solo developer")
- [ ] AC 4: Given I have a constraints profile, when I generate App Concepts, then concepts are tailored to MY tech stack and time budget
- [ ] AC 5: Given an industry with Deep Dive data, when I view it, then I see a Match Score badge showing fit with my constraints
- [ ] AC 6: Given the filter is enabled, when I view industries, then only industries with Match Score >= 40 are visible
- [ ] AC 7: Given I change my constraints, when I regenerate Deep Dive, then the new analysis reflects updated constraints

## Additional Context

### Dependencies

- Enhanced Deep Dive (should be done first - provides data for match scoring)
- App Concept Generator (should be done first - needs constraints in prompts)

**Recommended Implementation Order:**
1. Enhanced Deep Dive
2. App Concept Generator
3. Constraints-First Mode (enhances both)

### Testing Strategy

- Create profile with specific constraints
- Run Deep Dive, verify prompt includes YOUR constraints
- Generate App Concepts, verify they match your tech stack
- Test Match Score calculation with various profiles
- Test filter toggle shows/hides appropriately

### Notes

- Match Score without Deep Dive data will be limited - encourage Deep Dive first
- Consider "Analyze for Match" quick action that does minimal analysis just for scoring
- Profile could eventually sync with a "project context" file for team use
- The constraints profile essentially replaces hardcoded assumptions throughout the codebase
