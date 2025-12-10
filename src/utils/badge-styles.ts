/**
 * Shared badge styling utilities for consistent rating/status display.
 * Eliminates duplicate getRatingBadge implementations across components.
 */

/** Rating color definitions for light and dark modes */
const RATING_COLORS: Record<string, { dark: string; light: string }> = {
  // Semantic ratings
  high: {
    dark: 'bg-green-500/20 text-green-400 border-green-500/30',
    light: 'bg-green-100 text-green-700 border-green-300',
  },
  medium: {
    dark: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    light: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  },
  low: {
    dark: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    light: 'bg-gray-100 text-gray-700 border-gray-300',
  },

  // Scope/coverage
  broad: {
    dark: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    light: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  moderate: {
    dark: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    light: 'bg-gray-100 text-gray-700 border-gray-300',
  },
  narrow: {
    dark: 'bg-gray-600/20 text-gray-400 border-gray-600/30',
    light: 'bg-gray-200 text-gray-700 border-gray-400',
  },

  // Stability
  stable: {
    dark: 'bg-green-500/20 text-green-400 border-green-500/30',
    light: 'bg-green-100 text-green-700 border-green-300',
  },
  evolving: {
    dark: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    light: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  },
  emerging: {
    dark: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    light: 'bg-pink-100 text-pink-700 border-pink-300',
  },

  // Speed/pace
  rapid: {
    dark: 'bg-red-500/20 text-red-400 border-red-500/30',
    light: 'bg-red-100 text-red-700 border-red-300',
  },
  fast: {
    dark: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    light: 'bg-orange-100 text-orange-700 border-orange-300',
  },
  slow: {
    dark: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    light: 'bg-gray-100 text-gray-700 border-gray-300',
  },
  steady: {
    dark: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    light: 'bg-blue-100 text-blue-700 border-blue-300',
  },

  // Complexity
  simple: {
    dark: 'bg-green-500/20 text-green-400 border-green-500/30',
    light: 'bg-green-100 text-green-700 border-green-300',
  },
  complex: {
    dark: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    light: 'bg-orange-100 text-orange-700 border-orange-300',
  },
  'highly-complex': {
    dark: 'bg-red-500/20 text-red-400 border-red-500/30',
    light: 'bg-red-100 text-red-700 border-red-300',
  },

  // Strategic value
  critical: {
    dark: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    light: 'bg-purple-100 text-purple-700 border-purple-300',
  },
};

/**
 * Get CSS classes for a rating badge.
 *
 * @param rating - The rating value (high, medium, low, etc.)
 * @param dark - Whether dark mode is active
 * @param defaultRating - Fallback rating if none provided (default: 'medium')
 * @returns CSS class string for the badge
 */
export function getRatingColor(
  rating: string | undefined,
  dark: boolean,
  defaultRating: string = 'medium'
): string {
  const normalizedRating = rating?.toLowerCase() || defaultRating;
  const colorSet = RATING_COLORS[normalizedRating] || RATING_COLORS[defaultRating];
  return dark ? colorSet.dark : colorSet.light;
}

/**
 * Get full badge CSS classes including layout styles.
 *
 * @param rating - The rating value
 * @param dark - Whether dark mode is active
 * @param variant - Badge style variant
 * @returns Full CSS class string for the badge
 */
export function getRatingBadgeClasses(
  rating: string | undefined,
  dark: boolean,
  variant: 'pill' | 'rounded' | 'square' = 'pill'
): string {
  const colorClasses = getRatingColor(rating, dark);

  const variantClasses = {
    pill: 'px-2 py-0.5 rounded-full text-xs border',
    rounded: 'px-2 py-0.5 rounded text-xs border',
    square: 'px-2 py-0.5 text-xs border',
  };

  return `${variantClasses[variant]} ${colorClasses}`;
}

/**
 * Create a getRatingBadge function bound to a specific dark mode setting.
 * Useful for components that need the function in multiple places.
 *
 * @param dark - Whether dark mode is active
 * @returns A function that takes rating and returns CSS classes
 */
export function createRatingBadgeGetter(dark: boolean) {
  return (rating?: string) => getRatingBadgeClasses(rating, dark);
}
