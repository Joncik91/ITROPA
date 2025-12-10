/**
 * Segregated interfaces for manager prop following Interface Segregation Principle.
 * Components should only depend on the interfaces they actually use.
 */

import type {
  Need,
  IndustryExpression,
  FormData,
  CrossPollinateState,
  AIAssistantResponse,
  HistoryState,
} from '../types';

// ============ State Interfaces ============

/** Core need state - what needs exist and which is active */
export interface NeedState {
  needs: Need[];
  activeTab: string | null;
  activeNeed: Need | undefined;
}

/** Selection and modal state */
export interface SelectionState {
  selected: IndustryExpression | null;
  deepDive: any;
  mechanism: any;
  crossPollinate: CrossPollinateState;
  modal: { open: boolean; needId: string | null; parentId: string | null };
  formData: FormData;
}

/** Loading states for various operations */
export interface LoadingState {
  loading: boolean;
  loadingStage: string;
  branchLoading: string | null;
  mechanismLoading: boolean;
  deepDiveLoading: boolean;
  crossLoading: boolean;
  aiLoading: boolean;
  error: string | null;
}

/** UI display states */
export interface UIState {
  showPriorArt: Record<string, boolean>;
  expandedBranches: Record<string, boolean>;
}

/** AI Assistant suggestions state */
export interface AIState {
  mechanismAISuggestions: AIAssistantResponse | null;
  deepDiveAISuggestions: AIAssistantResponse | null;
  needAISuggestions: AIAssistantResponse | null;
}

// ============ Operations Interfaces ============

/** Core CRUD operations on needs */
export interface NeedOperations {
  fetchNeed: (needName: string, userDescription?: string) => Promise<void>;
  closeNeed: (needId: string) => void;
  removeNeed: (needId: string) => void;
  clearAll: () => void;
}

/** Operations for branching and expressions */
export interface ExpressionOperations {
  branchIndustry: (expr: IndustryExpression, needId: string) => Promise<void>;
  addPrediction: (needId: string, parentId: string | null, formData: FormData) => void;
  addCrossPollinationResult: (expr: IndustryExpression, needId: string) => void;
}

/** Operations for analysis (mechanism, deep dive) */
export interface AnalysisOperations {
  fetchMechanism: (expr: IndustryExpression) => Promise<void>;
  fetchDeepDive: (expr: IndustryExpression) => Promise<void>;
}

/** Operations for cross-pollination */
export interface CrossPollinateOperations {
  executeCrossPollinate: () => Promise<void>;
  toggleCrossItem: (expr: IndustryExpression) => void;
}

/** History operations (undo/redo) */
export interface HistoryOperations {
  history: HistoryState;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
}

/** AI Assistant operations */
export interface AIOperations {
  requestMechanismAIAssist: (mechanismId: string) => Promise<void>;
  requestDeepDiveAIAssist: (deepDiveId: string) => Promise<void>;
  requestNeedAIAssist: (needId: string) => Promise<void>;
  executeAIAction: (suggestion: any) => Promise<void>;
}

/** State setters - for components that need to modify state directly */
export interface StateSetters {
  setActiveTab: (tab: string | null) => void;
  setFormData: (data: FormData) => void;
  setError: (error: string | null) => void;
  setShowPriorArt: (value: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;
  setExpandedBranches: (value: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;
  setModal: (modal: { open: boolean; needId: string | null; parentId: string | null }) => void;
  setMechanism: (mechanism: any) => void;
  setDeepDive: (deepDive: any) => void;
  setCrossPollinate: (value: CrossPollinateState | ((prev: CrossPollinateState) => CrossPollinateState)) => void;
  setNeeds: (value: Need[] | ((prev: Need[]) => Need[])) => void;
}

/** Modal operations */
export interface ModalOperations {
  closeAllModals: () => void;
}

// ============ Composite Interfaces ============

/** Everything needed for the HomePage component */
export interface HomePageManager extends
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
  ModalOperations {}

/** Minimal interface for read-only need display */
export interface NeedDisplayManager extends
  NeedState,
  UIState {}

/** Interface for branch rendering */
export interface BranchManager extends
  Pick<LoadingState, 'branchLoading' | 'mechanismLoading' | 'deepDiveLoading'>,
  Pick<UIState, 'expandedBranches'>,
  ExpressionOperations,
  AnalysisOperations,
  CrossPollinateOperations {
  setExpandedBranches: StateSetters['setExpandedBranches'];
}

/** Interface for modal content */
export interface ModalManager extends
  Pick<SelectionState, 'mechanism' | 'deepDive' | 'crossPollinate'>,
  Pick<LoadingState, 'crossLoading'>,
  Pick<AIState, 'mechanismAISuggestions' | 'deepDiveAISuggestions'>,
  Pick<AIOperations, 'requestMechanismAIAssist' | 'requestDeepDiveAIAssist' | 'executeAIAction'>,
  CrossPollinateOperations,
  ModalOperations {
  setMechanism: StateSetters['setMechanism'];
  setDeepDive: StateSetters['setDeepDive'];
}
