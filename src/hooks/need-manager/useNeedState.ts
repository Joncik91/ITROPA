import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import type { Need } from '../../types';
import { DBService } from '../../services/db.service';

const WORKSPACE_KEY = 'itropa-workspace';

interface Workspace {
  open: string[];
  active: string | null;
}

function readWorkspace(): Workspace | null {
  try {
    const raw = localStorage.getItem(WORKSPACE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Workspace>;
    return {
      open: Array.isArray(parsed.open) ? parsed.open.filter((id): id is string => typeof id === 'string') : [],
      active: typeof parsed.active === 'string' ? parsed.active : null,
    };
  } catch {
    return null;
  }
}

function writeWorkspace(ws: Workspace): void {
  try {
    localStorage.setItem(WORKSPACE_KEY, JSON.stringify(ws));
  } catch {
    /* storage full or disabled: workspace just won't persist */
  }
}

/**
 * Core state for the open workspace of needs.
 *
 * `needsRef` always holds the latest committed list, so async operations that resume
 * after an AI call read current state instead of the snapshot from when they started —
 * concurrent branches/edits no longer overwrite each other. Every mutation goes through
 * `commitNeeds`/`updateNeed`, and `updateNeed` persists the result.
 */
export function useNeedState() {
  const [needs, setNeedsState] = useState<Need[]>([]);
  const needsRef = useRef<Need[]>([]);
  const [activeTab, setActiveTabState] = useState<string | null>(null);
  const activeTabRef = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const commitNeeds = useCallback((next: Need[] | ((prev: Need[]) => Need[])): Need[] => {
    const value = typeof next === 'function' ? next(needsRef.current) : next;
    needsRef.current = value;
    setNeedsState(value);
    return value;
  }, []);

  const setActiveTab = useCallback((id: string | null) => {
    activeTabRef.current = id;
    setActiveTabState(id);
  }, []);

  /** Persist a need, surfacing failures instead of silently diverging from storage. */
  const persistNeed = useCallback(async (need: Need) => {
    try {
      await DBService.saveNeed(need);
    } catch (e) {
      console.error('Failed to save need:', e);
      toast.error(`Could not save "${need.name}" — changes may be lost on reload.`);
    }
  }, []);

  /**
   * Apply `fn` to the latest version of an open need, commit it and persist it.
   * Returns [before, after], or null when the need is not open or nothing changed.
   */
  const updateNeed = useCallback((needId: string, fn: (need: Need) => Need): [Need, Need] | null => {
    const before = needsRef.current.find((n) => n.id === needId);
    if (!before) return null;
    const after = fn(before);
    if (after === before) return null;
    commitNeeds((list) => list.map((n) => (n.id === needId ? after : n)));
    void persistNeed(after);
    return [before, after];
  }, [commitNeeds, persistNeed]);

  /** Open (or refresh) a need in the workspace and focus it. */
  const openInWorkspace = useCallback((need: Need, focus = true) => {
    commitNeeds((list) => (list.some((n) => n.id === need.id) ? list.map((n) => (n.id === need.id ? need : n)) : [...list, need]));
    if (focus) setActiveTab(need.id);
  }, [commitNeeds, setActiveTab]);

  const removeFromWorkspace = useCallback((needId: string) => {
    const list = needsRef.current;
    const idx = list.findIndex((n) => n.id === needId);
    if (idx === -1) return;
    const remaining = commitNeeds(list.filter((n) => n.id !== needId));
    if (activeTabRef.current === needId) {
      setActiveTab(remaining[Math.min(idx, remaining.length - 1)]?.id ?? null);
    }
  }, [commitNeeds, setActiveTab]);

  // Restore the workspace on mount. The `cancelled` flag makes StrictMode's double
  // mount harmless.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await DBService.getAllNeeds();
        if (cancelled) return;
        const ws = readWorkspace();
        const byId = new Map(all.map((n) => [n.id, n]));
        // First run (no saved workspace): open everything, matching previous behaviour.
        const open = ws ? ws.open.map((id) => byId.get(id)).filter((n): n is NonNullable<typeof n> => !!n) : all;
        commitNeeds(open);
        const active = ws?.active && open.some((n) => n.id === ws.active) ? ws.active : open[0]?.id ?? null;
        setActiveTab(active);
      } catch (e) {
        console.error('Failed to load needs from database:', e);
        if (!cancelled) toast.error('Could not load saved research from this browser.');
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, [commitNeeds, setActiveTab]);

  useEffect(() => {
    if (ready) writeWorkspace({ open: needs.map((n) => n.id), active: activeTab });
  }, [ready, needs, activeTab]);

  const activeNeed = needs.find((n) => n.id === activeTab);

  return {
    needs,
    needsRef,
    commitNeeds,
    updateNeed,
    persistNeed,
    openInWorkspace,
    removeFromWorkspace,
    activeTab,
    activeTabRef,
    setActiveTab,
    activeNeed,
    ready,
    loading,
    setLoading,
    loadingStage,
    setLoadingStage,
    error,
    setError,
  };
}

export type NeedStateApi = ReturnType<typeof useNeedState>;
