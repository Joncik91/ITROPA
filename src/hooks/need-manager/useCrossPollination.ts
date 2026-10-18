import { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { getGeminiService } from '../../services/gemini.service';
import { DBService } from '../../services/db.service';
import type { CrossPollinateState, IndustryExpression } from '../../types';

const CLOSED: CrossPollinateState = { open: false, items: [], result: null };

/**
 * Selection of two industries and generation of hybrid industries from them.
 */
export function useCrossPollination() {
  const [crossPollinate, setCrossPollinateState] = useState<CrossPollinateState>(CLOSED);
  const stateRef = useRef(CLOSED);
  const [crossLoading, setCrossLoading] = useState(false);
  const requestRef = useRef(0);

  const setCross = useCallback((next: CrossPollinateState | ((p: CrossPollinateState) => CrossPollinateState)) => {
    const value = typeof next === 'function' ? next(stateRef.current) : next;
    stateRef.current = value;
    setCrossPollinateState(value);
  }, []);

  /** Toggle an industry in/out of the pair (max 2). Changing the pair discards stale results. */
  const toggleCrossItem = useCallback((item: IndustryExpression) => {
    requestRef.current++;
    setCrossLoading(false);
    setCross((prev) => {
      if (prev.items.some((i) => i.id === item.id)) {
        return { ...prev, items: prev.items.filter((i) => i.id !== item.id), result: null };
      }
      if (prev.items.length >= 2) {
        toast('Two industries already selected — deselect one first.', { id: 'cross-full' });
        return prev;
      }
      return { ...prev, items: [...prev.items, item], result: null };
    });
  }, [setCross]);

  /** Drag-and-drop: select exactly this pair and open the dialog. */
  const selectCrossPair = useCallback((a: IndustryExpression, b: IndustryExpression) => {
    if (a.id === b.id) return;
    requestRef.current++;
    setCrossLoading(false);
    setCross({ open: true, items: [a, b], result: null });
  }, [setCross]);

  const openCrossPollinate = useCallback(() => setCross((p) => ({ ...p, open: true })), [setCross]);
  const closeCrossPollinate = useCallback(() => setCross((p) => ({ ...p, open: false })), [setCross]);
  const resetCrossPollinate = useCallback(() => {
    requestRef.current++;
    setCrossLoading(false);
    setCross(CLOSED);
  }, [setCross]);

  const executeCrossPollinate = useCallback(async (opts: { regenerate?: boolean } = {}) => {
    const items = stateRef.current.items;
    if (items.length !== 2) {
      toast.error('Select exactly 2 industries to cross-pollinate');
      return;
    }
    const [a, b] = items;
    const request = ++requestRef.current;
    setCrossLoading(true);
    const toastId = toast.loading(`Cross-pollinating: ${a.name} + ${b.name}...`);
    try {
      const cached = opts.regenerate ? undefined : await DBService.getCrossPollinate(a.id, b.id);
      const fromCache = !!cached?.result?.length;
      const result = fromCache ? cached!.result : await getGeminiService().crossPollinate(a, b);
      if (!fromCache) await DBService.saveCrossPollinate(a, b, result);
      // Ignore results for a pair the user has since changed (still saved for next time).
      const current = stateRef.current.items.map((i) => i.id).sort().join('|');
      if (request !== requestRef.current || current !== [a.id, b.id].sort().join('|')) {
        toast.dismiss(toastId);
        return;
      }
      setCross((prev) => ({ ...prev, result }));
      toast.success(fromCache ? 'Loaded saved recombinations' : `Generated ${result.length} hybrid industries`, { id: toastId });
    } catch (e) {
      toast.error(`Cross-pollination failed: ${(e as Error).message}`, { id: toastId });
    } finally {
      if (request === requestRef.current) setCrossLoading(false);
    }
  }, [setCross]);

  return {
    crossPollinate,
    crossLoading,
    toggleCrossItem,
    selectCrossPair,
    openCrossPollinate,
    closeCrossPollinate,
    resetCrossPollinate,
    executeCrossPollinate,
  };
}
