/**
 * Hook for managing undo/redo history with generic state restoration.
 * Follows Single Responsibility Principle - only handles history tracking.
 */

import { useState, useCallback } from 'react';
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
  clearHistory: () => void;
}

/**
 * Generic history management hook.
 * Provides undo/redo stack management without knowing how to apply the actions.
 * The consuming code is responsible for actually executing the undo/redo.
 */
export function useHistory(options: UseHistoryOptions = {}): UseHistoryReturn {
  const { maxHistory = MAX_HISTORY } = options;

  const [history, setHistory] = useState<HistoryState>({
    past: [],
    future: [],
    canUndo: false,
    canRedo: false,
  });

  const addToHistory = useCallback((action: Omit<HistoryAction, 'id' | 'timestamp'>) => {
    const historyAction: HistoryAction = {
      ...action,
      id: `action-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };

    setHistory(prev => {
      const newPast = [...prev.past, historyAction].slice(-maxHistory);
      return {
        past: newPast,
        future: [], // Clear redo stack on new action
        canUndo: true,
        canRedo: false,
      };
    });
  }, [maxHistory]);

  /**
   * Pop the most recent action for undo.
   * Returns the action that should be undone, or null if nothing to undo.
   * Caller is responsible for actually performing the undo.
   */
  const popUndo = useCallback((): HistoryAction | null => {
    if (history.past.length === 0) return null;

    const action = history.past[history.past.length - 1];

    setHistory(prev => ({
      past: prev.past.slice(0, -1),
      future: [action, ...prev.future],
      canUndo: prev.past.length > 1,
      canRedo: true,
    }));

    return action;
  }, [history.past]);

  /**
   * Pop the next action for redo.
   * Returns the action that should be redone, or null if nothing to redo.
   * Caller is responsible for actually performing the redo.
   */
  const popRedo = useCallback((): HistoryAction | null => {
    if (history.future.length === 0) return null;

    const action = history.future[0];

    setHistory(prev => ({
      past: [...prev.past, action],
      future: prev.future.slice(1),
      canUndo: true,
      canRedo: prev.future.length > 1,
    }));

    return action;
  }, [history.future]);

  const clearHistory = useCallback(() => {
    setHistory({
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    });
  }, []);

  return {
    history,
    addToHistory,
    popUndo,
    popRedo,
    clearHistory,
  };
}
