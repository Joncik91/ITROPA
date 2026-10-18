import { useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { getGeminiService } from '../../services/gemini.service';
import { DBService } from '../../services/db.service';
import { getFutureExpressions, hasPriorArt, needKey } from '../../utils/need-model';
import type { NeedStateApi } from './useNeedState';
import type { UseHistoryReturn } from '../useHistory';

/**
 * Creating, opening, closing and deleting needs.
 */
export function useNeedCRUD(state: NeedStateApi, history: UseHistoryReturn) {
  const { needsRef, openInWorkspace, removeFromWorkspace, setActiveTab, setLoading, setLoadingStage, setError } = state;
  const inFlight = useRef(new Set<string>());

  /**
   * Open a need by name: switch to it if open, reopen it from the library if saved,
   * otherwise research and generate it. Concurrent requests for the same name collapse.
   */
  const fetchNeed = useCallback(async (needName: string, userDescription?: string) => {
    const name = needName?.trim();
    if (!name) return;
    const key = needKey(name);

    const open = needsRef.current.find((n) => needKey(n.name) === key);
    if (open && !userDescription) {
      setActiveTab(open.id);
      return;
    }
    if (inFlight.current.has(key)) return;
    inFlight.current.add(key);

    let toastId: string | undefined;
    const gemini = getGeminiService();
    try {
      if (!userDescription) {
        const saved = await DBService.findNeedByName(name).catch(() => undefined);
        if (saved) {
          openInWorkspace(saved);
          toast.success(`Opened from library: ${saved.name}`);
          return;
        }
      }

      setLoading(true);
      setError(null);
      toastId = toast.loading(`Researching prior art for: ${name}...`);
      setLoadingStage('Researching prior art...');
      const cached = userDescription ? undefined : await DBService.getSearchCache(name).catch(() => undefined);
      const priorArt = cached && hasPriorArt(cached.priorArt) ? cached.priorArt : await gemini.fetchPriorArt(name, userDescription);
      if (!cached) void DBService.saveSearchCache(name, priorArt).catch(() => {});

      // Strategic prior-art analysis runs in the background; it never blocks generation.
      void (async () => {
        if (await DBService.getPriorArtAnalysis(name)) return;
        const analyses = await gemini.analyzePriorArt(name, priorArt);
        if (analyses.length) await DBService.savePriorArtAnalysis(name, analyses);
      })().catch((err) => console.warn('Prior art analysis failed:', err));

      toast.loading('Generating predictions from prior art...', { id: toastId });
      setLoadingStage('Generating predictions from prior art...');
      const need = await gemini.generateNeed(name, priorArt, userDescription);

      await DBService.saveNeed(need);
      openInWorkspace(need);
      toast.success(`Created: ${need.name} with ${getFutureExpressions(need).length} predictions`, { id: toastId });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
      toast.error(`Failed to create need: ${message}`, { id: toastId });
    } finally {
      inFlight.current.delete(key);
      setLoading(inFlight.current.size > 0);
      if (inFlight.current.size === 0) setLoadingStage('');
    }
  }, [needsRef, openInWorkspace, setActiveTab, setLoading, setLoadingStage, setError]);

  /** Open a saved need by id (from the library or a pattern instance). */
  const openNeed = useCallback(async (needId: string) => {
    const open = needsRef.current.find((n) => n.id === needId);
    if (open) {
      setActiveTab(open.id);
      return true;
    }
    const saved = await DBService.getNeed(needId).catch(() => undefined);
    if (!saved) {
      toast.error('That need no longer exists.');
      return false;
    }
    openInWorkspace(saved);
    return true;
  }, [needsRef, openInWorkspace, setActiveTab]);

  /** Close a need's tab (it stays in the library). Undoable. */
  const closeNeed = useCallback((id: string) => {
    const need = needsRef.current.find((n) => n.id === id);
    if (!need) return;
    history.addToHistory({ type: 'close_need', description: `Closed: ${need.name}`, data: { needId: id } });
    removeFromWorkspace(id);
    toast.success(`Closed: ${need.name}`);
  }, [needsRef, history, removeFromWorkspace]);

  /** Permanently delete a need and all of its analyses. */
  const removeNeed = useCallback(async (id: string) => {
    removeFromWorkspace(id);
    await DBService.deleteNeed(id);
  }, [removeFromWorkspace]);

  /** Wipe all saved data and reset the workspace and history to match. */
  const clearAllData = useCallback(async () => {
    await DBService.clearAllData();
    state.commitNeeds([]);
    setActiveTab(null);
    history.clearHistory();
  }, [state.commitNeeds, setActiveTab, history]);

  return { fetchNeed, openNeed, closeNeed, removeNeed, clearAllData };
}
