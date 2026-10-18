import { useState, useEffect, useCallback, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Search, Database, Clock, Layers, TrendingUp, Shuffle, Sparkles, Calendar, X, Trash2 } from "lucide-react";
import { DBService } from "../services/db.service";
import { ModalWrapper } from "./ModalWrapper";
import type { Theme } from "../config/theme";

interface LibraryViewProps {
  theme: Theme;
  dark: boolean;
  /** Open a saved need in the workspace. */
  onOpenNeed: (needId: string) => void;
  /** Permanently delete a need (also closes its tab). */
  onDeleteNeed: (needId: string) => Promise<void>;
  /** Wipe all saved data (also clears the workspace). */
  onClearAll: () => Promise<void>;
}

type Stats = Awaited<ReturnType<typeof DBService.getDatabaseStats>>;
type SearchResults = {
  needs: Awaited<ReturnType<typeof DBService.searchNeeds>>;
  expressions: Awaited<ReturnType<typeof DBService.searchExpressions>>;
  mechanisms: Awaited<ReturnType<typeof DBService.searchMechanisms>>;
  deepDives: Awaited<ReturnType<typeof DBService.searchDeepDives>>;
};

const EMPTY_RESULTS: SearchResults = { needs: [], expressions: [], mechanisms: [], deepDives: [] };
const SEARCH_DEBOUNCE_MS = 200;

/** Mechanism records hold one entry per framework (older ones a single object). */
const coreMechanismOf = (details: unknown): string => {
  const first = Array.isArray(details) ? details[0] : details;
  return (first && typeof first === "object" && typeof (first as { coreMechanism?: unknown }).coreMechanism === "string")
    ? (first as { coreMechanism: string }).coreMechanism
    : "";
};

/** Props that make a non-button element behave like a button for mouse and keyboard. */
const asButton = (action: () => void) => ({
  role: "button" as const,
  tabIndex: 0,
  onClick: action,
  onKeyDown: (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  },
});

