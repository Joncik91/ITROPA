import { useState } from "react";
import { Plus, Clock, List, BookOpen, GitBranch, ArrowUpRight } from "lucide-react";
import type { Need, IndustryExpression } from "../types";
import { getIcon } from "../config/constants";
import { TimelineView } from "./TimelineView";
import { PriorArtDisplay } from "./PriorArtDisplay";
import { ChainAnalyticsView } from "./ChainAnalyticsView";
import { ErrorBoundary } from "./ErrorBoundary";
import { isFutureEra } from "../utils/need-model";
import { Button, Chip, Hint, Segmented, cx } from "./ui";

type ViewMode = "tree" | "timeline" | "prior-art" | "chains";

const VIEW_MODES = [
  { value: "tree", label: "Tree", icon: <List className="w-4 h-4" aria-hidden />, description: "Predicted industries grouped by era. Act on each one to branch, analyze or combine it." },
  { value: "timeline", label: "Timeline", icon: <Clock className="w-4 h-4" aria-hidden />, description: "How solutions to this need evolved, era by era, ending in the predictions." },
  { value: "prior-art", label: "Prior art", icon: <BookOpen className="w-4 h-4" aria-hidden />, description: "The existing solutions the predictions recombine: today's leaders, history, adjacent fields and nature." },
  { value: "chains", label: "Chains", icon: <GitBranch className="w-4 h-4" aria-hidden />, description: "Which prior art inspired which prediction, and the patterns that recur." },
] as const satisfies ReadonlyArray<{ value: ViewMode; label: string; description: string; icon: JSX.Element }>;

interface NeedViewProps {
  need: Need;
  renderBranch: (expr: IndustryExpression, depth: number, needId: string) => JSX.Element | null;
  onAddPrediction: () => void;
  onFetchNeed: (needName: string) => void;
}

export const NeedView = ({ need, renderBranch, onAddPrediction, onFetchNeed }: NeedViewProps) => {
  const Icon = getIcon(need.icon);
  const [viewMode, setViewMode] = useState<ViewMode>("tree");

  return (
    <div className="space-y-5">
      <header className="flex items-start gap-3">
        <span className="mt-1 w-10 h-10 rounded-card border border-line bg-sheet flex items-center justify-center shrink-0 text-accent">
          <Icon className="w-5 h-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="text-2xl font-extrabold tracking-tight break-words">{need.name}</h2>
          {need.description && <p className="text-base text-ink-2 mt-1 max-w-[70ch]">{need.description}</p>}
        </div>
      </header>

      <Segmented label="View" asTabs value={viewMode} options={VIEW_MODES} onChange={setViewMode} />

      {viewMode === "timeline" ? (
        <TimelineView need={need} />
      ) : viewMode === "prior-art" ? (
        <ErrorBoundary inline label="the prior art analysis" resetKey={need.id}>
          <PriorArtDisplay key={need.id} needName={need.name} priorArt={need.priorArt ?? {}} />
        </ErrorBoundary>
      ) : viewMode === "chains" ? (
        <ErrorBoundary inline label="the inspiration chains" resetKey={need.id}>
          <ChainAnalyticsView key={need.id} need={need} />
        </ErrorBoundary>
      ) : (
        <ol className="relative">
          {need.eras.map((era, i) => {
            const isFuture = isFutureEra(era);
            const last = i === need.eras.length - 1;
            return (
              <li key={i} className="relative pl-7 pb-6 last:pb-0">
                {/* Lineage stem: a node per era, joined by a line to the next one. */}
                {!last && <span aria-hidden className="absolute left-[7px] top-4 bottom-0 w-0.5 bg-line" />}
                <span
                  aria-hidden
                  className={cx(
                    "absolute left-0 top-[5px] w-4 h-4 rounded-full border-2",
                    isFuture ? "border-pollen bg-pollen/30" : "border-line bg-paper",
                  )}
                />
                <h3 className={cx("text-sm font-semibold mb-2.5", isFuture ? "text-pollen" : "text-ink-2")}>{era.name}</h3>
                {isFuture ? (
                  <div className="space-y-2.5">
                    {(era.expressions as IndustryExpression[]).map(expr => renderBranch(expr, 0, need.id))}
                    <div className="pt-1 space-y-1.5">
                      <Button variant="ghost" size="sm" onClick={onAddPrediction} icon={<Plus className="w-4 h-4" aria-hidden />} className="border-dashed !border-line">
                        Add your own prediction
                      </Button>
                      <Hint>Write an industry by hand. It joins this era and works with every action.</Hint>
                    </div>
                  </div>
                ) : (
                  <ul className="flex flex-wrap gap-1.5">
                    {(era.expressions as string[]).map((expr, j) => (
                      <li key={j} className="text-sm px-2.5 py-1 rounded-full border border-line bg-ink/5 text-ink-2">{expr}</li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {!!need.relatedNeeds?.length && (
        <section className="pt-4 border-t border-line space-y-2">
          <h3 className="text-sm font-semibold">Related needs</h3>
          <div className="flex flex-wrap gap-2">
            {need.relatedNeeds.map((r: string) => (
              <Chip key={r} onClick={() => onFetchNeed(r)}>
                {r}
                <ArrowUpRight className="w-3.5 h-3.5 text-ink-2" aria-hidden />
              </Chip>
            ))}
          </div>
          <Hint>Opens a new research tab for this need.</Hint>
        </section>
      )}
    </div>
  );
};
