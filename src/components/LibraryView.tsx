import { useState, useEffect, useCallback, useId, type KeyboardEvent, type ReactNode } from "react";
import toast from "react-hot-toast";
import { Search, Database, Layers, TrendingUp, Shuffle, Sparkles, X, Trash2, Eraser } from "lucide-react";
import { DBService } from "../services/db.service";
import { Button, Hint, IconButton, Segmented, Sheet, TextInput, type Option } from "./ui";

interface LibraryViewProps {
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

type ActivityFilter = "all" | "needs" | "mechanisms" | "deepDives" | "crossPollinates";

const FILTERS: ReadonlyArray<Option<ActivityFilter>> = [
  { value: "all", label: "All", description: "Everything you saved, newest first." },
  { value: "needs", label: "Needs", description: "Researched needs. Open one to continue its tree." },
  { value: "mechanisms", label: "Mechanisms", description: "How-it-works breakdowns. Opening one opens the need it belongs to." },
  { value: "deepDives", label: "Deep dives", description: "Market analyses. Opening one opens the need it belongs to." },
  { value: "crossPollinates", label: "Hybrids", description: "Cross-pollination results. Opening one opens the need of its first industry." },
];

/** Shared row styling for library entries. */
const ROW = "p-3 rounded-card bg-sheet border border-line";
const ROW_PRESSABLE = `${ROW} cursor-pointer hover:border-accent/60 transition-colors touch-manipulation`;

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

export const LibraryView = ({ onOpenNeed, onDeleteNeed, onClearAll }: LibraryViewProps) => {
  const searchId = useId();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActivityFilter>("all");
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
        toast.success(`Deleted "${target.name}" and its analyses`);
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
        toast.success("Nothing to clean up: every analysis still belongs to a saved need.");
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

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
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

  const hasQuery = !!searchQuery.trim();
  const hasSearchResults = hasQuery && (
    searchResults.needs.length > 0 ||
    searchResults.expressions.length > 0 ||
    searchResults.mechanisms.length > 0 ||
    searchResults.deepDives.length > 0
  );

  const STAT_TILES = [
    { label: "Needs", value: stats.needs, icon: Database },
    { label: "Mechanisms", value: stats.mechanisms, icon: Layers },
    { label: "Deep dives", value: stats.deepDives, icon: TrendingUp },
    { label: "Hybrids", value: stats.crossPollinates, icon: Shuffle },
    { label: "Saved items", value: stats.total, icon: Sparkles },
  ];

  const deleteNeedButton = (id: string, name: string) => (
    <IconButton
      label={`Delete ${name} permanently`}
      onClick={(e) => {
        e.stopPropagation();
        setConfirmDelete({ type: "need", id, name });
      }}
      className="text-bad hover:text-bad hover:bg-bad/10"
    >
      <Trash2 className="w-4 h-4" />
    </IconButton>
  );

  const resultGroup = (title: string, count: number, children: ReactNode) => (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-ink-2">{title} ({count})</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Library</h2>
          <p className="text-sm text-ink-2 mt-1">Everything you have researched, saved in this browser. Search it or reopen a need.</p>
        </div>
        {stats.total > 0 && (
          <div className="flex gap-2">
            <Button size="sm" icon={<Eraser className="w-4 h-4" />} onClick={handleCleanupOrphaned}
              title="Delete analyses whose industry no longer exists in any saved need">
              Clean up
            </Button>
            <Button size="sm" variant="danger" icon={<Trash2 className="w-4 h-4" />}
              onClick={() => setConfirmDelete({ type: "all", id: "", name: "all saved data" })}>
              Delete all
            </Button>
          </div>
        )}
      </header>

      <dl className="grid grid-cols-3 md:grid-cols-5 gap-2">
        {STAT_TILES.map(({ label, value, icon: Icon }) => (
          <div key={label} className="p-3 rounded-card border border-line bg-sheet">
            <dt className="text-xs text-ink-2 flex items-center gap-1.5"><Icon className="w-3.5 h-3.5 text-accent" aria-hidden />{label}</dt>
            <dd className="text-xl font-extrabold mt-1">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="space-y-1.5">
        <label htmlFor={searchId} className="block text-sm font-medium">Search the library</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-2 pointer-events-none" aria-hidden />
          <TextInput
            id={searchId}
            aria-describedby={`${searchId}-hint`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g. sleep, subscription, logistics"
            className="pl-9 pr-11"
            type="search"
          />
          {searchQuery && (
            <IconButton label="Clear search" onClick={() => setSearchQuery("")} className="absolute right-0 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4" />
            </IconButton>
          )}
        </div>
        <Hint id={`${searchId}-hint`}>Matches names and text across needs, industries, mechanisms and deep dives. Results update as you type.</Hint>
      </div>

      {hasQuery && !hasSearchResults && (
        <p className="text-sm text-ink-2">No matches for "{searchQuery.trim()}". Try a shorter word, or research it as a new need from Explore.</p>
      )}

      {hasSearchResults && (
        <div className="space-y-5">
          {searchResults.needs.length > 0 && resultGroup("Needs", searchResults.needs.length,
            searchResults.needs.map((need) => (
              <div key={need.id} className={`${ROW} flex items-start gap-2`}>
                <div className="flex-1 min-w-0 cursor-pointer" {...asButton(() => onOpenNeed(need.id))}>
                  <div className="font-medium">{need.name}</div>
                  <div className="text-sm text-ink-2 mt-0.5 line-clamp-2">{need.description}</div>
                  <div className="text-xs text-ink-2 mt-1">Updated {formatDate(need.updatedAt)}</div>
                </div>
                {deleteNeedButton(need.id, need.name)}
              </div>
            )))}

          {searchResults.expressions.length > 0 && resultGroup("Industries", searchResults.expressions.length,
            searchResults.expressions.map((result) => (
              <div key={`${result.need.id}:${result.expression.id}`} className={ROW_PRESSABLE} {...asButton(() => onOpenNeed(result.need.id))}>
                <div className="font-medium flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden />
                  {result.expression.name}
                </div>
                <div className="text-sm text-ink-2 mt-0.5">{result.expression.mutation}</div>
                <div className="text-xs text-ink-2 mt-1.5">
                  In <span className="text-accent">{result.need.name}</span>{result.path.length > 0 && <>: {result.path.join(" › ")}</>}
                </div>
              </div>
            )))}

          {searchResults.mechanisms.length > 0 && resultGroup("Mechanisms", searchResults.mechanisms.length,
            searchResults.mechanisms.map((mech) => (
              <div key={mech.id} className={ROW_PRESSABLE} {...asButton(() => void openNeedOfExpression(mech.id))}>
                <div className="font-medium flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden />
                  {mech.expressionName}
                </div>
                <div className="text-sm text-ink-2 mt-0.5 line-clamp-2">{coreMechanismOf(mech.details)}</div>
              </div>
            )))}

          {searchResults.deepDives.length > 0 && resultGroup("Deep dives", searchResults.deepDives.length,
            searchResults.deepDives.map((dive) => (
              <div key={dive.id} className={ROW_PRESSABLE} {...asButton(() => void openNeedOfExpression(dive.id))}>
                <div className="font-medium flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden />
                  {dive.expressionName}
                </div>
                <div className="text-sm text-ink-2 mt-0.5 line-clamp-2">{dive.details?.marketOpportunity}</div>
              </div>
            )))}
        </div>
      )}

      {!hasQuery && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Recent activity</h3>
          <Segmented label="Show" value={activeFilter} options={FILTERS} onChange={setActiveFilter} />

          <div className="space-y-2">
            {loading ? (
              <p className="text-sm text-ink-2 py-6">Loading your library…</p>
            ) : filteredActivity.length === 0 ? (
              <p className="text-sm text-ink-2 py-6">
                {activeFilter === "all"
                  ? "Nothing saved yet. Research a need from Explore and it will appear here."
                  : "Nothing of this kind yet. Run it on an industry from its card in Explore."}
              </p>
            ) : (
              filteredActivity.map((activity) => (
                <div key={`${activity.type}:${activity.data.id ?? activity.data.key}`} className={`${ROW} flex items-start gap-3`}>
                  <span className="w-9 h-9 rounded-control border border-line text-accent flex items-center justify-center shrink-0" aria-hidden>
                    {getActivityIcon(activity.type)}
                  </span>
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    {...asButton(() => {
                      if (activity.type === "need") onOpenNeed(activity.data.id);
                      else if (activity.type === "mechanism" || activity.type === "deepDive") void openNeedOfExpression(activity.data.id);
                      else if (activity.type === "crossPollinate") void openNeedOfExpression(activity.data.expression1Id);
                    })}
                  >
                    <div className="font-medium truncate">{getActivityTitle(activity)}</div>
                    <div className="text-sm text-ink-2 mt-0.5 line-clamp-2">{getActivityDescription(activity)}</div>
                    <div className="text-xs text-ink-2 mt-1">{formatDate(activity.timestamp)}</div>
                  </div>
                  {activity.type === "need" && deleteNeedButton(activity.data.id, activity.data.name)}
                </div>
              ))
            )}
          </div>
        </section>
      )}

      <Sheet
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title={confirmDelete?.type === "all" ? "Delete all saved data?" : `Delete "${confirmDelete?.name ?? ""}"?`}
        size="sm"
        label="the delete confirmation"
        footer={
          <div className="flex gap-2">
            <Button block onClick={() => setConfirmDelete(null)} data-autofocus>Keep it</Button>
            <Button block variant="danger" icon={<Trash2 className="w-4 h-4" />} onClick={handleConfirmedDelete}>
              {confirmDelete?.type === "all" ? "Delete everything" : "Delete need"}
            </Button>
          </div>
        }
      >
        {confirmDelete && (
          <div className="space-y-3 text-sm">
            <p>
              {confirmDelete.type === "all"
                ? "Every need, industry, analysis and cached result stored in this browser will be removed, and open needs will close."
                : "The need, its whole industry tree, and all its mechanisms, deep dives, app ideas and hybrids will be removed. Its tab closes if open."}
            </p>
            <p className="text-bad font-medium">This cannot be undone. Export first from Explore if you want a copy.</p>
          </div>
        )}
      </Sheet>
    </div>
  );
};
