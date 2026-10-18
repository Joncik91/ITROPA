import { useState, useEffect, type ReactNode } from "react";
import {
  BookOpen,
  Users,
  Target,
  TrendingUp,
  Lightbulb,
  Map,
  ChevronDown,
  Loader2,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { DBService } from "../services/db.service";
import type { PriorArt, PriorArtAnalysis } from "../types";
import { Badge, Hint, cx, type Tone } from "./ui";

interface PriorArtDisplayProps {
  needName: string;
  priorArt: PriorArt;
}

const FRAMEWORKS: Record<string, { label: string; icon: ReactNode }> = {
  "competitive-landscape": { label: "Competitive landscape", icon: <Users className="w-4 h-4" /> },
  "gap-analysis": { label: "Gaps", icon: <Target className="w-4 h-4" /> },
  "evolution-pattern": { label: "How it evolved", icon: <TrendingUp className="w-4 h-4" /> },
  "innovation-potential": { label: "Innovation potential", icon: <Lightbulb className="w-4 h-4" /> },
  "strategic-positioning": { label: "Positioning", icon: <Map className="w-4 h-4" /> },
};

/** Ratings here describe market difficulty: "high" barriers are bad news for a newcomer. */
const difficultyTone = (rating: string): Tone => {
  const r = rating.toLowerCase();
  if (r.includes("high") || r === "disruptive" || r === "oligopolistic") return "bad";
  if (r.includes("medium") || r === "moderate" || r === "emerging") return "warn";
  if (r === "unknown") return "neutral";
  return "ok";
};

const severityTone = (severity?: string): Tone => (severity === "critical" ? "bad" : severity === "high" ? "warn" : "neutral");

const Box = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cx("p-2.5 rounded-control bg-sheet border border-line text-sm", className)}>{children}</div>
);

const SubHeading = ({ children }: { children: ReactNode }) => (
  <p className="text-xs font-semibold text-ink-2 mb-1.5 flex items-center gap-1.5">{children}</p>
);

/**
 * A 0–100 meter. `higherIsBetter` decides whether a high value reads as good (green) or a
 * warning (red), so competitive intensity and white space are coloured the right way round.
 */
const Meter = ({ label, value, hint, higherIsBetter }: { label: string; value: number; hint: string; /** Omit for a neutral meter. */ higherIsBetter?: boolean }) => {
  const good = higherIsBetter ? value >= 70 : value < 40;
  const bar = higherIsBetter === undefined ? "bg-accent" : value >= 40 && value < 70 ? "bg-warn" : good ? "bg-ok" : "bg-bad";
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1 text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-semibold">{value}/100</span>
      </div>
      <div className="h-1.5 rounded-full bg-line overflow-hidden" role="meter" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div className={cx("h-full", bar)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
      <p className="text-xs text-ink-2 mt-1">{hint}</p>
    </div>
  );
};

