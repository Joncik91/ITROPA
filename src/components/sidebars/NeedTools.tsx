import { useState } from "react";
import { BookOpen, ChevronRight, Download, FileJson, FileSpreadsheet, FileText, Shuffle } from "lucide-react";
import toast from "react-hot-toast";
import type { NeedManager } from "../../hooks/useNeedManager";
import { FIT_FILTER_THRESHOLD } from "../../hooks/useMatchScores";
import { expressionAncestors, getFutureExpressions } from "../../utils/need-model";
import { exportAsCSV, exportAsJSON, exportAsMarkdown } from "../../utils/export";
import { MiniMap } from "../MiniMap";
import { Button, Hint, Section, Segmented, Toggle } from "../ui";

export type ViewDensity = "comfortable" | "compact";

export interface NeedToolsProps {
  manager: NeedManager;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  viewDensity: ViewDensity;
  setViewDensity: (d: ViewDensity) => void;
  filterEnabled: boolean;
  setFilterEnabled: (on: boolean) => void;
  scoredCount: number;
  /** Called after an action that moves focus to the tree (closes the mobile sheet). */
  onNavigate?: () => void;
}

const EXPORTS = [
  { format: "markdown", label: "Report", ext: "Markdown", icon: FileText, description: "A readable write-up of the tree and prior art, for notes or docs.", run: exportAsMarkdown },
  { format: "csv", label: "Spreadsheet", ext: "CSV", icon: FileSpreadsheet, description: "One row per predicted industry, for sorting and filtering.", run: exportAsCSV },
  { format: "json", label: "Full data", ext: "JSON", icon: FileJson, description: "Everything, including prior art and which industries are analyzed.", run: exportAsJSON },
] as const;

/** View settings, cross-pollination status, export, prior art summary and the tree map. */
export const NeedTools = ({ manager, scrollContainerRef, viewDensity, setViewDensity, filterEnabled, setFilterEnabled, scoredCount, onNavigate }: NeedToolsProps) => {
  const [priorArtOpen, setPriorArtOpen] = useState(false);
  const need = manager.activeNeed;
  if (!need) return null;

  const exportAs = (e: (typeof EXPORTS)[number]) => {
    try {
      e.run({
        need,
        analyzedExpressions: {
          mechanisms: Array.from(manager.analyzed.mechanisms),
          deepDives: Array.from(manager.analyzed.deepDives),
        },
      });
      toast.success(`Downloaded ${e.label.toLowerCase()} (${e.ext}) for ${need.name}`);
    } catch (err) {
      toast.error(`Export failed: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  };

  /** Expand the path to a node, then scroll it into view and flash it. */
  const reveal = (exprId: string) => {
    const ancestors = expressionAncestors(getFutureExpressions(need), exprId) ?? [];
    if (ancestors.length) {
      manager.setExpandedBranches((prev) => ({ ...prev, ...Object.fromEntries(ancestors.map((id) => [id, true])) }));
    }
    onNavigate?.();
    window.setTimeout(() => {
      const el = scrollContainerRef.current?.querySelector<HTMLElement>(`[data-expr-id="${CSS.escape(exprId)}"]`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.animate([{ outline: "2px solid rgb(var(--pollen))" }, { outline: "2px solid transparent" }], { duration: 1200 });
    }, ancestors.length ? 250 : 0);
  };

  const cross = manager.crossPollinate.items;
  const pa = need.priorArt;
  const priorArtGroups = pa
    ? [
        { title: "Current leaders", items: (pa.currentLeaders ?? []).map((c) => ({ name: c.name, sub: c.domain })) },
        { title: "Historical", items: (pa.historicalPrecedents ?? []).map((h) => ({ name: h.name, sub: h.era })) },
        { title: "Adjacent domains", items: (pa.adjacentDomains ?? []).map((a) => ({ name: a.name, sub: a.originalDomain })) },
        { title: "Nature's solutions", items: (pa.natureSolutions ?? []).map((n) => ({ name: n.name, sub: undefined as string | undefined })) },
      ].filter((g) => g.items.length)
    : [];

  return (
    <div className="space-y-6">
      <Section title="View">
        <Toggle
          label="Fit filter"
          checked={filterEnabled}
          onChange={setFilterEnabled}
          disabled={scoredCount === 0 && !filterEnabled}
          hint={
            scoredCount === 0
              ? "Run a deep dive on an industry first. Only deep-dived industries get a fit score."
              : filterEnabled
                ? `Hiding industries that score under ${FIT_FILTER_THRESHOLD}% for your builder profile (${scoredCount} scored).`
                : `Hide industries that score under ${FIT_FILTER_THRESHOLD}% for your builder profile (${scoredCount} scored).`
          }
        />
        <Segmented
          label="Card density"
          value={viewDensity}
          onChange={setViewDensity}
          options={[
            { value: "comfortable", label: "Comfortable", description: "Full cards with prior art and every action." },
            { value: "compact", label: "Compact", description: "Tighter cards to see more of the tree at once." },
          ]}
        />
      </Section>

      {cross.length > 0 && (
        <Section title="Cross-pollination" description={cross.length === 1 ? `${cross[0].name} selected. Pick one more industry.` : `${cross[0].name} + ${cross[1].name}`}>
          <Button variant="pollen" block icon={<Shuffle className="w-4 h-4" />} onClick={() => { manager.openCrossPollinate(); onNavigate?.(); }}>
            {cross.length === 2 ? "Combine these two" : "Review selection"}
          </Button>
        </Section>
      )}

      <Section title="Export" description={`Download “${need.name}” as a file.`}>
        <ul className="space-y-1 -mx-2">
          {EXPORTS.map((e) => (
            <li key={e.format}>
              <button type="button" onClick={() => exportAs(e)} className="w-full text-left flex gap-3 px-2 py-2.5 rounded-control hover:bg-ink/5 touch-manipulation">
                <e.icon className="w-5 h-5 text-accent shrink-0 mt-0.5" aria-hidden />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium">{e.label} <span className="font-normal text-ink-2">({e.ext})</span></span>
                  <span className="block text-sm text-ink-2">{e.description}</span>
                </span>
                <Download className="w-4 h-4 text-ink-2 shrink-0 mt-1" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </Section>

      {priorArtGroups.length > 0 && (
        <section className="space-y-2">
          <button
            type="button"
            onClick={() => setPriorArtOpen((o) => !o)}
            aria-expanded={priorArtOpen}
            className="w-full flex items-center justify-between min-h-[44px] md:min-h-[36px] text-base font-semibold"
          >
            <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-accent" aria-hidden />Prior art summary</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${priorArtOpen ? "rotate-90" : ""}`} aria-hidden />
          </button>
          {!priorArtOpen && <Hint>The existing solutions the predictions were built from.</Hint>}
          {priorArtOpen && (
            <div className="space-y-4">
              {priorArtGroups.map((g) => (
                <div key={g.title}>
                  <p className="text-sm font-medium text-ink-2 mb-1">{g.title} ({g.items.length})</p>
                  <ul className="border-l border-line pl-3 space-y-1.5">
                    {g.items.map((it, i) => (
                      <li key={i} className="text-sm">
                        {it.name}
                        {it.sub && <span className="block text-xs text-ink-2">{it.sub}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <Section title="Tree map">
        <MiniMap eras={need.eras} onNodeClick={reveal} />
      </Section>
    </div>
  );
};
