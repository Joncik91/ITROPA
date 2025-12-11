// Type definitions for ITROPA

// ============ CONSTRAINTS PROFILE ============

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

export interface Inspiration {
  source: string;
  mechanism: string;
  twist?: string;
}

export interface IndustryExpression {
  id: string;
  type: 'future';
  name: string;
  mutation: string;
  insight: string;
  inspirations: Inspiration[];
  children: IndustryExpression[];
  userAdded?: boolean;
  crossPollinated?: boolean;
  sourceExpressions?: string[];
  // Enhanced cross-pollination metadata
  combinationType?: string; // Which combination strategy was used
  synergyScore?: number; // 0-100 rating of how well components work together
  noveltyFactor?: number; // 0-100 rating of uniqueness
  marketFit?: string; // Target audience and use case
  challenges?: string[]; // Potential obstacles to implementation
}

export interface Era {
  name: string;
  expressions: IndustryExpression[] | string[];
}

export interface PriorArtItem {
  name: string;
  domain?: string;
  mechanism: string;
  limitation?: string;
  era?: string;
  lesson?: string;
  originalDomain?: string;
  transferPotential?: string;
  biomimicryPotential?: string;
}

export interface PriorArt {
  currentLeaders?: PriorArtItem[];
  historicalPrecedents?: PriorArtItem[];
  adjacentDomains?: PriorArtItem[];
  natureSolutions?: PriorArtItem[];
}

export interface Need {
  id: string;
  name: string;
  icon: string;
  description: string;
  priorArt?: PriorArt;
  eras: Era[];
  relatedNeeds?: string[];
}

export interface MechanismDetails {
  coreMechanism: string;
  abstractPattern: string;
  historicalApplications?: Array<{
    domain: string;
    example: string;
    era: string;
    successFactors?: string;
    limitations?: string;
    evolutionPath?: string;
  }>;
  untappedDomains?: Array<{
    domain: string;
    opportunity: string;
    novelty: string;
    transferBarriers?: string;
    requiredAdaptations?: string;
    impactPotential?: 'low' | 'medium' | 'high';
  }>;
  combinationPotential?: string[];
  // Enhanced metadata fields for systematic analysis
  analysisType?: 'functional' | 'structural' | 'causal' | 'constraint-opportunity' | 'scale-context';
  transferPotential?: number; // 0-100: How easily mechanism transfers to other domains
  abstractionLevel?: 'low' | 'medium' | 'high'; // How fundamental vs domain-specific
  maturityScore?: number; // 0-100: How well-established/proven
  complexityRating?: 'low' | 'medium' | 'high'; // Implementation difficulty
  universality?: 'narrow' | 'moderate' | 'broad'; // How many domains can apply it
  disruptionPotential?: 'low' | 'medium' | 'high'; // Impact of cross-domain transfer
  // Framework-specific analysis fields
  keyPrinciples?: Array<{
    principle: string;
    function: string;
    criticality: string;
  }>; // For functional decomposition
  structuralElements?: Array<{
    element: string;
    role: string;
    interactions: string;
  }>; // For structural analysis
  causalChain?: {
    trigger: string;
    sequence: string[];
    outcome: string;
    interventionPoints: string[];
  }; // For causal chain mapping
  constraintOpportunities?: Array<{
    constraint: string;
    opportunity: string;
    application: string;
  }>; // For constraint-opportunity analysis
  scaleContextInsights?: {
    microScale: string;
    mesoScale: string;
    macroScale: string;
    contextVariations: string[];
  }; // For scale-context transfer
}

export interface DeepDiveDetails {
  marketOpportunity: string;
  keyEnablers: string[];
  challenges: Array<{
    challenge: string;
    potentialSolution: string;
  }>;
  timeline: string;
  firstMoverAdvantage?: string;
  priorArtLeverage?: string;
  keyPlayers?: string[];
  risks?: string[];
  // Enhanced Deep Dive - Opportunity Scoring
  opportunityScore?: {
    marketTiming: number;        // 0-100: Is the window now?
    technicalFit: number;        // 0-100: Can you build this?
    effortEstimate: number;      // 0-100: How much work? (100=easy)
    monetizationClarity: number; // 0-100: How obvious is revenue?
    competitionDensity: number;  // 0-100: Blue ocean score (100=wide open)
    overallScore: number;        // Weighted average
  };
  soloDevAssessment?: {
    feasibility: 'high' | 'medium' | 'low';
    timeToMVP: string;           // e.g., "2-4 weeks"
    techStack: string[];         // e.g., ["React", "Node", "Gemini API"]
    biggestChallenge: string;
    unfairAdvantage: string;     // What edge could you have?
  };
  monetizationModels?: Array<{
    model: string;               // e.g., "SaaS Subscription"
    description: string;
    revenueRange: string;        // e.g., "$500-2000/mo"
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  buildRecommendation?: {
    verdict: 'build' | 'explore' | 'skip';
    confidence: number;          // 0-100
    reasoning: string;
    nextStep: string;            // Actionable next step
  };
}

export interface SuggestedNeed {
  name: string;
  icon: string;
}

export interface ModalState {
  open: boolean;
  needId: string | null;
  parentId: string | null;
}

export interface CrossPollinateState {
  open: boolean;
  items: IndustryExpression[];
  result: IndustryExpression[] | null;
}

export interface FormData {
  name: string;
  mutation: string;
  insight: string;
}

export interface PatternAnalysis {
  patternName: string;
  abstractDescription: string;
  occurrenceCount: number;
  // Framework-specific analysis fields
  analysisType?: 'frequency-distribution' | 'need-mapping' | 'evolution-trajectory' | 'combination-synergies' | 'transfer-potential';
  