export const LibraryView = ({ theme, onOpenNeed, onDeleteNeed, onClearAll }: LibraryViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "needs" | "mechanisms" | "deepDives" | "crossPollinates">("all");
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [stats, setStats] = useState<Stats>({ needs: 0, mechanisms: 0, deepDives: 0, crossPollinates: 0, appConcepts: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<{ type: "need" | "all"; id: string; name: string } | null>(null);
  const [dataVersion, setDataVersion] = useState(0);
  const refresh = useCallback(() => setDataVersion((v) => v + 1), []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([DBService.getRecentActivity(20), DBService.getDatabaseStats()])
      .then(([activity, dbStats]) => {
        if (!alive) return;
        setRecentActivity(activity);
        setStats(dbStats);
      })
      .catch((error) => {
        console.error("Failed to load library data:", error);
        if (alive) toast.error("Could not load the library.");
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [dataVersion]);

  // Debounced search; responses for an outdated query are discarded.
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults(EMPTY_RESULTS);
      return;
    }
    let alive = true;
    const timer = window.setTimeout(async () => {
      try {
        const [needs, expressions, mechanisms, deepDives] = await Promise.all([
          DBService.searchNeeds(query),
          DBService.searchExpressions(query),
          DBService.searchMechanisms(query),
          DBService.searchDeepDives(query),
        ]);
        if (alive) setSearchResults({ needs, expressions, mechanisms, deepDives });
      } catch (error) {
        console.error("Search failed:", error);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [searchQuery, dataVersion]);

  const handleConfirmedDelete = async () => {
    if (!confirmDelete) return;
    const target = confirmDelete;
    setConfirmDelete(null);
    try {
      if (target.type === "all") {
        await onClearAll();
        toast.success("All saved data deleted");
      } else {
        await onDeleteNeed(target.id);
        toast.success(`Deleted: ${target.name}`);
      }
      refresh();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(`Delete failed: ${(error as Error).message}`);
    }
  };

  const openNeedOfExpression = async (expressionId: string) => {
    const needId = await DBService.findNeedIdByExpression(expressionId);
    if (needId) onOpenNeed(needId);
    else toast.error("The industry this came from no longer exists.");
  };

  const handleCleanupOrphaned = async () => {
    try {
      const removed = await DBService.cleanupOrphanedData();
      const total = removed.mechanisms + removed.deepDives + removed.crossPollinates + removed.other;
      if (total > 0) {
        toast.success(`Removed ${total} orphaned item${total === 1 ? "" : "s"} (${removed.mechanisms} mechanisms, ${removed.deepDives} deep dives, ${removed.crossPollinates} cross-pollinations, ${removed.other} other)`);
        refresh();
      } else {
        toast.success("No orphaned data found.");
      }
    } catch (error) {
      console.error("Failed to cleanup orphaned data:", error);
      toast.error("Cleanup failed.");
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "need": return <Database className="w-4 h-4" />;
      case "mechanism": return <Layers className="w-4 h-4" />;
      case "deepDive": return <TrendingUp className="w-4 h-4" />;
      case "crossPollinate": return <Shuffle className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getActivityTitle = (activity: any) => {
    switch (activity.type) {
      case "need": return activity.data.name;
      case "mechanism": return activity.data.expressionName;
      case "deepDive": return activity.data.expressionName;
      case "crossPollinate": return `${activity.data.expression1Name} × ${activity.data.expression2Name}`;
      default: return "Unknown";
    }
  };

  const getActivityDescription = (activity: any) => {
    switch (activity.type) {
      case "need": return activity.data.description;
      case "mechanism": return coreMechanismOf(activity.data.details) || "Mechanism analysis";
      case "deepDive": return activity.data.details?.marketOpportunity || "Deep dive analysis";
      case "crossPollinate": return `${activity.data.result?.length ?? 0} recombinations generated`;
      default: return "";
    }
  };

  const filteredActivity = activeFilter === "all" 
    ? recentActivity 
    : recentActivity.filter(a => a.type === activeFilter.slice(0, -1));

  const hasSearchResults = searchQuery.trim() && (
    searchResults.needs.length > 0 || 
    searchResults.expressions.length > 0 || 
    searchResults.mechanisms.length > 0 || 
    searchResults.deepDives.length > 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Research Library</h2>
          <p className={`text-sm ${theme.muted}`}>
            Browse and search all your saved research, analyses, and predictions
          </p>
        </div>
        {stats.total > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleCleanupOrphaned}
              className={`px-3 py-1.5 rounded-lg border ${theme.border} ${theme.hover} text-sm flex items-center gap-2 transition-colors`}
              title="Remove orphaned data from deleted needs"
            >
              <Sparkles className="w-4 h-4" />
              Cleanup
            </button>
            <button
              onClick={() => setConfirmDelete({ type: "all", id: "", name: "all saved data" })}
              className={`px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm flex items-center gap-2 transition-colors`}
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className={`p-4 rounded-lg ${theme.card} border ${theme.border}`}>
          <Database className={`w-5 h-5 ${theme.accent} mb-2`} />
          <div className="text-2xl font-bold">{stats.needs}</div>
          <div className={`text-xs ${theme.muted}`}>Needs</div>
        </div>
        <div className={`p-4 rounded-lg ${theme.card} border ${theme.border}`}>
          <Layers className={`w-5 h-5 ${theme.accent} mb-2`} />
          <div className="text-2xl font-bold">{stats.mechanisms}</div>
          <div className={`text-xs ${theme.muted}`}>Mechanisms</div>
        </div>
        <div className={`p-4 rounded-lg ${theme.card} border ${theme.border}`}>
          <TrendingUp className={`w-5 h-5 ${theme.accent} mb-2`} />
          <div className="text-2xl font-bold">{stats.deepDives}</div>
          <div className={`text-xs ${theme.muted}`}>Deep Dives</div>
        </div>
        <div className={`p-4 rounded-lg ${theme.card} border ${theme.border}`}>
          <Shuffle className={`w-5 h-5 ${theme.accent} mb-2`} />
          <div className="text-2xl font-bold">{stats.crossPollinates}</div>
          <div className={`text-xs ${theme.muted}`}>Cross-Pollinates</div>
        </div>
        <div className={`p-4 rounded-lg ${theme.card} border ${theme.border}`}>
          <Sparkles className={`w-5 h-5 ${theme.accent} mb-2`} />
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className={`text-xs ${theme.muted}`}>Total Items</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.muted}`} />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search needs, expressions, mechanisms, analyses..."
          className={`w-full pl-10 pr-10 py-3 rounded-xl ${theme.inputBg} border focus:outline-none focus:border-gray-500 text-sm transition-colors`}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme.muted} hover:text-white`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {hasSearchResults && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {searchResults.needs.length > 0 && (
            <div>
              <h3 className={`text-sm font-medium ${theme.muted} mb-2`}>Needs ({searchResults.needs.length})</h3>
              <div className="space-y-2">
                {searchResults.needs.map((need) => (
                  <motion.div
                    key={need.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-3 rounded-lg ${theme.card} border ${theme.border} flex items-start justify-between group`}
                  >
                    <div 
                      className="flex-1 cursor-pointer"
                      {...asButton(() => onOpenNeed(need.id))}
                    >
                      <div className="font-medium">{need.name}</div>
                      <div className={`text-xs ${theme.muted} mt-1`}>{need.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`text-xs ${theme.muted}`}>{formatDate(need.updatedAt)}</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete({ type: 'need', id: need.id, name: need.name });
                        }}
                        className={`opacity-60 md:opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded hover:bg-red-500/20 text-red-400 transition-opacity`}
                        aria-label={`Delete ${need.name}`}
                        title="Delete permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {searchResults.expressions.length > 0 && (
            <div>
              <h3 className={`text-sm font-medium ${theme.muted} mb-2`}>Expressions ({searchResults.expressions.length})</h3>
              <div className="space-y-2">
                {searchResults.expressions.map((result) => (
                  <motion.div
                    key={`${result.need.id}:${result.expression.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-3 rounded-lg ${theme.card} border ${theme.border} ${theme.hover} cursor-pointer`}
                    {...asButton(() => onOpenNeed(result.need.id))}
                  >
                    <div className="font-medium flex items-center gap-2">
                      <Sparkles className={`w-3 h-3 ${theme.accent}`} />
                      {result.expression.name}
                    </div>
                    <div className={`text-xs ${theme.muted} mt-1`}>{result.expression.mutation}</div>
                    <div className={`text-xs ${theme.muted} mt-2`}>
                      in <span className={theme.accent}>{result.need.name}</span> → {result.path.join(" → ")}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {searchResults.mechanisms.length > 0 && (
            <div>
              <h3 className={`text-sm font-medium ${theme.muted} mb-2`}>Mechanisms ({searchResults.mechanisms.length})</h3>
              <div className="space-y-2">
                {searchResults.mechanisms.map((mech) => (
                  <motion.div
                    key={mech.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-3 rounded-lg ${theme.card} border ${theme.border} ${theme.hover} cursor-pointer`}
                    {...asButton(() => void openNeedOfExpression(mech.id))}
                  >
                    <div className="font-medium flex items-center gap-2">
                      <Layers className={`w-3 h-3 ${theme.accent}`} />
                      {mech.expressionName}
                    </div>
                    <div className={`text-xs ${theme.muted} mt-1`}>{coreMechanismOf(mech.details)}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {searchResults.deepDives.length > 0 && (
            <div>
              <h3 className={`text-sm font-medium ${theme.muted} mb-2`}>Deep Dives ({searchResults.deepDives.length})</h3>
              <div className="space-y-2">
                {searchResults.deepDives.map((dive) => (
                  <motion.div
                    key={dive.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-3 rounded-lg ${theme.card} border ${theme.border} ${theme.hover} cursor-pointer`}
                    {...asButton(() => void openNeedOfExpression(dive.id))}
                  >
                    <div className="font-medium flex items-center gap-2">
                      <TrendingUp className={`w-3 h-3 ${theme.accent}`} />
                      {dive.expressionName}
                    </div>
                    <div className={`text-xs ${theme.muted} mt-1`}>{dive.details?.marketOpportunity}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Recent Activity */}
      {!hasSearchResults && (
        <>
          <div className="flex items-center gap-2 border-b border-gray-700 pb-3">
            <Clock className={`w-4 h-4 ${theme.muted}`} />
            <h3 className="font-medium">Recent Activity</h3>
            <div className="flex-1" />
            <div className="flex gap-1">
              {["all", "needs", "mechanisms", "deepDives", "crossPollinates"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter as any)}
                  className={`text-xs px-2 py-1 rounded ${
                    activeFilter === filter ? "bg-gray-500/20 text-gray-300" : theme.muted
                  }`}
                >
                  {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className={`text-center py-8 ${theme.muted}`}>Loading...</div>
            ) : filteredActivity.length === 0 ? (
              <div className={`text-center py-8 ${theme.muted}`}>No activity yet. Start exploring!</div>
            ) : (
              filteredActivity.map((activity, i) => (
                <motion.div
                  key={`${activity.type}:${activity.data.id ?? activity.data.key}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-3 rounded-lg ${theme.card} border ${theme.border} flex items-start gap-3 group`}
                >
                  <div className={`p-2 rounded-lg ${theme.itemBg} ${theme.accent}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div
                    className="flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                    {...asButton(() => {
                      if (activity.type === "need") onOpenNeed(activity.data.id);
                      else if (activity.type === "mechanism" || activity.type === "deepDive") void openNeedOfExpression(activity.data.id);
                      else if (activity.type === "crossPollinate") void openNeedOfExpression(activity.data.expression1Id);
                    })}
                  >
                    <div className="font-medium truncate">{getActivityTitle(activity)}</div>
                    <div className={`text-xs ${theme.muted} mt-1 line-clamp-2`}>
                      {getActivityDescription(activity)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${theme.muted} flex items-center gap-1`}>
                      <Calendar className="w-3 h-3" />
                      {formatDate(activity.timestamp)}
                    </span>
                    {activity.type === "need" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete({ type: 'need', id: activity.data.id, name: activity.data.name });
                        }}
                        className={`opacity-60 md:opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded hover:bg-red-500/20 text-red-400 transition-opacity`}
                        aria-label={`Delete ${activity.data.name}`}
                        title="Delete permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </>
      )}

      <ModalWrapper
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title={confirmDelete?.type === "all" ? "Delete all saved data?" : "Delete need?"}
        theme={theme}
        maxWidth="max-w-md"
      >
        {confirmDelete && (
          <>
            <p className={`text-sm ${theme.muted} mb-4`}>
              {confirmDelete.type === "all"
                ? "Every need, analysis and cache stored in this browser will be removed."
                : <>"<span className={theme.text}>{confirmDelete.name}</span>" and all of its mechanisms, deep dives and analyses will be removed.</>}
              <br /><br />
              <span className="text-red-400">This cannot be undone.</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className={`flex-1 px-4 py-2 rounded-lg border ${theme.border} ${theme.muted} hover:bg-gray-700/50`}
                data-autofocus
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmedDelete}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </ModalWrapper>
    </div>
  );
};
