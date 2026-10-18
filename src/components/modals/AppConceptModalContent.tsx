/**
 * App ideas generated for one industry: buildable products with scope, stack and pricing.
 */

import { useState } from "react";
import { ChevronDown, AlertTriangle } from "lucide-react";
import type { AppConcept } from "../../types";
import { Badge, Segmented, cx, type Tone } from "../ui";
import { Line, asArray } from "./parts";

export interface AppConceptModalContentProps {
  concepts: AppConcept[];
  industryName: string;
}

const EFFORT_ORDER = ["weekend", "1-2 weeks", "2-4 weeks", "1-2 months", "3+ months"];
const QUICK = ["weekend", "1-2 weeks"];

const effortTone = (e: string): Tone =>
  QUICK.includes(e) ? "ok" : e === "2-4 weeks" ? "warn" : e === "1-2 months" || e === "3+ months" ? "bad" : "neutral";

const scoreText = (s: number) => (s >= 70 ? "text-ok" : s >= 50 ? "text-warn" : "text-bad");

const SORTS = [
  { value: "score", label: "Best score", description: "Highest viability first: the AI's overall rating of demand, feasibility and revenue." },
  { value: "effort", label: "Quickest", description: "Shortest build first, so you can ship something this week." },
] as const;

type Sort = (typeof SORTS)[number]["value"];

const ConceptCard = ({ concept, expanded, onToggle }: { concept: AppConcept; expanded: boolean; onToggle: () => void }) => {
  const detailsId = `concept-${concept.id}`;
  const money = concept.monetization ?? ({} as AppConcept["monetization"]);
  return (
    <article className={cx("rounded-card border bg-sheet transition-colors", expanded ? "border-accent/60" : "border-line")}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={detailsId}
        className="w-full text-left p-4 space-y-3 touch-manipulation"
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-snug">{concept.name}</h3>
            {concept.tagline && <p className="text-sm text-ink-2 mt-0.5">{concept.tagline}</p>}
          </div>
          <div className="text-right shrink-0" title="Viability score from the AI, out of 100">
            <span className={cx("text-xl font-extrabold", scoreText(concept.score))}>{concept.score}</span>
            <span className="text-xs text-ink-2">/100</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {concept.formFactor && <Badge tone="accent">{concept.formFactor}</Badge>}
          {concept.effortEstimate && <Badge tone={effortTone(concept.effortEstimate)}>{concept.effortEstimate}</Badge>}
          {concept.targetUser && <span className="text-sm text-ink-2">For {concept.targetUser}</span>}
        </div>

        {concept.coreFeature && (
          <p className="text-sm">
            <span className="text-ink-2">Core feature: </span>
            {concept.coreFeature}
          </p>
        )}

        {(money.model || money.revenueEstimate) && (
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="text-ink-2">{money.model}</span>
            {money.revenueEstimate && <span className="font-medium text-ok">{money.revenueEstimate}</span>}
          </div>
        )}

        <span className="flex items-center gap-1 text-sm text-accent">
          {expanded ? "Hide details" : "Show scope, stack and risks"}
          <ChevronDown className={cx("w-4 h-4 transition-transform", expanded && "rotate-180")} aria-hidden />
        </span>
      </button>

      {expanded && (
        <div id={detailsId} className="px-4 pb-4 pt-3 border-t border-line space-y-3 text-sm">
          <Line label="Problem it solves">{concept.problemSolved}</Line>
          <Line label="First version includes">{concept.mvpScope}</Line>
          {asArray<string>(concept.techStack).length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-medium mr-1">Stack</span>
              {asArray<string>(concept.techStack).map((t, i) => <Badge key={i}>{t}</Badge>)}
            </div>
          )}
          <Line label="Pricing">{money.pricing}</Line>
          {concept.competitiveEdge && (
            <p><span className="font-medium">Edge: </span><span className="text-ok">{concept.competitiveEdge}</span></p>
          )}
          {asArray<string>(concept.risks).length > 0 && (
            <div className="space-y-1.5">
              <p className="font-medium">Risks</p>
              <ul className="space-y-1.5">
                {asArray<string>(concept.risks).map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-warn shrink-0 mt-0.5" aria-hidden />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </article>
  );
};

export const AppConceptModalContent = ({ concepts, industryName }: AppConceptModalContentProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<Sort>("score");

  const sorted = [...concepts].sort((a, b) =>
    sortBy === "score" ? b.score - a.score : EFFORT_ORDER.indexOf(a.effortEstimate) - EFFORT_ORDER.indexOf(b.effortEstimate),
  );

  const stats = [
    { value: concepts.filter((c) => c.score >= 70).length, label: "Score 70+", tone: "text-ok" },
    { value: concepts.filter((c) => QUICK.includes(c.effortEstimate)).length, label: "Buildable in 2 weeks", tone: "text-accent" },
    { value: new Set(concepts.map((c) => c.formFactor)).size, label: "Form factors", tone: "text-ink" },
  ];

  return (
    <div className="space-y-5">
      <p className="text-sm text-ink-2">
        {concepts.length} {concepts.length === 1 ? "idea" : "ideas"} for <span className="text-ink font-medium">{industryName}</span>. Tap one for its scope, stack and risks.
      </p>

      <div className="grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="p-3 rounded-control bg-well border border-line/60">
            <p className={cx("text-xl font-extrabold", s.tone)}>{s.value}</p>
            <p className="text-xs text-ink-2">{s.label}</p>
          </div>
        ))}
      </div>

      <Segmented label="Sort ideas" value={sortBy} options={SORTS} onChange={setSortBy} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
        {sorted.map((c) => (
          <ConceptCard key={c.id} concept={c} expanded={expandedId === c.id} onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)} />
        ))}
      </div>
    </div>
  );
};
