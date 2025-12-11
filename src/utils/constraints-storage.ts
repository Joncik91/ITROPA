/**
 * Constraints Profile Storage Utility
 * Handles localStorage persistence and prompt serialization for the Constraints-First feature.
 */

import { ConstraintsProfile, DEFAULT_CONSTRAINTS } from '../types';

const STORAGE_KEY = 'itropa-constraints-profile';

/**
 * Get the user's constraints profile from localStorage.
 * Returns default constraints if none exist.
 */
export function getConstraintsProfile(): ConstraintsProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse constraints profile:', e);
  }
  return { ...DEFAULT_CONSTRAINTS, lastUpdated: Date.now() };
}

/**
 * Save the user's constraints profile to localStorage.
 */
export function saveConstraintsProfile(profile: ConstraintsProfile): void {
  try {
    profile.lastUpdated = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save constraints profile:', e);
  }
}

/**
 * Serialize constraints profile to a human-readable string for AI prompts.
 * This replaces the hardcoded SOLO_DEV_CONTEXT in prompt builders.
 */
export function serializeConstraintsForPrompt(profile: ConstraintsProfile): string {
  const targetMarket = [
    profile.preferB2B ? 'B2B' : '',
    profile.preferB2C ? 'B2C' : ''
  ].filter(Boolean).join(' & ');

  const avoidSection = profile.avoidCategories.length > 0
    ? `\n- Avoid Categories: ${profile.avoidCategories.join(', ')}`
    : '';

  return `
Builder Profile (for personalized assessment):
- Tech Stack: ${profile.techStack.join(', ')}
- Experience Level: ${profile.experienceLevel}
- AI API Access: ${profile.hasAIAccess ? 'Yes' : 'No'}
- Available Time: ${profile.availableTime}
- Work Style: ${profile.workStyle}
- Revenue Goal: ${profile.revenueGoal}${profile.targetMRR ? ` (target: ${profile.targetMRR})` : ''}
- Preferred Products: ${profile.preferredFormFactors.join(', ')}
- Target Market: ${targetMarket}
- Risk Tolerance: ${profile.riskTolerance}${avoidSection}
`.trim();
}

/**
 * Reset constraints profile to defaults.
 */
export function resetConstraintsProfile(): ConstraintsProfile {
  const defaultProfile = { ...DEFAULT_CONSTRAINTS, lastUpdated: Date.now() };
  saveConstraintsProfile(defaultProfile);
  return defaultProfile;
}
