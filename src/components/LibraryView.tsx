import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Database, Clock, Layers, TrendingUp, Shuffle, Sparkles, Calendar, X, Trash2 } from "lucide-react";
import { DBService, type DBNeed, type DBMechanism, type DBDeepDive } from "../services/db.service";

interface LibraryViewProps {
  theme: any;
  dark: boolean;
  onLoadNeed: (need: DBNeed) => void;
}

export const LibraryView = ({ theme, onLoadNeed }: LibraryViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "needs" | "mechanisms" | "deepDives" | "crossPollinates">("all");
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any>({
    needs: [],
    expressions: [],
    mechanisms: [],
    deepDives: []
  });
  const [stats, setStats] = useState({ needs: 0, mechanisms: 0, deepDives: 0, crossPollinates: 0, total: 0, searchCache: 0 });
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<{ type: string; id: string; name: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setSearchResults({ needs: [], expressions: [], mechanisms: [], deepDives: [] });
    }
  }, [searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [activity, dbStats] = await Promise.all([
        DBService.getRecentActivity(20),
        DBService.getDatabaseStats()
      ]);
      setRecentActivity(activity);
      setStats(dbStats);
    } catch (error) {
      console.error("Failed to load library data:", error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const [needs, expressions, mechanisms, deepDives] = await Promise.all([
        DBService.searchNeeds(searchQuery),
        DBService.searchExpressions(searchQuery),
        DBService.searchMechanisms(searchQuery),
        DBService.searchDeepDives(searchQuery)
      ]);
      
      setSearchResults({ needs, expressions, mechanisms, deepDives });
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const handleDeleteNeed = async (needId: string) => {
    try {
      await DBService.deleteNeed(needId);
      await loadData();
      setConfirmDelete(null);
    } catch (error) {
      console.error("Failed to delete need:", error);
    }
  };

  const handleLoadNeedById = async (needId: string) => {
    try {
      const need = await DBService.getNeed(needId);
      if (need) {
        onLoadNeed(need);
      }
    } catch (error) {
      console.error("Failed to load need:", error);
    }
  };

  const handleClearAllData = async () => {
    if (!window.confirm("Are you sure you want to delete ALL saved data? This cannot be undone.")) {
      return;
    }
    try {
      await DBService.clearAllData();
      await loadData();
    } catch (error) {
      console.error("Failed to clear data:", error);
    }
  };

  const handleCleanupOrphaned = async () => {
    try {
      const removed = await DBService.cleanupOrphanedData();
      const total = removed.mechanisms + removed.deepDives + removed.crossPollinates;
      if (total > 0) {
        alert(`Cleaned up ${total} orphaned items:\n- ${removed.mechanisms} mechanisms\n- ${removed.deepDives} deep dives\n- ${removed.crossPollinates} cross-pollinations`);
        await loadData();
      } else {
        alert("No orphaned data found. Database is clean!");
      }
    } catch (error) {
      console.error("Failed to cleanup orphaned data:", error);
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
      case "mechanism": return activity.data.details.coreMechanism || "Mechanism analysis";
      case "deepDive": return activity.data.details.marketOpportunity || "Deep dive analysis";
      case "crossPollinate": return `${activity.data.result.length} recombinations generated`;
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
              onClick={handleClearAllData}
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
          className={`w-full pl-10 pr-10 py-3 rounded-xl ${theme.inputBg} border focus:outline-none focus:border-indigo-500 text-sm transition-colors`}
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
                {searchResults.needs.map((need: DBNeed) => (
                  <motion.div
                    key={need.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-3 rounded-lg ${theme.card} border ${theme.border} flex items-start justify-between group`}
                  >
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => onLoadNeed(need)}
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
                        className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-red-400 transition-opacity`}
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
                {searchResults.expressions.map((result: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-3 rounded-lg ${theme.card} border ${theme.border} ${theme.hover} cursor-pointer`}
                    onClick={() => onLoadNeed(result.need)}
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
                {searchResults.mechanisms.map((mech: DBMechanism) => (
                  <motion.div
                    key={mech.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-3 rounded-lg ${theme.card} border ${theme.border} ${theme.hover} cursor-pointer`}
                    onClick={() => handleLoadNeedById(mech.needId)}
                  >
                    <div className="font-medium flex items-center gap-2">
                      <Layers className={`w-3 h-3 ${theme.accent}`} />
                      {mech.expressionName}
                    </div>
                    <div className={`text-xs ${theme.muted} mt-1`}>{mech.details.coreMechanism}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {searchResults.deepDives.length > 0 && (
            <div>
              <h3 className={`text-sm font-medium ${theme.muted} mb-2`}>Deep Dives ({searchResults.deepDives.length})</h3>
              <div className="space-y-2">
                {searchResults.deepDives.map((dive: DBDeepDive) => (
                  <motion.div
                    key={dive.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-3 rounded-lg ${theme.card} border ${theme.border} ${theme.hover} cursor-pointer`}
                    onClick={() => handleLoadNeedById(dive.needId)}
                  >
                    <div className="font-medium flex items-center gap-2">
                      <TrendingUp className={`w-3 h-3 ${theme.accent}`} />
                      {dive.expressionName}
                    </div>
                    <div className={`text-xs ${theme.muted} mt-1`}>{dive.details.marketOpportunity}</div>
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
          <div className="flex items-center gap-2 border-b border-slate-700 pb-3">
            <Clock className={`w-4 h-4 ${theme.muted}`} />
            <h3 className="font-medium">Recent Activity</h3>
            <div className="flex-1" />
            <div className="flex gap-1">
              {["all", "needs", "mechanisms", "deepDives", "crossPollinates"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter as any)}
                  className={`text-xs px-2 py-1 rounded ${
                    activeFilter === filter ? "bg-indigo-500/20 text-indigo-300" : theme.muted
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
                  key={i}
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
                    onClick={() => {
                      if (activity.type === "need") {
                        onLoadNeed(activity.data);
                      } else if (activity.type === "mechanism" || activity.type === "deepDive") {
                        handleLoadNeedById(activity.data.needId);
                      } else if (activity.type === "crossPollinate") {
                        // Load first expression's need (could enhance to show both)
                        handleLoadNeedById(activity.data.expression1Id.split('-')[0]);
                      }
                    }}
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
                        className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-red-400 transition-opacity`}
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

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setConfirmDelete(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${theme.card} border ${theme.border} rounded-xl p-6 max-w-md mx-4`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-2">Delete {confirmDelete.type === 'need' ? 'Need' : 'Item'}?</h3>
            <p className={`text-sm ${theme.muted} mb-4`}>
              Are you sure you want to delete "<span className="text-white">{confirmDelete.name}</span>"? 
              {confirmDelete.type === 'need' && " This will also delete all associated mechanisms, deep dives, and analyses."}
              <br /><br />
              <span className="text-red-400">This action cannot be undone.</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className={`flex-1 px-4 py-2 rounded-lg border ${theme.border} ${theme.muted} hover:bg-slate-700/50`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteNeed(confirmDelete.id)}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
