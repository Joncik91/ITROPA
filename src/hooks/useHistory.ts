/**
 * Undo/redo stack. The stacks live in a ref so rapid key repeats pop distinct entries
 * (reading render-time state would pop the same action twice before re-render).
 * Applying an action is the caller's job.
 */

import { useState, useCallback, useRef } from 'react';
import type { HistoryAction, HistoryState } from '../types';

const MAX_HISTORY = 50;

export interface UseHistoryOptions {
  /** Maximum history entries to keep (default: 50) */
  maxHistory?: number;
}

export interface UseHistoryReturn {
  history: HistoryState;
  addToHistory: (action: Omit<HistoryAction, 'id' | 'timestamp'>) => void;
  popUndo: () => HistoryAction | null;
  popRedo: () => HistoryAction | null;
  /** Undo the last pop (the action could not be applied), restoring both stacks. */
  revertUndo: () => void;
  revertRedo: () => void;
  clearHistory: () => void;
}

const EMPTY: HistoryState = { past: [], future: [], canUndo: false, canRedo: false };

export function useHistory(options: UseHistoryOptions = {}): UseHistoryReturn {
  const { maxHistory = MAX_HISTORY } = options;
  const stateRef = useRef<HistoryState>(EMPTY);
  const [history, setHistoryState] = useState<HistoryState>(EMPTY);

  const commit = useCallback((past: HistoryAction[], future: HistoryAction[]) => {
    const next = { past, future, canUndo: past.length > 0, canRedo: future.length > 0 };
    stateRef.current = next;
    setHistoryState(next);
  }, []);

  const addToHistory = useCallback((action: Omit<HistoryAction, 'id' | 'timestamp'>) => {
    const entry: HistoryAction = {
      ...action,
      id: `action-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
    };
    commit([...stateRef.current.past, entry].slice(-maxHistory), []);
  }, [commit, maxHistory]);

  const popUndo = useCallback((): HistoryAction | null => {
    const { past, future } = stateRef.current;
    const action = past[past.length - 1];
    if (!action) return null;
    commit(past.slice(0, -1), [action, ...future]);
    return action;
  }, [commit]);

  const popRedo = useCallback((): HistoryAction | null => {
    const { past, future } = stateRef.current;
    const action = future[0];
    if (!action) return null;
    commit([...past, action], future.slice(1));
    return action;
  }, [commit]);

  const revertUndo = useCallback(() => {
    const { past, future } = stateRef.current;
    if (future.length) commit([...past, future[0]], future.slice(1));
  }, [commit]);

  const revertRedo = useCallback(() => {
    const { past, future } = stateRef.current;
    if (past.length) commit(past.slice(0, -1), [past[past.length - 1], ...future]);
  }, [commit]);

  const clearHistory = useCallback(() => commit([], []), [commit]);

  return { history, addToHistory, popUndo, popRedo, revertUndo, revertRedo, clearHistory };
}
