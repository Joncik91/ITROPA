import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { getGeminiService } from '../../services/gemini.service';
import { DBService } from '../../services/db.service';
import type { HistoryManager } from '../useHistory';

/**
 * CRUD operations for needs
 * Dependencies: needState, history
 */
export function useNeedCRUD(deps: {
  needs: any[];
  setNeeds: (fn: any) => void;
  activeTab: string | null;
  setActiveTab: (id: string | null) => void;
  cache: Record<string, any>;
  setCache: (fn: any) => void;
  setLoading: (loading: boolean) => void;
  setLoadingStage: (stage: string) => void;
  setError: (error: string | null) => void;
  setShowPriorArt: (fn: any) => void;
  setExpandedBranches: (fn: any) => void;
  history: HistoryManager;
}) {
  const {
    needs,
    setNeeds,
    activeTab,
    setActiveTab,
    cache,
    setCache,
    setLoading,
    setLoadingStage,
    setError,
    setShowPriorArt,
    setExpandedBranches,
    history,
  } = deps;

  const geminiService = getGeminiService();

  const fetchNeed = useCallback(async (needName: string, userDescription?: string) => {
    const key = needName.toLowerCase().trim();
    if (cache[key]) {
      if (!needs.find(n => n.id === cache[key].id)) {
        setNeeds((p: any) => [...p, cache[key]]);
        setActiveTab(cache[key].id);
      } else setActiveTab(cache[key].id);
      toast.success(`Switched to: ${needName}`);
      return;
    }
    setLoading(true);
    setError(null);
    const toastId = toast.loading(`Researching prior art for: ${needName}...`);
    try {
      setLoadingStage("Researching prior art...");
      const priorArt = await geminiService.fetchPriorArt(needName, userDescription);

      // Run prior art analysis in background (don't block need generation)
      geminiService.analyzePriorArt(needName, priorArt)
        .then(analyses => {
          if (analyses.length > 0) {
            DBService.savePriorArtAnalysis(needName, analyses);
            console.log(`Cached ${analyses.length} prior art analyses for: ${needName}`);
          }
        })
        .catch(err => console.warn('Prior art analysis failed:', err));

      toast.loading("Generating predictions from prior art...", { id: toastId });
      setLoadingStage("Generating predictions from prior art...");
      const parsed = await geminiService.generateNeed(needName, priorArt, userDescription);
      setCache((p: any) => ({ ...p, [key]: parsed }));
      setNeeds((p: any) => [...p, parsed]);
      setActiveTab(parsed.id);
      setShowPriorArt((p: any) => ({ ...p, [parsed.id]: false }));
      // Save to database
      await DBService.saveNeed(parsed);
      await DBService.saveSearchCache(needName, priorArt);
      toast.success(`Created: ${needName} with ${parsed.eras.find((e: any) => e.name.includes('2025'))?.expressions?.length || 0} predictions`, { id: toastId });
    } catch (e: any) {
      setError(e.message);
      toast.error(`Failed to create need: ${e.message}`, { id: toastId });
    } finally {
      setLoading(false);
      setLoadingStage("");
    }
  }, [cache, needs, geminiService, setNeeds, setActiveTab, setCache, setLoading, setLoadingStage, setError, setShowPriorArt]);

  const closeNeed = (id: string) => {
    // Close need (remove from workspace but keep in DB)
    const needToClose = needs.find(n => n.id === id);
    if (!needToClose) return;

    // Add to history for undo
    history.addToHistory({
      type: 'close_need',
      description: `Closed: ${needToClose.name}`,
      data: {
        needId: id,
        previousState: needToClose,
      },
    });

    // Remove from workspace
    setNeeds((p: any) => p.filter((n: any) => n.id !== id));

    // Switch active tab if closing the active need
    if (activeTab === id) {
      const remainingNeeds = needs.filter(n => n.id !== id);
      const currentIndex = needs.findIndex(n => n.id === id);
      const nextNeed = remainingNeeds[Math.min(currentIndex, remainingNeeds.length - 1)];
      setActiveTab(nextNeed?.id || null);
    }

    toast.success(`Closed: ${needToClose.name}`);
  };

  const removeNeed = async (id: string) => {
    setNeeds((p: any) => p.filter((n: any) => n.id !== id));
    if (activeTab === id) setActiveTab(needs.find(n => n.id !== id)?.id || null);
    // Delete from database
    await DBService.deleteNeed(id);
  };

  const clearAll = async () => {
    setNeeds([]);
    setActiveTab(null);
    setCache({});
    setShowPriorArt({});
    setExpandedBranches({});
    // Clear database
    await DBService.clearAllNeeds();
  };

  return {
    fetchNeed,
    closeNeed,
    removeNeed,
    clearAll,
  };
}