  // Frequency & Distribution Analysis
  distributionMap?: {
    needs: Array<{
      needName: string;
      count: number;
      dominance: number; // 0-100: how dominant in this need
    }>;
    industries: Array<{
      industryName: string;
      context: string;
    }>;
    hotZones: string[]; // Needs with high concentration
    coldZones: string[]; // Underutilized needs
    densityScore: number; // 0-100: distribution uniformity
  };
  
  // Need-Mapping Analysis
  needAdaptations?: Array<{
    needName: string;
    adaptation: string; // How pattern serves this specific need
    effectiveness: 'low' | 'medium' | 'high';
    uniqueCharacteristics: string;
    examples: string[];
  }>;
  
  // Evolution Trajectory Analysis
  evolutionStages?: {
    earlyAdopters: Array<{
      industry: string;
      innovation: string;
      era: string;
    }>;
    mainstreamPhase: {
      description: string;
      timeframe: string;
      catalysts: string[];
    };
    maturityIndicators: string[];
    nextEvolution: string; // Predicted next stage
    evolutionSpeed: 'slow' | 'moderate' | 'rapid';
  };
  
  // Combination Synergies Analysis
  synergyPatterns?: {
    strongPairings: Array<{
      pattern: string;
      synergyType: string;
      benefit: string;
      examples: string[];
    }>;
    antiPatterns: Array<{
      pattern: string;
      conflict: string;
      mitigation: string;
    }>;
    optimalStacks: Array<{
      stackName: string;
      patterns: string[];
      useCase: string;
    }>;
    coOccurrenceRate: number; // 0-100: how often appears with other patterns
  };
  
  // Transfer Potential Analysis
  transferTargets?: Array<{
    targetNeed: string;
    targetIndustry: string;
    transferDifficulty: 'low' | 'medium' | 'high';
    expectedImpact: 'low' | 'medium' | 'high';
    requiredAdaptations: string[];
    marketGap: string;
    timeToImplementation: string;
  }>;
  
  // Metadata scores and ratings
  strengthScore?: number; // 0-100: Robustness and reliability
  universalityScore?: number; // 0-100: Broad applicability
  maturityLevel?: number; // 0-100: How evolved/refined
  adoptionRate?: number; // 0-100: Speed of spread
  needCoverage?: 'narrow' | 'moderate' | 'broad'; // How many needs it serves
  stabilityRating?: 'stable' | 'evolving' | 'emerging'; // Lifecycle stage
  combinationAffinity?: 'low' | 'medium' | 'high'; // Works well with others
  transferReadiness?: 'low' | 'medium' | 'high'; // Ready for new domains
  
  // Core insights
  keyInsight?: string;
  strategicImplications?: string[];
  risks?: string[];
}

export interface PriorArtAnalysis {
  needName: string;
  // Framework-specific analysis fields
  analysisType?: 'competitive-landscape' | 'gap-analysis' | 'evolution-pattern' | 'innovation-potential' | 'strategic-positioning';
  
  // Competitive Landscape Mapping
  competitiveSegments?: Array<{
    segmentName: string;
    players: string[];
    marketShare: string;
    competitiveIntensity: 'low' | 'medium' | 'high';
  }>;
  leaderProfiles?: Array<{
    name: string;
    position: string;
    keyStrength: string;
    vulnerability: string;
  }>;
  competitiveDynamics?: {
    primaryBattlegrounds: string[];
    emergingThreats: string[];
    consolidationTrends: string;
  };
  
  // Gap Analysis
  unmetNeeds?: Array<{
    need: string;
    severity: 'low' | 'medium' | 'high';
    affectedSegment: string;
    currentWorkarounds: string;
  }>;
  underservedSegments?: Array<{
    segment: string;
    size: string;
    whyUnderserved: string;
    opportunity: string;
  }>;
  whiteSpaces?: Array<{
    opportunity: string;
    description: string;
    accessibilityRating: 'low' | 'medium' | 'high';
    potentialImpact: 'low' | 'medium' | 'high';
  }>;
  
