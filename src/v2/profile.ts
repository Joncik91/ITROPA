import { DEFAULT_CONSTRAINTS, type ConstraintsProfile } from '../types';
import { getConstraintsProfile, saveConstraintsProfile } from '../utils/constraints-storage';

// Same key as src/utils/constraints-storage.ts (private there), so V1 and V2 share one profile.
const STORAGE_KEY = 'itropa-constraints-profile';

/** True once the person has saved a profile; false means the default is in use. */
export function hasSavedProfile(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // Same test as getConstraintsProfile: anything it cannot read as a profile means the default is in use.
    const parsed: unknown = raw === null ? null : JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null;
  } catch {
    return false;
  }
}

export const loadProfile = (): ConstraintsProfile => ({ ...DEFAULT_CONSTRAINTS, ...getConstraintsProfile() });
export const saveProfile = (profile: ConstraintsProfile): void => saveConstraintsProfile(profile);
