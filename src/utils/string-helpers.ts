/**
 * String manipulation utilities for consistent ID and key generation.
 */

/**
 * Normalize a string for use as a database ID or cache key.
 * Converts to lowercase, trims whitespace, and replaces spaces with hyphens.
 *
 * @param value - String to normalize
 * @returns Normalized string suitable for IDs
 *
 * @example
 * normalizeToId("My Pattern Name") // "my-pattern-name"
 * normalizeToId("  Test  Item  ")  // "test-item"
 */
export function normalizeToId(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, '-');
}

/**
 * Normalize a string for use as a cache key.
 * Converts to lowercase and trims whitespace.
 *
 * @param value - String to normalize
 * @returns Normalized string suitable for cache keys
 *
 * @example
 * normalizeToKey("My Cache Key") // "my cache key"
 */
export function normalizeToKey(value: string): string {
  return value.toLowerCase().trim();
}

/**
 * Convert a kebab-case or snake_case string to Title Case.
 *
 * @param value - String to convert
 * @returns Title case string
 *
 * @example
 * toTitleCase("some-type")    // "Some Type"
 * toTitleCase("another_type") // "Another Type"
 */
export function toTitleCase(value: string): string {
  return value
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Truncate a string to a maximum length, adding ellipsis if needed.
 *
 * @param value - String to truncate
 * @param maxLength - Maximum length
 * @param ellipsis - Ellipsis string (default: '...')
 * @returns Truncated string
 */
export function truncate(value: string, maxLength: number, ellipsis: string = '...'): string {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength - ellipsis.length) + ellipsis;
}
