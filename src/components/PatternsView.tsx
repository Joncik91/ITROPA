import { Loader2, Layers, TrendingUp, Network, Target, Shuffle, BarChart3, RefreshCw, AlertCircle, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { usePatterns } from "../hooks/usePatterns";
import { ratingTone } from "../utils/badge-styles";
import { getFrameworkLabel } from "../config/analysis-frameworks";
import { Badge, Button, Hint, cx } from "./ui";

interface PatternsViewProps {
  onOpenNeed: (needId: string) => void;
}

const REFRESH_HINT =
  "Refresh re-scans your saved mechanisms. Patterns that are new or changed get an AI analysis (10–30 s each); unchanged ones load from cache.";

const scoreTone = (score: number) => (score >= 80 ? "bg-ok" : score >= 60 ? "bg-warn" : "bg-bad");

const FRAMEWORK_ICONS: Record<string, ReactNode> = {
  "frequency-distribution": <BarChart3 className="w-4 h-4" />,
  "need-mapping": <Target className="w-4 h-4" />,
  "evolution-trajectory": <TrendingUp className="w-4 h-4" />,
  "combination-synergies": <Network className="w-4 h-4" />,
  "transfer-potential": <Shuffle className="w-4 h-4" />,
};

const Meter = ({ label, value, hint }: { label: string; value: number; hint: string }) => (
  <div className="p-2.5 rounded-control bg-well border border-line" title={hint}>
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-xs text-ink-2">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
    <div className="mt-1.5 h-1.5 rounded-full bg-line overflow-hidden" role="meter" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={cx("h-full", scoreTone(value))} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  </div>
);

const Rating = ({ label, value }: { label: string; value?: string }) =>
  value ? (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-2">
      {label}
      <Badge tone={ratingTone(value)}>{value}</Badge>
    </span>
  ) : null;

const SubHeading = ({ children }: { children: ReactNode }) => (
  <p className="text-xs font-semibold text-ink-2 mb-1.5">{children}</p>
);

export const PatternsView = ({ onOpenNeed }: PatternsViewProps) => {
  const { patterns, loading, refreshPatterns } = usePatterns();

  const header = (subtitle: ReactNode) => (
    <header className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-2xl font-extrabold tracking-tight">Patterns</h2>
          <p className="text-sm text-ink-2 mt-1">{subtitle}</p>
        </div>
        <Button size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={refreshPatterns} disabled={loading} aria-describedby="patterns-refresh-hint">
          Refresh
        </Button>
      </div>
      <Hint id="patterns-refresh-hint">{REFRESH_HINT}</Hint>
    </header>
  );

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {header("Mechanisms that repeat across industries, and what they suggest.")}
        <div className="flex items-center gap-2 py-12 justify-center text-ink-2" aria-live="polite">
          <Loader2 className="w-5 h-5 animate-spin text-accent" /> Scanning your mechanisms…
        </div>
      </div>
    );
  }

  if (patterns.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {header("Mechanisms that repeat across industries, and what they suggest.")}
        <div className="rounded-card border border-dashed border-line p-6 space-y-2">
          <Layers className="w-8 h-8 text-ink-2" aria-hidden />
          <h3 className="text-lg font-semibold">No patterns yet</h3>
          <p className="text-sm text-ink-2">
            Run Mechanism on several industries in Explore. A pattern appears here once two or more industries share a similar underlying mechanism.
          </p>
        </div>
      </div>
    );
  }

  const industryCount = new Set(patterns.flatMap((p) => p.mechanisms.map((m) => m.id))).size;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {header(`${patterns.length} mechanism${patterns.length === 1 ? "" : "s"} repeat across ${industryCount} industries. Each is analysed for where else it could work.`)}

      <div className="space-y-5">
        {patterns.map((patternGroup) => {
          const first = patternGroup.analyses?.[0];
          return (
            <article key={patternGroup.pattern} className="rounded-card bg-sheet border border-line overflow-hidden">
              <div className="p-4 space-y-3 border-b border-line">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Layers className="w-4 h-4 text-accent shrink-0" aria-hidden />
                      {patternGroup.pattern}
                    </h3>
                    {first?.abstractDescription && <p className="text-sm text-ink-2 mt-1">{first.abstractDescription}</p>}
                  </div>
                  <Badge tone="accent">{patternGroup.mechanisms.length} industries</Badge>
                </div>

                {first && first.strengthScore !== undefined && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Meter label="Strength" value={first.strengthScore} hint="How consistently the mechanism produces results" />
                    {first.universalityScore !== undefined && <Meter label="Universality" value={first.universalityScore} hint="How many different needs it applies to" />}
                    {first.maturityLevel !== undefined && <Meter label="Maturity" value={first.maturityLevel} hint="How established it already is" />}
                    {first.adoptionRate !== undefined && <Meter label="Adoption" value={first.adoptionRate} hint="How widely it is used today" />}
                  </div>
                )}

                {first && (
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <Rating label="Coverage" value={first.needCoverage} />
                    <Rating label="Stability" value={first.stabilityRating} />
                    <Rating label="Combines" value={first.combinationAffinity} />
                    <Rating label="Transfer" value={first.transferReadiness} />
                  </div>
                )}
              </div>

              {patternGroup.loading ? (
                <div className="p-6 flex items-center gap-2 text-sm text-ink-2" aria-live="polite">
                  <Loader2 className="w-4 h-4 text-accent animate-spin" /> Analysing this pattern with AI…
                </div>
              ) : patternGroup.analyses && patternGroup.analyses.length > 0 ? (
                <div className="p-4 space-y-3">
                  {patternGroup.analyses.map((analysis, idx) => (
                    <details key={idx} className="group rounded-control border border-line bg-well" open={idx === 0}>
                      <summary className="flex items-center gap-2 px-3 min-h-[44px] md:min-h-[38px] cursor-pointer list-none text-sm font-semibold">
                        <span className="text-accent">{FRAMEWORK_ICONS[analysis.analysisType] ?? <Layers className="w-4 h-4" />}</span>
                        <span className="flex-1">{getFrameworkLabel(analysis.analysisType)}</span>
                        <ChevronRight className="w-4 h-4 text-ink-2 transition-transform group-open:rotate-90" aria-hidden />
                      </summary>
                      <div className="px-3 pb-3 space-y-3 text-sm">
                        {analysis.keyInsight && <p className="border-l-2 border-accent pl-3">{analysis.keyInsight}</p>}

                        {analysis.distributionMap && (
                          <>
                            {Array.isArray(analysis.distributionMap.hotZones) && analysis.distributionMap.hotZones.length > 0 && (
                              <div>
                                <SubHeading>Where it is concentrated</SubHeading>
                                <div className="flex flex-wrap gap-1.5">
                                  {analysis.distributionMap.hotZones.map((zone: string, i: number) => <Badge key={i} tone="ok">{zone}</Badge>)}
                                </div>
                              </div>
                            )}
                            {Array.isArray(analysis.distributionMap.coldZones) && analysis.distributionMap.coldZones.length > 0 && (
                              <div>
                                <SubHeading>Where it is missing (room to expand)</SubHeading>
                                <div className="flex flex-wrap gap-1.5">
                                  {analysis.distributionMap.coldZones.map((zone: string, i: number) => <Badge key={i}>{zone}</Badge>)}
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {Array.isArray(analysis.needAdaptations) && analysis.needAdaptations.length > 0 && (
                          <div className="space-y-1.5">
                            <SubHeading>How it adapts to other needs</SubHeading>
                            {analysis.needAdaptations.slice(0, 3).map((adapt: any, i: number) => (
                              <div key={i} className="p-2.5 rounded-control bg-sheet border border-line">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <span className="font-medium">{adapt.needName}</span>
                                  {adapt.effectiveness && <Badge tone={ratingTone(adapt.effectiveness)}>{adapt.effectiveness}</Badge>}
                                </div>
                                <p className="text-ink-2">{adapt.adaptation}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {analysis.evolutionStages && (
                          <div>
                            <SubHeading>Evolution</SubHeading>
                            {analysis.evolutionStages.nextEvolution && <p>Next: {analysis.evolutionStages.nextEvolution}</p>}
                            {analysis.evolutionStages.evolutionSpeed && (
                              <p className="mt-1 flex items-center gap-2 text-ink-2">
                                Speed <Badge tone={ratingTone(analysis.evolutionStages.evolutionSpeed)}>{analysis.evolutionStages.evolutionSpeed}</Badge>
                              </p>
                            )}
                          </div>
                        )}

                        {analysis.synergyPatterns?.strongPairings?.length > 0 && (
                          <div className="space-y-1.5">
                            <SubHeading>Pairs well with</SubHeading>
                            {analysis.synergyPatterns.strongPairings.slice(0, 2).map((pair: any, i: number) => (
                              <div key={i} className="p-2.5 rounded-control border border-ok/35 bg-ok/10">
                                <p className="font-medium">{pair.pattern}{pair.synergyType && <span className="font-normal text-ink-2">: {pair.synergyType}</span>}</p>
                                <p className="text-ink-2 mt-0.5">{pair.benefit}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {Array.isArray(analysis.transferTargets) && analysis.transferTargets.length > 0 && (
                          <div className="space-y-1.5">
                            <SubHeading>Where to transfer it</SubHeading>
                            {analysis.transferTargets.slice(0, 2).map((target: any, i: number) => (
                              <div key={i} className="p-2.5 rounded-control bg-sheet border border-line">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <span className="font-medium">{target.targetNeed} › {target.targetIndustry}</span>
                                  {target.expectedImpact && <Badge tone={ratingTone(target.expectedImpact)}>{target.expectedImpact} impact</Badge>}
                                </div>
                                <p className="text-ink-2">{target.marketGap}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {Array.isArray(analysis.strategicImplications) && analysis.strategicImplications.length > 0 && (
                          <div>
                            <SubHeading>What it means for you</SubHeading>
                            <ul className="list-disc pl-5 space-y-0.5">
                              {analysis.strategicImplications.map((impl: string, i: number) => <li key={i}>{impl}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              ) : patternGroup.failed ? (
                <p className="p-4 text-sm flex items-center gap-2 text-ink-2" role="alert">
                  <AlertCircle className="w-4 h-4 text-bad shrink-0" />
                  The AI analysis failed for this pattern. Refresh to retry.
                </p>
              ) : null}

              <div className="p-4 border-t border-line">
                <p className="text-xs font-semibold text-ink-2 mb-2">Found in these industries. Tap one to open its need.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {patternGroup.mechanisms.map((mech) => (
                    <button
                      key={mech.id}
                      type="button"
                      className="px-3 py-2 min-h-[44px] md:min-h-[38px] rounded-control border border-line bg-well hover:border-accent/60 transition-colors text-sm text-left touch-manipulation"
                      onClick={() => onOpenNeed(mech.needId)}
                      title={mech.needName ? `Open ${mech.needName}` : "Open need"}
                    >
                      <span className="font-medium">{mech.expressionName}</span>
                      {mech.needName && <span className="block text-xs text-accent">{mech.needName}</span>}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
