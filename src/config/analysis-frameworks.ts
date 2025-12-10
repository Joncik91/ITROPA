/**
 * Configuration for analysis framework types.
 * Centralizes labels and descriptions for all framework analysis types
 * used across the application. Follows Open/Closed Principle - extend
 * by adding new framework definitions, not modifying existing code.
 */

// ============ Mechanism Analysis Frameworks ============

export const MECHANISM_FRAMEWORKS = {
  functional: {
    label: 'Functional Decomposition',
    description: 'Breaking down the mechanism into functional components',
  },
  structural: {
    label: 'Structural Analysis',
    description: 'Analyzing the structural elements and relationships',
  },
  causal: {
    label: 'Causal Chain Mapping',
    description: 'Mapping cause and effect relationships',
  },
  'constraint-opportunity': {
    label: 'Constraint-Opportunity',
    description: 'Identifying constraints and opportunities',
  },
  'scale-context': {
    label: 'Scale-Context Transfer',
    description: 'Analyzing scale and context transferability',
  },
} as const;

export type MechanismFrameworkType = keyof typeof MECHANISM_FRAMEWORKS;

// ============ Pattern Analysis Frameworks ============

export const PATTERN_FRAMEWORKS = {
  'frequency-distribution': {
    label: 'Frequency & Distribution',
    description: 'Analyzing pattern frequency and distribution across domains',
  },
  'need-mapping': {
    label: 'Need Mapping',
    description: 'Mapping patterns to underlying human needs',
  },
  'evolution-trajectory': {
    label: 'Evolution Trajectory',
    description: 'Tracking how patterns evolve over time',
  },
  'combination-synergies': {
    label: 'Combination Synergies',
    description: 'Identifying synergistic pattern combinations',
  },
  'transfer-potential': {
    label: 'Transfer Potential',
    description: 'Assessing potential for cross-domain transfer',
  },
} as const;

export type PatternFrameworkType = keyof typeof PATTERN_FRAMEWORKS;

// ============ Chain Analysis Frameworks ============

export const CHAIN_FRAMEWORKS = {
  'lineage-tracing': {
    label: 'Lineage Tracing',
    description: 'Tracing the genealogy of innovations',
  },
  'influence-mapping': {
    label: 'Influence Mapping',
    description: 'Mapping influence relationships between innovations',
  },
  'divergence-patterns': {
    label: 'Divergence Patterns',
    description: 'Analyzing how innovations diverge and branch',
  },
  'innovation-velocity': {
    label: 'Innovation Velocity',
    description: 'Measuring the speed of innovation progression',
  },
  'coherence-assessment': {
    label: 'Coherence Assessment',
    description: 'Assessing the coherence of innovation chains',
  },
} as const;

export type ChainFrameworkType = keyof typeof CHAIN_FRAMEWORKS;

// ============ Prior Art Analysis Frameworks ============

export const PRIOR_ART_FRAMEWORKS = {
  'competitive-landscape': {
    label: 'Competitive Landscape',
    description: 'Analyzing the competitive market landscape',
  },
  'gap-analysis': {
    label: 'Gap Analysis',
    description: 'Identifying gaps in current solutions',
  },
  'evolution-pattern': {
    label: 'Evolution Pattern',
    description: 'Analyzing how the domain has evolved',
  },
  'innovation-potential': {
    label: 'Innovation Potential',
    description: 'Assessing potential for innovation',
  },
  'strategic-positioning': {
    label: 'Strategic Positioning',
    description: 'Identifying strategic positioning opportunities',
  },
} as const;

export type PriorArtFrameworkType = keyof typeof PRIOR_ART_FRAMEWORKS;

// ============ Combined Framework Type ============

export type AnalysisFrameworkType =
  | MechanismFrameworkType
  | PatternFrameworkType
  | ChainFrameworkType
  | PriorArtFrameworkType;

// ============ Helper Functions ============

/** All framework definitions combined */
const ALL_FRAMEWORKS = {
  ...MECHANISM_FRAMEWORKS,
  ...PATTERN_FRAMEWORKS,
  ...CHAIN_FRAMEWORKS,
  ...PRIOR_ART_FRAMEWORKS,
} as const;

/**
 * Get the human-readable label for a framework type.
 *
 * @param type - Framework type identifier
 * @param fallback - Fallback label if type not found (default: formats the type)
 * @returns Human-readable label
 */
export function getFrameworkLabel(type?: string, fallback?: string): string {
  if (!type) return fallback || 'General Analysis';

  const framework = ALL_FRAMEWORKS[type as keyof typeof ALL_FRAMEWORKS];
  if (framework) return framework.label;

  // Format the type as a fallback (e.g., "some-type" -> "Some Type")
  if (fallback) return fallback;
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get the description for a framework type.
 *
 * @param type - Framework type identifier
 * @returns Description or empty string
 */
export function getFrameworkDescription(type?: string): string {
  if (!type) return '';
  const framework = ALL_FRAMEWORKS[type as keyof typeof ALL_FRAMEWORKS];
  return framework?.description || '';
}

/**
 * Check if a type belongs to a specific framework category.
 */
export function isMechanismFramework(type: string): type is MechanismFrameworkType {
  return type in MECHANISM_FRAMEWORKS;
}

export function isPatternFramework(type: string): type is PatternFrameworkType {
  return type in PATTERN_FRAMEWORKS;
}

export function isChainFramework(type: string): type is ChainFrameworkType {
  return type in CHAIN_FRAMEWORKS;
}

export function isPriorArtFramework(type: string): type is PriorArtFrameworkType {
  return type in PRIOR_ART_FRAMEWORKS;
}
