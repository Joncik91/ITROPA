import { afterEach, describe, expect, it, vi } from 'vitest';
import { hasSavedProfile } from './profile';

const KEY = 'itropa-constraints-profile';
const withStorage = (value: string | null) => vi.stubGlobal('localStorage', { getItem: (k: string) => (k === KEY ? value : null) });
afterEach(() => vi.unstubAllGlobals());

describe('hasSavedProfile (check 5b)', () => {
  it('is false with nothing stored and with unreadable data, true for a real profile', () => {
    withStorage(null);
    expect(hasSavedProfile()).toBe(false);
    withStorage('{not json');
    expect(hasSavedProfile()).toBe(false);
    withStorage('"a string"');
    expect(hasSavedProfile()).toBe(false);
    withStorage(JSON.stringify({ techStack: ['Go'] }));
    expect(hasSavedProfile()).toBe(true);
  });
});
