/**
 * Hook for managing the user's Constraints Profile.
 * Provides reactive state for the profile and methods to update/reset it.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { ConstraintsProfile } from '../types';
import {
  getConstraintsProfile,
  saveConstraintsProfile,
  serializeConstraintsForPrompt,
  resetConstraintsProfile,
} from '../utils/constraints-storage';

export interface UseConstraintsReturn {
  /** Current constraints profile */
  profile: ConstraintsProfile;
  /** Update specific fields in the profile */
  updateProfile: (updates: Partial<ConstraintsProfile>) => void;
  /** Replace the entire profile */
  setProfile: (profile: ConstraintsProfile) => void;
  /** Reset to default constraints */
  resetProfile: () => void;
  /** Serialized constraints for AI prompts */
  promptContext: string;
  /** Whether the filter is enabled (stored separately) */
  filterEnabled: boolean;
  /** Toggle the filter on/off */
  setFilterEnabled: (enabled: boolean) => void;
}

const FILTER_STORAGE_KEY = 'itropa-constraints-filter-enabled';

function getFilterEnabled(): boolean {
  try {
    const stored = localStorage.getItem(FILTER_STORAGE_KEY);
    return stored === 'true';
  } catch {
    return false;
  }
}

function saveFilterEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(FILTER_STORAGE_KEY, String(enabled));
  } catch (e) {
    console.error('Failed to save filter state:', e);
  }
}

export function useConstraints(): UseConstraintsReturn {
  const [profile, setProfileState] = useState<ConstraintsProfile>(() => getConstraintsProfile());
  const [filterEnabled, setFilterEnabledState] = useState(() => getFilterEnabled());

  // Sync with localStorage on mount (in case it changed in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'itropa-constraints-profile' && e.newValue) {
        try {
          setProfileState(JSON.parse(e.newValue));
        } catch {
          // Ignore parse errors
        }
      }
      if (e.key === FILTER_STORAGE_KEY) {
        setFilterEnabledState(e.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateProfile = useCallback((updates: Partial<ConstraintsProfile>) => {
    setProfileState(current => {
      const newProfile = { ...current, ...updates };
      saveConstraintsProfile(newProfile);
      return newProfile;
    });
  }, []);

  const setProfile = useCallback((newProfile: ConstraintsProfile) => {
    saveConstraintsProfile(newProfile);
    setProfileState(newProfile);
  }, []);

  const resetProfile = useCallback(() => {
    const defaultProfile = resetConstraintsProfile();
    setProfileState(defaultProfile);
  }, []);

  const setFilterEnabled = useCallback((enabled: boolean) => {
    saveFilterEnabled(enabled);
    setFilterEnabledState(enabled);
  }, []);

  const promptContext = useMemo(
    () => serializeConstraintsForPrompt(profile),
    [profile]
  );

  return {
    profile,
    updateProfile,
    setProfile,
    resetProfile,
    promptContext,
    filterEnabled,
    setFilterEnabled,
  };
}
