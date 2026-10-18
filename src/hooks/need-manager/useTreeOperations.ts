import { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { getGeminiService } from '../../services/gemini.service';
import {
  insertIntoExpressionTree,
  locateInExpressionTree,
  getFutureExpressions,
  newId,
  removeFromExpressionTree,
  withFutureExpressions,
} from '../../utils/need-model';
import type { FormData, IndustryExpression } from '../../types';
import type { NeedStateApi } from './useNeedState';
import type { UseHistoryReturn } from '../useHistory';

const EMPTY_FORM: FormData = { name: '', mutation: '', insight: '' };

/**
 * Tree manipulation: AI branching, manual additions, cross-pollination results, deletion.
 * Every mutation resolves against the latest need state and is persisted and undoable.
 */
export function useTreeOperations(state: NeedStateApi, history: UseHistoryReturn) {
  const { updateNeed } = state;

  const [branching, setBranching] = useState<Record<string, boolean>>({});
  const branchingRef = useRef(new Set<string>());
  const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({});
  const [modal, setModal] = useState<{ open: boolean; needId: string | null; parentId: string | null }>({ open: false, needId: null, parentId: null });
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  /** Insert nodes and record the action; returns false when the target vanished. */
  const insertNodes = useCallback((
    needId: string,
    parentId: string | null,
    nodes: IndustryExpression[],
    type: 'branch' | 'add_child',
    description: string,
  ): boolean => {
    let inserted = false;
    updateNeed(needId, (need) => {
      const before = getFutureExpressions(need);
      const after = insertIntoExpressionTree(before, parentId, nodes);
      if (after === before) return need;
      inserted = true;
      return withFutureExpressions(need, () => after);
    });
    if (inserted) {
      history.addToHistory({ type, description, data: { needId, parentId, nodes } });
      if (parentId) setExpandedBranches((p) => ({ ...p, [parentId]: true }));
    }
    return inserted;
  }, [updateNeed, history]);

  const branchIndustry = useCallback(async (expr: IndustryExpression, needId: string) => {
    if (branchingRef.current.has(expr.id)) return;
    branchingRef.current.add(expr.id);
    setBranching((p) => ({ ...p, [expr.id]: true }));
    const toastId = toast.loading(`Branching deeper into: ${expr.name}...`);
    try {
      const children = await getGeminiService().branchIndustry(expr);
      if (!insertNodes(needId, expr.id, children, 'branch', `Branch: ${expr.name}`)) {
        toast.error(`"${expr.name}" was removed or closed before branching finished.`, { id: toastId });
        return;
      }
      toast.success(`Added ${children.length} predictions to: ${expr.name}`, { id: toastId });
    } catch (e) {
      toast.error(`Failed to branch: ${(e as Error).message}`, { id: toastId });
    } finally {
      branchingRef.current.delete(expr.id);
      setBranching((p) => {
        const { [expr.id]: _, ...rest } = p;
        return rest;
      });
    }
  }, [insertNodes]);

  const openAddModal = useCallback((needId: string, parentId: string | null) => {
    setFormData(EMPTY_FORM);
    setModal({ open: true, needId, parentId });
  }, []);

  const closeAddModal = useCallback(() => {
    setModal({ open: false, needId: null, parentId: null });
  }, []);

  const addPrediction = useCallback(() => {
    const name = formData.name.trim();
    if (!name || !modal.needId) return;
    const node: IndustryExpression = {
      id: newId('expr'),
      type: 'future',
      name,
      mutation: formData.mutation.trim(),
      insight: formData.insight.trim(),
      inspirations: [],
      children: [],
      userAdded: true,
    };
    if (insertNodes(modal.needId, modal.parentId, [node], 'add_child', `Added: ${name}`)) {
      toast.success(modal.parentId ? `Added child prediction: ${name}` : `Added prediction: ${name}`);
      setFormData(EMPTY_FORM);
      closeAddModal();
    } else {
      toast.error('The target need or branch no longer exists.');
    }
  }, [formData, modal, insertNodes, closeAddModal]);

  const addCrossPollinationResult = useCallback((result: IndustryExpression, targetNeedId: string, sources: IndustryExpression[]) => {
    const node: IndustryExpression = {
      ...result,
      id: newId('expr'),
      children: [],
      crossPollinated: true,
      sourceExpressions: sources.map((s) => s.id),
    };
    const ok = insertNodes(targetNeedId, null, [node], 'add_child', `Cross-pollinated: ${result.name}`);
    if (ok) toast.success(`Added "${result.name}" to the tree`);
    else toast.error('That need is no longer open.');
    return ok;
  }, [insertNodes]);

  const deleteExpression = useCallback((needId: string, expressionId: string) => {
    let removed: ReturnType<typeof locateInExpressionTree> = null;
    updateNeed(needId, (need) => {
      const list = getFutureExpressions(need);
      removed = locateInExpressionTree(list, expressionId);
      return removed ? withFutureExpressions(need, () => removeFromExpressionTree(list, expressionId)) : need;
    });
    const hit = removed as ReturnType<typeof locateInExpressionTree>;
    if (!hit) return;
    history.addToHistory({
      type: 'delete_expression',
      description: `Deleted: ${hit.node.name}`,
      data: { needId, parentId: hit.parentId, index: hit.index, nodes: [hit.node] },
    });
    toast.success(`Deleted: ${hit.node.name}`, { id: `delete-${expressionId}` });
  }, [updateNeed, history]);

  const isBranching = useCallback((id: string) => !!branching[id], [branching]);

  return {
    isBranching,
    expandedBranches,
    setExpandedBranches,
    modal,
    formData,
    setFormData,
    openAddModal,
    closeAddModal,
    branchIndustry,
    addPrediction,
    addCrossPollinationResult,
    deleteExpression,
  };
}
