/**
 * Center panel component for the HomePage.
 * Contains the main canvas with NeedView and toolbar.
 */

import { useState, useEffect, useCallback } from "react";
import { Lightbulb, Loader2, Maximize2, Minimize2, PanelRight, Target } from "lucide-react";
import { NeedView } from "../NeedView";
import { IndustryBranch } from "../IndustryBranch";
import { ErrorBoundary } from "../ErrorBoundary";
import type { IndustryExpression, ConstraintsProfile, DeepDiveDetails } from "../../types";
import type { NeedManager } from "../../hooks/useNeedManager";
import type { Theme } from "../../config/theme";
import { calculateMatchScore, MatchScoreResult } from "../../utils/match-score";
import { DBService } from "../../services/db.service";

export interface CenterPanelProps {
  theme: Theme;
  dark: boolean;
  manager: NeedManager;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  viewDensity: "compact" | "comfortable";
  setViewDensity: (density: "compact" | "comfortable") => void;
  rightSidebarOpen: boolean;
  setRightSidebarOpen: (open: boolean) => void;
  constraintsProfile: ConstraintsProfile;
  filterEnabled: boolean;
  setFilterEnabled: (enabled: boolean) => void;
}

const FILTER_THRESHOLD = 40;

export const CenterPanel = ({
  theme,
  dark,
  manager,
  scrollContainerRef,
  viewDensity,
  setViewDensity,
  rightSidebarOpen,
  setRightSidebarOpen,
  constraintsProfile,
  filterEnabled,
  setFilterEnabled,
}: CenterPanelProps) => {
  const [deepDiveCache, setDeepDiveCache] = useState<Map<string, DeepDiveDetails>>(new Map());
  const activeNeedId = manager.activeNeed?.id;
  const { deepDives: analyzedDeepDives } = manager.analyzed;

  // Deep dive details feed the match score; reload when the need or its analyses change.
  useEffect(() => {
    let alive = true;
    setDeepDiveCache(new Map());
    if (!activeNeedId) return;
    DBService.getDeepDivesByNeed(activeNeedId)
      .then((dives) => {
        if (!alive) return;
        setDeepDiveCache(new Map(dives.filter((d) => d.details?.marketOpportunity).map((d) => [d.id, d.details])));
      })
      .catch((e) => console.error('Failed to load deep dives for scoring:', e));
    return () => { alive = false; };
  }, [activeNeedId, analyzedDeepDives]);

  const getMatchScore = useCallback((expr: IndustryExpression): MatchScoreResult | null => {
    const deepDive = deepDiveCache.get(expr.id);
    return deepDive ? calculateMatchScore(expr, deepDive, constraintsProfile) : null;
  }, [deepDiveCache, constraintsProfile]);

  const scoredCount = deepDiveCache.size;

  const renderBranch = (expr: IndustryExpression, depth: number, needId: string): JSX.Element | null => {
    const matchScore = getMatchScore(expr);
    // A low-scoring parent stays visible (dimmed) when any descendant could still match.
    const hidden = filterEnabled && matchScore && matchScore.score < FILTER_THRESHOLD && !(expr.children?.length);
    if (hidden) return null;

    return (
      <IndustryBranch
        key={expr.id}
        expr={expr}
        depth={depth}
        needId={needId}
        isExpanded={!!manager.expandedBranches[expr.id]}
        isBranching={manager.isBranching(expr.id)}
        isCrossSelected={manager.crossPollinate.items.some((i) => i.id === expr.id)}
        dimmed={!!(filterEnabled && matchScore && matchScore.score < FILTER_THRESHOLD)}
        theme={theme}
        mechanismLoading={manager.isPending("mechanism", expr.id)}
        deepDiveLoading={manager.isPending("deepDive", expr.id)}
        appConceptsLoading={manager.isPending("appConcepts", expr.id)}
        hasMechanism={manager.analyzed.mechanisms.has(expr.id)}
        hasDeepDive={manager.analyzed.deepDives.has(expr.id)}
        hasAppConcepts={manager.analyzed.appConcepts.has(expr.id)}
        matchScore={matchScore}
        onToggleExpand={() => manager.setExpandedBranches((p) => ({ ...p, [expr.id]: !p[expr.id] }))}
        onBranch={() => manager.branchIndustry(expr, needId)}
        onFetchMechanism={() => manager.fetchMechanism(expr)}
        onFetchDeepDive={() => manager.fetchDeepDive(expr)}
        onFetchAppConcepts={() => manager.fetchAppConcepts(expr)}
        onToggleCross={() => manager.toggleCrossItem(expr)}
        onDropCross={(dragged) => manager.selectCrossPair(dragged, expr)}
        onAddSubIndustry={() => manager.openAddModal(needId, expr.id)}
        onDelete={() => manager.deleteExpression(needId, expr.id)}
        viewDensity={viewDensity}
        renderBranch={renderBranch}
      />
    );
  };

  if (!manager.needs.length) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center max-w-md" aria-live="polite">
            {manager.loading ? (
              <>
                <Loader2 className={`w-12 h-12 ${theme.accent} mx-auto mb-4 animate-spin`} />
                <h2 className="text-lg font-semibold mb-1">Building your research tree</h2>
                <p className={`text-sm ${theme.muted}`}>{manager.loadingStage || "Working..."}</p>
              </>
            ) : (
              <>
                <Lightbulb className={`w-16 h-16 ${theme.muted} mx-auto mb-4 opacity-50`} />
                <h2 className="text-xl font-semibold mb-2">Innovation = Prior Art + New Context</h2>
                <p className={`text-sm ${theme.muted} mb-6`}>
                  Research the "best known art" for any human need, then generate future industries as recombinations of existing solutions.
                </p>
                <p className={`text-xs ${theme.muted}`}>
                  Search for a need or choose a suggestion from the sidebar to get started.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!manager.activeNeed) return <div className="flex-1" />;

  return (
    <div className="flex-1 overflow-hidden flex flex-col min-w-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-6 py-3 border-b border-gray-700 flex-shrink-0">
        <div className={`text-xs ${theme.muted} truncate`} aria-live="polite">
          {manager.loading && manager.loadingStage ? (
            <span className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" />{manager.loadingStage}</span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterEnabled(!filterEnabled)}
            disabled={scoredCount === 0 && !filterEnabled}
            aria-pressed={filterEnabled}
            className={`px-2 py-1 text-xs flex items-center gap-1.5 rounded-lg border transition-colors disabled:opacity-40 ${
              filterEnabled
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                : `${theme.border} ${theme.hover}`
            }`}
            title={
              scoredCount === 0
                ? "Run a deep dive on a prediction to score it against your builder profile"
                : filterEnabled ? `Hiding scored industries below ${FILTER_THRESHOLD}%` : "Hide industries that don't match your profile"
            }
          >
            <Target className="w-3.5 h-3.5" />
            {filterEnabled ? "Filtered" : "Filter"}
          </button>

          <div className={`flex items-center rounded-lg border ${theme.border} overflow-hidden`} role="group" aria-label="View density">
            <button
              onClick={() => setViewDensity("comfortable")}
              aria-pressed={viewDensity === "comfortable"}
              className={`px-2 py-1 text-xs flex items-center gap-1.5 transition-colors ${viewDensity === "comfortable" ? "bg-gray-500/20 text-gray-300" : theme.hover}`}
              title="Comfortable view"
              aria-label="Comfortable view"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewDensity("compact")}
              aria-pressed={viewDensity === "compact"}
              className={`px-2 py-1 text-xs flex items-center gap-1.5 transition-colors ${viewDensity === "compact" ? "bg-gray-500/20 text-gray-300" : theme.hover}`}
              title="Compact view"
              aria-label="Compact view"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            className={`md:hidden px-3 py-1.5 rounded flex items-center gap-2 ${theme.btn} transition-colors text-xs`}
            aria-expanded={rightSidebarOpen}
          >
            <PanelRight className="w-3.5 h-3.5" />
            {rightSidebarOpen ? 'Hide' : 'Show'} Assistant
          </button>
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6">
        <ErrorBoundary label={`"${manager.activeNeed.name}"`} resetKey={manager.activeNeed.id}>
          <NeedView
            need={manager.activeNeed}
            theme={theme}
            dark={dark}
            renderBranch={renderBranch}
            onAddPrediction={() => manager.openAddModal(manager.activeNeed!.id, null)}
            onFetchNeed={manager.fetchNeed}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
};
