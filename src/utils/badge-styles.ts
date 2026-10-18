/**
 * Rating → badge tone, shared by every view that shows AI ratings
 * (high/medium/low, stable/emerging, simple/complex, …).
 */
import type { Tone } from '../components/ui/Chip';

const RATING_TONES: Record<string, Tone> = {
  high: 'ok',
  medium: 'warn',
  low: 'neutral',
  broad: 'accent',
  moderate: 'neutral',
  narrow: 'neutral',
  stable: 'ok',
  evolving: 'warn',
  emerging: 'pollen',
  rapid: 'bad',
  fast: 'warn',
  slow: 'neutral',
  steady: 'accent',
  simple: 'ok',
  complex: 'warn',
  'highly-complex': 'bad',
  critical: 'pollen',
};

/** Tone for a rating value; unknown values fall back to neutral. */
export function ratingTone(rating: string | undefined): Tone {
  return RATING_TONES[rating?.toLowerCase() ?? ''] ?? 'neutral';
}
