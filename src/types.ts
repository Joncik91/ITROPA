// Type definitions for ITROPA

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
  }>;
  untappedDomains?: Array<{
    domain: string;
    opportunity: string;
    novelty: string;
  }>;
  combinationPotential?: string[];
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
