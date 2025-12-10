import { useState, useEffect } from 'react';
import type { Need } from '../../types';
import { DBService } from '../../services/db.service';

/**
 * Core state management for needs
 * Handles needs array, active tab, cache, loading states, and errors
 */
export function useNeedState() {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [cache, setCache] = useState<Record<string, Need>>({});
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Derived state
  const activeNeed = needs.find(n => n.id === activeTab);

  // Load needs from database on mount
  useEffect(() => {
    const loadNeeds = async () => {
      try {
        const dbNeeds = await DBService.getAllNeeds();
        if (dbNeeds.length > 0) {
          setNeeds(dbNeeds);
          setActiveTab(dbNeeds[0].id);
          // Rebuild cache
          const cacheData: Record<string, Need> = {};
          dbNeeds.forEach(need => {
            const key = need.name.toLowerCase().trim();
            cacheData[key] = need;
          });
          setCache(cacheData);
        }
      } catch (e) {
        console.error('Failed to load needs from database:', e);
      }
    };
    loadNeeds();
  }, []);

  return {
    // State
    needs,
    setNeeds,
    activeTab,
    setActiveTab,
    cache,
    setCache,
    loading,
    setLoading,
    loadingStage,
    setLoadingStage,
    error,
    setError,

    // Derived
    activeNeed,
  };
}