  // Evolution Pattern Recognition
  evolutionTimeline?: Array<{
    era: string;
    dominantSolution: string;
    keyInnovation: string;
    limitation: string;
  }>;
  evolutionDrivers?: {
    technological: string[];
    social: string[];
    economic: string[];
  };
  futureStages?: Array<{
    stage: string;
    timeframe: string;
    triggers: string[];
    implications: string;
  }>;
  disruptiveTriggers?: string[];
  
  // Innovation Potential Assessment
  innovationOpportunities?: Array<{
    type: string; // incremental/adjacent/breakthrough
    description: string;
    riskLevel: 'low' | 'medium' | 'high';
    expectedImpact: 'low' | 'medium' | 'high';
    timeToMarket: string;
    resourceRequirements: string;
  }>;
  quickWins?: Array<{
    opportunity: string;
    effort: string;
    impact: string;
  }>;
  longTermBets?: Array<{
    opportunity: string;
    rationale: string;
    investmentHorizon: string;
  }>;
  
  // Strategic Positioning Recommendations
  positioningStrategies?: Array<{
    strategy: string;
    rationale: string;
    targetSegment: string;
    successFactors: string[];
  }>;
  differentiationPillars?: Array<{
    pillar: string;
    howToDifferentiate: string;
    competitiveAdvantage: string;
  }>;
  entryTactics?: Array<{
    tactic: string;
    approach: string;
    risks: string[];
    mitigations: string[];
  }>;
  partnershipOpportunities?: Array<{
    partner: string;
    value: string;
    synergy: string;
  }>;
  
  // Metadata scores and ratings
  competitiveIntensity?: number; // 0-100: How crowded the market is
  marketMaturity?: number; // 0-100: How established the market is
  innovationOpportunity?: number; // 0-100: Room for innovation
  whiteSpaceScore?: number; // 0-100: Unexplored territory
  disruptionPotential?: number; // 0-100: Likelihood of disruption
  entryBarrier?: 'low' | 'medium' | 'high'; // Difficulty to enter
  competitiveStructure?: 'monopoly' | 'oligopoly' | 'fragmented'; // Market concentration
  innovationPace?: 'slow' | 'moderate' | 'rapid'; // Rate of change
  customerSatisfaction?: 'low' | 'medium' | 'high'; // Current satisfaction
  
  // Core insights
  keyInsight?: string;
  strategicImperatives?: string[];
  criticalRisks?: string[];
}

// AI Assistant Types
export interface AIToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required: string[];
  };
}

export interface AIActionSuggestion {
  id: string;
  action: string;
  reasoning: string;
  actionType: 'create_need' | 'compare' | 'branch' | 'analyze' | 'find_similar' | 'extract' | 'apply_pattern';
  params: Record<string, any>;
}

export interface AIAssistantContext {
  contextType: 'need' | 'mechanism' | 'deepdive' | 'pattern';
  contextId: string;
  data: any;
  relatedData?: any;
}

export interface AIAssistantResponse {
  suggestions: AIActionSuggestion[];
  reasoning: string;
  executedActions?: any[];
}

export interface HistoryAction {
  id: string;
  type: 'add_need' | 'delete_need' | 'close_need' | 'branch' | 'add_child' | 'delete_expression' | 'cross_pollinate' | 'fetch_mechanism' | 'fetch_deepdive';
  timestamp: number;
  description: string;
  data: {
    needId?: string;
    expressionId?: string;
    parentId?: string;
    previousState?: any;
    newState?: any;
  };
}

export interface HistoryState {
  past: HistoryAction[];
  future: HistoryAction[];
  canUndo: boolean;
  canRedo: boolean;
}

// ============ CHAIN ANALYSIS ============

export interface ChainAnalysis {
  analysisType: 'lineage-tracing' | 'influence-mapping' | 'divergence-patterns' | 'innovation-velocity' | 'coherence-assessment';
  summary: string;
  keyInsights: string[];
  
  // Framework-specific fields (conditionally present based on analysisType)
  
  // Lineage Tracing
  generationDepth?: number;
  totalNodes?: number;
  longestPath?: Array<{ node: string; depth: number }>;
  branchingPoints?: Array<{ node: string; branchCount: number; generation: number }>;
  evolutionaryPathways?: Array<{
    path: string[];
    theme: string;
    coherence: string;
  }>;
  ancestorInfluence?: Array<{ ancestor: string; descendantCount: number; influenceScore: number }>;
  
