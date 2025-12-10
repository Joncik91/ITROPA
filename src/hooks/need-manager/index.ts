import toast from 'react-hot-toast';
import { useHistory } from '../useHistory';
import { useNeedState } from './useNeedState';
import { useUIState } from './useUIState';
import { useNeedCRUD } from './useNeedCRUD';
import { useTreeOperations } from './useTreeOperations';
import { useExpressionAnalysis } from './useExpressionAnalysis';
import { useCrossPollination } from './useCrossPollination';
import { useAIAssistant } from './useAIAssistant';
import type { Need } from '../../types';

/**
 * Composed hook that integrates all need manager functionality.
 * Maintains the same API as the original useNeedManager for backwards compatibility.
 */
export function useNeedManager() {
  // Initialize all sub-hooks
  const history = useHistory();
  const needState = useNeedState();
  const uiState = useUIState();

  // Initialize CRUD operations with dependencies
  const crud = useNeedCRUD({
    needs: needState.needs,
    setNeeds: needState.setNeeds,
    activeTab: needState.activeTab,
    setActiveTab: needState.setActiveTab,
    cache: needState.cache,
    setCache: needState.setCache,
    setLoading: needState.setLoading,
    setLoadingStage: needState.setLoadingStage,
    setError: needState.setError,
    setShowPriorArt: uiState.setShowPriorArt,
    setExpandedBranches: uiState.setExpandedBranches,
    history,
  });

  // Initialize tree operations with dependencies
  const tree = useTreeOperations({
    needs: needState.needs,
    setNeeds: needState.setNeeds,
    setBranchLoading: uiState.setBranchLoading,
    setExpandedBranches: uiState.setExpandedBranches,
    modal: uiState.modal,
    setModal: uiState.setModal,
    formData: uiState.formData,
    setFormData: uiState.setFormData,
    crossPollinate: uiState.crossPollinate,
    history,
  });

  // Initialize analysis operations with dependencies
  const analysis = useExpressionAnalysis({
    setMechanism: uiState.setMechanism,
    setMechanismLoading: uiState.setMechanismLoading,
    setDeepDive: uiState.setDeepDive,
    setDeepDiveLoading: uiState.setDeepDiveLoading,
  });

  // Initialize cross-pollination with dependencies
  const cross = useCrossPollination({
    crossPollinate: uiState.crossPollinate,
    setCrossPollinate: uiState.setCrossPollinate,
    setCrossLoading: uiState.setCrossLoading,
  });

  // Initialize AI assistant with dependencies
  const ai = useAIAssistant({
    needs: needState.needs,
    setNeeds: needState.setNeeds,
    activeNeed: needState.activeNeed,
    fetchMechanism: analysis.fetchMechanism,
    fetchDeepDive: analysis.fetchDeepDive,
    branchIndustry: tree.branchIndustry,
  });

  // Undo/Redo action handlers that apply state changes
  const undo = () => {
    const action = history.popUndo();
    if (!action) return;

    // Restore previous state based on action type
    switch (action.type) {
      case 'add_need':
        if (action.data.needId) {
          needState.setNeeds((prev: Need[]) => prev.filter(n => n.id !== action.data.needId));
          toast.success('Undid: Add need');
        }
        break;

      case 'delete_need':
        if (action.data.previousState) {
          needState.setNeeds((prev: Need[]) => [...prev, action.data.previousState]);
          toast.success('Undid: Delete need');
        }
        break;

      case 'close_need':
        if (action.data.previousState) {
          needState.setNeeds((prev: Need[]) => [...prev, action.data.previousState]);
          needState.setActiveTab(action.data.needId);
          toast.success('Undid: Close need');
        }
        break;

      case 'branch':
      case 'add_child':
      case 'delete_expression':
        if (action.data.needId && action.data.previousState) {
          needState.setNeeds((prev: Need[]) => prev.map(n =>
            n.id === action.data.needId ? action.data.previousState : n
          ));
          toast.success(`Undid: ${action.description}`);
        }
        break;

      default:
        console.warn('Unknown action type for undo:', action.type);
    }
  };

  const redo = () => {
    const action = history.popRedo();
    if (!action) return;

    // Re-apply state based on action type
    switch (action.type) {
      case 'add_need':
        if (action.data.newState) {
          needState.setNeeds((prev: Need[]) => [...prev, action.data.newState]);
          needState.setActiveTab(action.data.needId);
          toast.success('Redid: Add need');
        }
        break;

      case 'delete_need':
        if (action.data.needId) {
          needState.setNeeds((prev: Need[]) => prev.filter(n => n.id !== action.data.needId));
          toast.success('Redid: Delete need');
        }
        break;

      case 'close_need':
        if (action.data.needId) {
          needState.setNeeds((prev: Need[]) => prev.filter(n => n.id !== action.data.needId));
          toast.success('Redid: Close need');
        }
        break;

      case 'branch':
      case 'add_child':
      case 'delete_expression':
        if (action.data.needId && action.data.newState) {
          needState.setNeeds((prev: Need[]) => prev.map(n =>
            n.id === action.data.needId ? action.data.newState : n
          ));
          toast.success(`Redid: ${action.description}`);
        }
        break;

      default:
        console.warn('Unknown action type for redo:', action.type);
    }
  };

  // Return unified API
  return {
    // State from needState
    ...needState,

    // UI state from uiState
    ...uiState,

    // CRUD operations
    ...crud,

    // Tree operations
    ...tree,

    // Analysis operations
    ...analysis,

    // Cross-pollination
    ...cross,

    // AI Assistant
    ...ai,

    // History
    history: history.history,
    addToHistory: history.addToHistory,
    undo,
    redo,
    clearHistory: history.clearHistory,
  };
}
