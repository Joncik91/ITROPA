/**
 * The workspace canvas: open-need strip (mobile), toolbar, the need view, and the
 * cross-pollination bar that tells the user what their selection will do.
 */
import { Loader2, PanelRight, Shuffle, SlidersHorizontal, X } from "lucide-react";
import { NeedView } from "../NeedView";
import { IndustryBranch } from "../IndustryBranch";
import { ErrorBoundary } from "../ErrorBoundary";
import type { IndustryExpression } from "../../types";
import type { NeedManager } from "../../hooks/useNeedManager";
import { FIT_FILTER_THRESHOLD } from "../../hooks/useMatchScores";
import type { MatchScoreResult } from "../../utils/match-score";
import { Button, IconButton } from "../ui";
import { OpenNeeds } from "./OpenNeeds";
import { ResearchForm } from "./ResearchForm";
import type { ViewDensity } from "./NeedTools";

export interface CenterPanelProps {
  manager: NeedManager;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  /** Three-column layout: research form and tools live in the side columns. */
  wide: boolean;
  viewDensity: ViewDensity;
  filterEnabled: boolean;
  getMatchScore: (expr: IndustryExpression) => MatchScoreResult | null;
  onNewResearch: () => void;
  onOpenTools: () => void;
  onOpenAssistant: () => void;
}

export const CenterPanel = ({
  manager,
  scrollContainerRef,
  wide,
  viewDensity,
  filterEnabled,
  getMatchScore,
  onNewResearch,
  onOpenTools,
  onOpenAssistant,
}: CenterPanelProps) => {
  const renderBranch = (expr: IndustryExpression, depth: number, needId: string): JSX.Element | null => {
    const matchScore = getMatchScore(expr);
    const low = !!(filterEnabled && matchScore && matchScore.score < FIT_FILTER_THRESHOLD);
    // A low-scoring parent stays visible (dimmed) when any descendant could still match.
    if (low && !expr.children?.length) return null;

    return (
      <IndustryBranch
        key={expr.id}
        expr={expr}
        depth={depth}
        needId={needId}
        isExpanded={!!manager.expandedBranches[expr.id]}
        isBranching={manager.isBranching(expr.id)}
        isCrossSelected={manager.crossPollinate.items.some((i) => i.id === expr.id)}
        dimmed={low}
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

  // Empty workspace: the research form is the page (on desktop it also sits in the left column).
  if (!manager.needs.length) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-8 md:py-16 space-y-8" aria-live="polite">
          <div className="space-y-3">
            <h2 className="text-2xl font-extrabold tracking-tight">Map where a need came from, and where it could go.</h2>
            <p className="text-ink-2">
              Pick a human need. ITROPA finds how people have met it so far, then predicts future industries by recombining that prior art in new contexts.
            </p>
          </div>
          {manager.loading ? (
            <div className="flex items-center gap-3 p-4 rounded-card border border-line bg-sheet">
              <Loader2 className="w-5 h-5 animate-spin text-accent shrink-0" aria-hidden />
              <div>
                <p className="font-medium">Building your research tree</p>
                <p className="text-sm text-ink-2">{manager.loadingStage || "Working…"}</p>
              </div>
            </div>
          ) : wide ? (
            <p className="text-sm text-ink-2">Start in the research panel on the left.</p>
          ) : (
            <ResearchForm manager={manager} />
          )}
        </div>
      </div>
    );
  }

  if (!manager.activeNeed) return <div className="flex-1" />;

  const cross = manager.crossPollinate.items;

  return (
    <div className="flex-1 overflow-hidden flex flex-col min-w-0">
      {!wide && (
        <OpenNeeds
          manager={manager}
          variant="strip"
          onNew={onNewResearch}
          trailing={<>
            <IconButton label="Tools: view, export, tree map" onClick={onOpenTools}><SlidersHorizontal className="w-5 h-5" /></IconButton>
            <IconButton label="Assistant and history" onClick={onOpenAssistant}><PanelRight className="w-5 h-5" /></IconButton>
          </>}
        />
      )}

      <div aria-live="polite" className="text-sm text-ink-2">
        {manager.loading && manager.loadingStage ? (
          <p className="flex items-center gap-1.5 px-4 md:px-6 py-2 border-b border-line"><Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden />{manager.loadingStage}</p>
        ) : filterEnabled ? (
          <p className="px-4 md:px-6 py-2 border-b border-line">Fit filter on: hiding industries scoring under {FIT_FILTER_THRESHOLD}% for your profile.</p>
        ) : null}
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 md:px-6 pt-5 pb-28 md:pb-10">
        <div className="max-w-3xl">
          <ErrorBoundary label={`“${manager.activeNeed.name}”`} resetKey={manager.activeNeed.id}>
            <NeedView
              need={manager.activeNeed}
              renderBranch={renderBranch}
              onAddPrediction={() => manager.openAddModal(manager.activeNeed!.id, null)}
              onFetchNeed={manager.fetchNeed}
            />
          </ErrorBoundary>
        </div>
      </div>

      {cross.length > 0 && !manager.crossPollinate.open && (
        <div className="absolute inset-x-3 bottom-[76px] md:bottom-4 md:left-auto md:right-6 md:w-[26rem] z-20 rounded-card border border-pollen/50 bg-sheet shadow-pop p-3" role="status">
          <div className="flex items-start gap-3">
            <Shuffle className="w-5 h-5 text-pollen shrink-0 mt-0.5" aria-hidden />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {cross.length === 1 ? cross[0].name : `${cross[0].name} + ${cross[1].name}`}
              </p>
              <p className="text-sm text-ink-2">
                {cross.length === 1 ? "Pick one more industry to combine with it." : "Ready: generate hybrid industries from these two."}
              </p>
            </div>
            <IconButton label="Clear selection" onClick={manager.resetCrossPollinate} className="-mr-1 -mt-1"><X className="w-4 h-4" /></IconButton>
          </div>
          {cross.length === 2 && (
            <Button variant="pollen" block size="sm" className="mt-2" onClick={manager.openCrossPollinate}>Combine these two</Button>
          )}
        </div>
      )}
    </div>
  );
};