/** The raw research the AI gathered when the need was created. */
const RawPriorArt = ({ priorArt }: { priorArt: PriorArt }) => {
  const groups: Array<{ title: string; items: any[] | undefined; render: (x: any) => ReactNode }> = [
    {
      title: "Current leaders",
      items: priorArt.currentLeaders,
      render: (c) => (
        <>
          <p className="font-medium">{c.name}{c.domain && <span className="font-normal text-ink-2"> ({c.domain})</span>}</p>
          {c.mechanism && <p className="text-ink-2 mt-0.5">How: {c.mechanism}</p>}
          {c.limitation && <p className="text-warn mt-0.5">Limitation: {c.limitation}</p>}
        </>
      ),
    },
    {
      title: "Historical precedents",
      items: priorArt.historicalPrecedents,
      render: (h) => (
        <>
          <p className="font-medium">{h.name}{h.era && <span className="font-normal text-ink-2"> ({h.era})</span>}</p>
          {h.mechanism && <p className="text-ink-2 mt-0.5">How: {h.mechanism}</p>}
          {h.lesson && <p className="text-ok mt-0.5">Lesson: {h.lesson}</p>}
        </>
      ),
    },
    {
      title: "Adjacent domains",
      items: priorArt.adjacentDomains,
      render: (a) => (
        <>
          <p className="font-medium">{a.name}{a.originalDomain && <span className="font-normal text-ink-2"> ({a.originalDomain})</span>}</p>
          {a.mechanism && <p className="text-ink-2 mt-0.5">How: {a.mechanism}</p>}
          {a.transferPotential && <p className="mt-0.5">Transfer: {a.transferPotential}</p>}
        </>
      ),
    },
    {
      title: "Solutions from nature",
      items: priorArt.natureSolutions,
      render: (n) => (
        <>
          <p className="font-medium">{n.name}</p>
          {n.mechanism && <p className="text-ink-2 mt-0.5">How: {n.mechanism}</p>}
          {n.biomimicryPotential && <p className="mt-0.5">To borrow: {n.biomimicryPotential}</p>}
        </>
      ),
    },
  ];
  const present = groups.filter((g) => g.items?.length);
  if (!present.length) return <p className="text-sm text-ink-2">No prior art was recorded for this need.</p>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {present.map((g) => (
        <div key={g.title}>
          <SubHeading>{g.title} ({g.items!.length})</SubHeading>
          <div className="space-y-2">
            {g.items!.map((item, i) => <Box key={i}>{g.render(item)}</Box>)}
          </div>
        </div>
      ))}
    </div>
  );
};

