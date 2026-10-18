import { useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { useHistory } from '../useHistory';
import { useNeedState } from './useNeedState';
import { useNeedCRUD } from './useNeedCRUD';
import { useTreeOperations } from './useTreeOperations';
import { useExpressionAnalysis } from './useExpressionAnalysis';
import { useCrossPollination } from './useCrossPollination';
import { useAIAssistant } from './useAIAssistant';
import { DBService } from '../../services/db.service';
import {
  collectExpressionIds,
  getFutureExpressions,
  insertIntoExpressionTree,
  removeFromExpressionTree,
  withFutureExpressions,
} from '../../utils/need-model';
import type { HistoryAction } from '../../types';

/**
 * The application's research workspace: open needs, tree editing, AI analyses,
 * cross-pollination, assistant suggestions and undo/redo.
 */
export function useNeedManager() {
  const history = useHistory();
  const state = useNeedState();
  const crud = useNeedCRUD(state, history);
  const tree = useTreeOperations(state, history);
  const analysis = useExpressionAnalysis(state);
  const cross = useCrossPollination();
  const ai = useAIAssistant(state, {
    fetchNeed: crud.fetchNeed,
    fetchMechanism: analysis.fetchMechanism,
    fetchDeepDive: analysis.fetchDeepDive,
    branchIndustry: tree.branchIndustry,
  });

  const { updateNeed, openInWorkspace, removeFromWorkspace } = state;

  /** Apply an action forwards (redo) or backwards (undo). Returns false if its target is gone. */
  const apply = useCallback(async (action: HistoryAction, direction: 'undo' | 'redo'): Promise<boolean> => {
    const { needId, parentId = null, index, nodes = [] } = action.data;

    if (action.type === 'close_need') {
      if (direction === 'redo') {
        removeFromWorkspace(needId);
        return true;
      }
      const need = await DBService.getNeed(needId);
      if (!need) return false;
      openInWorkspace(need);
      return true;
    }

    const adds = action.type === 'branch' || action.type === 'add_child';
    const insert = adds === (direction === 'redo');
    const result = updateNeed(needId, (need) => {
      const list = getFutureExpressions(need);
      const existing = insert ? collectExpressionIds(need) : null;
      const toInsert = existing ? nodes.filter((n) => !existing.has(n.id)) : nodes;
      if (insert && toInsert.length === 0) return need;
      const next = insert
        ? insertIntoExpressionTree(list, parentId, toInsert, adds ? undefined : index)
        : nodes.reduce((acc, node) => removeFromExpressionTree(acc, node.id), list);
      return next === list ? need : withFutureExpressions(need, () => next);
    });
    return result !== null;
  }, [updateNeed, openInWorkspace, removeFromWorkspace]);

  // Undo/redo steps run strictly one after another: some are async (reopening a need),
  // and a later step may depend on an earlier one having landed.
  const queue = useRef<Promise<void>>(Promise.resolve());
  const step = useCallback((direction: 'undo' | 'redo') => {
    queue.current = queue.current.then(async () => {
      const action = direction === 'undo' ? history.popUndo() : history.popRedo();
      if (!action) return;
      const ok = await apply(action, direction).catch(() => false);
      const verb = direction === 'undo' ? 'Undid' : 'Redid';
      if (ok) {
        toast.success(`${verb}: ${action.description}`, { id: 'history' });
      } else {
        // Keep the stacks truthful: the action did not happen, so it stays where it was.
        if (direction === 'undo') history.revertUndo();
        else history.revertRedo();
        toast.error(`Cannot ${direction} "${action.description}" — open its need and try again.`, { id: 'history' });
      }
    });
  }, [history, apply]);

  const undo = useCallback(() => step('undo'), [step]);
  const redo = useCallback(() => step('redo'), [step]);

  const closeAllModals = useCallback(() => {
    analysis.setMechanism(null);
    analysis.setDeepDive(null);
    analysis.setAppConcepts(null);
    cross.closeCrossPollinate();
    tree.closeAddModal();
  }, [analysis.setMechanism, analysis.setDeepDive, analysis.setAppConcepts, cross.closeCrossPollinate, tree.closeAddModal]);

  const anyModalOpen = !!(analysis.mechanism || analysis.deepDive || analysis.appConcepts || cross.crossPollinate.open || tree.modal.open);

  return {
    // workspace
    ready: state.ready,
    needs: state.needs,
    activeTab: state.activeTab,
    setActiveTab: state.setActiveTab,
    activeNeed: state.activeNeed,
    loading: state.loading,
    loadingStage: state.loadingStage,
    error: state.error,
    ...crud,
    ...tree,
    ...analysis,
    ...cross,
    ...ai,
    // history
    history: history.history,
    undo,
    redo,
    clearHistory: history.clearHistory,
    // modals
    anyModalOpen,
    closeAllModals,
  };
}

export type NeedManager = ReturnType<typeof useNeedManager>;