  // Influence Mapping
  centralNodes?: Array<{
    node: string;
    centralityScore: number; // 0-100
    influenceRadius: number; // how many nodes affected
    role: string; // "hub", "bridge", "leaf", "pioneer"
  }>;
  inspirationSources?: Array<{
    source: string;
    frequency: number;
    domains: string[];
    impactScore: number;
  }>;
  influenceFlows?: Array<{
    from: string;
    to: string[];
    mechanism: string;
    strength: 'weak' | 'moderate' | 'strong';
  }>;
  networkDensity?: number; // 0-100, how interconnected
  
  // Divergence Patterns
  branchingStrategy?: 'focused' | 'exploratory' | 'balanced' | 'scattered';
  diversityScore?: number; // 0-100
  specializationNodes?: Array<{
    node: string;
    specializationType: 'deep' | 'narrow' | 'technical';
    depth: number;
  }>;
  generalizationNodes?: Array<{
    node: string;
    breadth: number;
    applicability: string;
  }>;
  noveltyHotspots?: Array<{
    node: string;
    noveltyScore: number;
    innovationType: 'incremental' | 'adjacent' | 'radical';
  }>;
  convergencePoints?: Array<{
    node: string;
    convergedFrom: string[];
    synthesis: string;
  }>;
  
  // Innovation Velocity
  overallVelocity?: 'slow' | 'steady' | 'fast' | 'explosive';
  velocityScore?: number; // 0-100
  accelerationZones?: Array<{
    nodes: string[];
    period: string;
    triggerEvent?: string;
    velocityChange: string;
  }>;
  stagnationZones?: Array<{
    nodes: string[];
    reason: string;
    duration: string;
    recoveryPotential: 'low' | 'medium' | 'high';
  }>;
  innovationWaves?: Array<{
    wave: number;
    nodes: string[];
    theme: string;
    momentum: string;
  }>;
  maturityCurve?: Array<{
    stage: string;
    nodes: string[];
    characteristics: string;
  }>;
  
  // Coherence Assessment
  overallCoherence?: 'fragmented' | 'loosely-connected' | 'coherent' | 'tightly-integrated';
  coherenceScore?: number; // 0-100
  logicalGaps?: Array<{
    between: string[];
    gapType: string;
    missingLink: string;
    severity: 'minor' | 'moderate' | 'major';
  }>;
  strongConnections?: Array<{
    nodes: string[];
    connectionType: string;
    strength: number;
    rationale: string;
  }>;
  weakConnections?: Array<{
    nodes: string[];
    reason: string;
    improvementSuggestion: string;
  }>;
  thematicClusters?: Array<{
    theme: string;
    nodes: string[];
    cohesion: number;
  }>;
  
  // Common metadata across all frameworks
  chainComplexity?: 'simple' | 'moderate' | 'complex' | 'highly-complex';
  innovationPotential?: number; // 0-100
  strategicValue?: 'low' | 'medium' | 'high' | 'critical';
  recommendedActions?: string[];
}

// ============ APP CONCEPT GENERATOR ============

export interface AppConcept {
  id: string;
  name: string;                    // e.g., "InsightFlow"
  tagline: string;                 // e.g., "AI-powered industry analysis for indie hackers"
  formFactor: 'saas' | 'tool' | 'api' | 'marketplace' | 'extension' | 'mobile';
  targetUser: string;              // e.g., "Solo entrepreneurs exploring new markets"
  problemSolved: string;           // One sentence
  coreFeature: string;             // The ONE thing it does
  monetization: {
    model: string;                 // e.g., "Freemium SaaS"
    pricing: string;               // e.g., "$19/mo Pro, $49/mo Team"
    revenueEstimate: string;       // e.g., "$2-5k MRR at 100 users"
  };
  techStack: string[];             // e.g., ["React", "Supabase", "Gemini"]
  mvpScope: string;                // What's the smallest viable version?
  effortEstimate: 'weekend' | '1-2 weeks' | '2-4 weeks' | '1-2 months' | '3+ months';
  competitiveEdge: string;         // Why would this win?
  risks: string[];                 // Top 2-3 risks
  score: number;                   // 0-100 overall viability
}

export interface AppConceptAnalysis {
  industryId: string;
  industryName: string;
  concepts: AppConcept[];
  generatedAt: number;
  inputContext?: {
    deepDiveAvailable: boolean;
    marketOpportunity?: string;
  };
}

// Re-export manager interfaces for convenience
export type {
  NeedState,
  SelectionState,
  LoadingState,
  UIState,
  AIState,
  NeedOperations,
  ExpressionOperations,
  AnalysisOperations,
  CrossPollinateOperations,
  HistoryOperations,
  AIOperations,
  StateSetters,
  ModalOperations,
  HomePageManager,
  NeedDisplayManager,
  BranchManager,
  ModalManager,
} from './types/manager-interfaces';