export const PriorArtDisplay = ({ needName, priorArt }: PriorArtDisplayProps) => {
  const [analyses, setAnalyses] = useState<PriorArtAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRawData, setShowRawData] = useState(false);

  useEffect(() => {
    const loadAnalyses = async () => {
      try {
        const cached = await DBService.getPriorArtAnalysis(needName);
        if (cached?.analyses) {
          setAnalyses(cached.analyses);
        }
      } catch (err) {
        console.warn('Failed to load prior art analyses:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalyses();
  }, [needName]);

  if (loading) {
    return (
      <div className="p-5 rounded-card border border-line flex items-center gap-2 text-sm text-ink-2" aria-live="polite">
        <Loader2 className="w-4 h-4 animate-spin text-accent" />
        Loading the prior art analysis…
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <section className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" aria-hidden />
            Prior art
          </h3>
          <p className="text-sm text-ink-2 mt-1">What already solves "{needName}": today's leaders, history, other fields, and nature.</p>
        </div>
        <Hint>The competitive analysis runs when a need is first researched and did not finish for this one. Research the need again from Explore to retry it.</Hint>
        <RawPriorArt priorArt={priorArt} />
      </section>
    );
  }

  const avg = (key: keyof PriorArtAnalysis) =>
    Math.round(analyses.reduce((s, a) => s + (Number(a[key]) || 0), 0) / analyses.length);

  const metrics = {
    competitiveIntensity: avg("competitiveIntensity"),
    marketMaturity: avg("marketMaturity"),
    innovationOpportunity: avg("innovationOpportunity"),
    whiteSpaceScore: avg("whiteSpaceScore"),
  };

  const ratings: Array<[string, string]> = [
    ["Entry barrier", analyses[0]?.entryBarrier || "unknown"],
    ["Structure", analyses[0]?.competitiveStructure || "unknown"],
    ["Innovation pace", analyses[0]?.innovationPace || "unknown"],
    ["Customer satisfaction", analyses[0]?.customerSatisfaction || "unknown"],
  ];

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent" aria-hidden />
          Prior art and competition
        </h3>
        <p className="text-sm text-ink-2 mt-1">
          What already solves "{needName}", how crowded it is, and where the openings are. Averaged over {analyses.length} lens{analyses.length === 1 ? "" : "es"}.
        </p>
      </div>

      <div className="p-4 rounded-card bg-sheet border border-line space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Meter label="Competitive intensity" value={metrics.competitiveIntensity} higherIsBetter={false} hint="How hard incumbents fight for customers. Lower is easier to enter." />
          <Meter label="Market maturity" value={metrics.marketMaturity} hint="How settled the market is. High means proven demand but fewer surprises." />
          <Meter label="Innovation opportunity" value={metrics.innovationOpportunity} higherIsBetter hint="Room for a genuinely new approach." />
          <Meter label="White space" value={metrics.whiteSpaceScore} higherIsBetter hint="Share of the need nobody serves well yet." />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {ratings.map(([label, value]) => (
            <span key={label} className="inline-flex items-center gap-1.5 text-xs text-ink-2">
              {label}
              <Badge tone={difficultyTone(value)}>{value}</Badge>
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {analyses.map((analysis, idx) => {
          const fw = FRAMEWORKS[analysis.analysisType ?? ""] ?? { label: analysis.analysisType ?? "Analysis", icon: <BookOpen className="w-4 h-4" /> };
          return (
            <article key={idx} className="p-3 rounded-card bg-well border border-line space-y-3">
              <header className="flex items-start gap-2.5">
                <span className="text-accent mt-0.5">{fw.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold">{fw.label}</h4>
                  {analysis.summary && <p className="text-sm text-ink-2 mt-0.5">{analysis.summary}</p>}
                </div>
              </header>

              {analysis.analysisType === "competitive-landscape" && (
                <>
                  {Array.isArray(analysis.competitiveSegments) && analysis.competitiveSegments.length > 0 && (
                    <div>
                      <SubHeading><BarChart3 className="w-3.5 h-3.5" aria-hidden />Segments ({analysis.competitiveSegments.length})</SubHeading>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {analysis.competitiveSegments.map((seg: any, i: number) => (
                          <Box key={i}>
                            <p className="font-medium">{seg.name}</p>
                            <p className="text-ink-2 mt-0.5">{[seg.size && `Size: ${seg.size}`, seg.keyPlayers && `Players: ${seg.keyPlayers}`].filter(Boolean).join(". ")}</p>
                          </Box>
                        ))}
                      </div>
                    </div>
                  )}
                  {Array.isArray(analysis.leaderProfiles) && analysis.leaderProfiles.length > 0 && (
                    <div>
                      <SubHeading>Leaders</SubHeading>
                      <div className="space-y-2">
                        {analysis.leaderProfiles.map((leader: any, i: number) => (
                          <Box key={i}>
                            <p className="font-medium">{leader.company}</p>
                            {leader.coreStrength && <p className="text-ink-2 mt-0.5">Strength: {leader.coreStrength}</p>}
                            {leader.vulnerability && <p className="text-warn mt-0.5">Weak spot: {leader.vulnerability}</p>}
                          </Box>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {analysis.analysisType === "gap-analysis" && (
                <>
                  {Array.isArray(analysis.unmetNeeds) && analysis.unmetNeeds.length > 0 && (
                    <div>
                      <SubHeading><AlertCircle className="w-3.5 h-3.5 text-bad" aria-hidden />Unmet needs ({analysis.unmetNeeds.length})</SubHeading>
                      <div className="space-y-2">
                        {analysis.unmetNeeds.map((need: any, i: number) => (
                          <Box key={i}>
                            <div className="flex justify-between items-start gap-2">
                              <p className="font-medium">{need.description}</p>
                              {need.severity && <Badge tone={severityTone(need.severity)}>{need.severity}</Badge>}
                            </div>
                            {need.affectedSegment && <p className="text-ink-2 mt-0.5">Who: {need.affectedSegment}</p>}
                          </Box>
                        ))}
                      </div>
                    </div>
                  )}
                  {Array.isArray(analysis.whiteSpaces) && analysis.whiteSpaces.length > 0 && (
                    <div>
                      <SubHeading>Openings nobody serves well</SubHeading>
                      <div className="space-y-2">
                        {analysis.whiteSpaces.map((space: any, i: number) => (
                          <Box key={i} className="border-ok/35">
                            <p className="font-medium">{space.area}</p>
                            {space.potential && <p className="text-ink-2 mt-0.5">Potential: {space.potential}</p>}
                          </Box>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {analysis.analysisType === "evolution-pattern" && (
                <>
                  {Array.isArray(analysis.evolutionTimeline) && analysis.evolutionTimeline.length > 0 && (
                    <div>
                      <SubHeading>Timeline</SubHeading>
                      <ol className="space-y-2">
                        {analysis.evolutionTimeline.map((stage: any, i: number) => (
                          <li key={i}>
                            <Box className="flex gap-3">
                              <span className="font-semibold text-accent shrink-0 w-20">{stage.period}</span>
                              <span className="flex-1">
                                <span className="block font-medium">{stage.stage}</span>
                                <span className="block text-ink-2">{stage.characteristics}</span>
                              </span>
                            </Box>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {Array.isArray(analysis.futureStages) && analysis.futureStages.length > 0 && (
                    <div>
                      <SubHeading>What comes next</SubHeading>
                      <div className="space-y-2">
                        {analysis.futureStages.map((stage: any, i: number) => (
                          <Box key={i} className="border-pollen/40">
                            <p className="font-medium">{stage.stage}{stage.timeframe && <span className="font-normal text-ink-2"> ({stage.timeframe})</span>}</p>
                            <p className="text-ink-2 mt-0.5">{stage.prediction}</p>
                          </Box>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {analysis.analysisType === "innovation-potential" && analysis.innovationOpportunities && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {([
                    ["incremental", "Incremental", "Better versions of what exists."],
                    ["adjacent", "Adjacent", "Existing ideas moved to a new audience or use."],
                    ["breakthrough", "Breakthrough", "New approaches that change the category."],
                  ] as const).map(([key, label, hint]) => {
                    const list = (analysis.innovationOpportunities as any)?.[key];
                    if (!Array.isArray(list) || list.length === 0) return null;
                    return (
                      <div key={key}>
                        <SubHeading>{label}</SubHeading>
                        <p className="text-xs text-ink-2 -mt-1 mb-1.5">{hint}</p>
                        <div className="space-y-2">
                          {list.map((opp: any, i: number) => (
                            <Box key={i}>
                              <p className="font-medium">{opp.opportunity}</p>
                              {opp.impact && <p className="text-ink-2 mt-0.5">Impact: {opp.impact}</p>}
                            </Box>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {analysis.analysisType === "strategic-positioning" && (
                <>
                  {Array.isArray(analysis.positioningStrategies) && analysis.positioningStrategies.length > 0 && (
                    <div>
                      <SubHeading>Ways to position</SubHeading>
                      <div className="space-y-2">
                        {analysis.positioningStrategies.map((strategy: any, i: number) => (
                          <Box key={i}>
                            <p className="font-medium">{strategy.strategy}</p>
                            {strategy.rationale && <p className="text-ink-2 mt-0.5">Why: {strategy.rationale}</p>}
                            {strategy.requirements && <p className="text-warn mt-0.5">Needs: {strategy.requirements}</p>}
                          </Box>
                        ))}
                      </div>
                    </div>
                  )}
                  {Array.isArray(analysis.differentiationPillars) && analysis.differentiationPillars.length > 0 && (
                    <div>
                      <SubHeading>How to stand out</SubHeading>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.differentiationPillars.map((pillar: any, i: number) => (
                          <Badge key={i} tone="accent">{typeof pillar === "string" ? pillar : pillar.pillar}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {Array.isArray(analysis.keyInsights) && analysis.keyInsights.length > 0 && (
                <div className="pt-2 border-t border-line">
                  <SubHeading>Key insights</SubHeading>
                  <ul className="list-disc pl-5 space-y-0.5 text-sm">
                    {analysis.keyInsights.map((insight: string, i: number) => <li key={i}>{insight}</li>)}
                  </ul>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="rounded-card border border-line">
        <button
          type="button"
          onClick={() => setShowRawData(!showRawData)}
          aria-expanded={showRawData}
          className="w-full px-3 min-h-[44px] flex items-center justify-between gap-2 text-sm font-medium hover:bg-ink/5 rounded-card touch-manipulation"
        >
          {showRawData ? "Hide the original research" : "Show the original research"}
          <ChevronDown className={cx("w-4 h-4 text-ink-2 transition-transform", showRawData && "rotate-180")} aria-hidden />
        </button>
        {showRawData && (
          <div className="p-3 border-t border-line">
            <RawPriorArt priorArt={priorArt} />
          </div>
        )}
      </div>
    </section>
  );
};
