import { useState, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  GitBranch,
  Users,
  Binary,
  Zap,
  Link2,
  ChevronDown,
  TrendingUp,
  Target,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import type { Need, IndustryExpression, ChainAnalysis } from "../types";
import { DBService } from "../services/db.service";
import { getGeminiService } from "../services/gemini.service";
import { ratingTone } from "../utils/badge-styles";
import { Badge, Hint, cx } from "./ui";

interface ChainAnalyticsViewProps {
  need: Need;
}

const FRAMEWORKS: Record<string, { label: string; icon: ReactNode; description: string }> = {
  "lineage-tracing": { label: "Lineage", icon: <GitBranch className="w-4 h-4" />, description: "How many generations deep the idea goes and where it splits." },
  "influence-mapping": { label: "Influence", icon: <Users className="w-4 h-4" />, description: "Which industries in the tree shape the others most." },
  "divergence-patterns": { label: "Divergence", icon: <Binary className="w-4 h-4" />, description: "How varied the branches are and where the novel ones sit." },
  "innovation-velocity": { label: "Velocity", icon: <Zap className="w-4 h-4" />, description: "How fast ideas evolve along the chain and what speeds them up." },
  "coherence-assessment": { label: "Coherence", icon: <Link2 className="w-4 h-4" />, description: "Whether the chain holds together as themes or scatters." },
};

const metricTone = (value: number) => (value >= 70 ? "text-ok" : value >= 40 ? "text-warn" : "text-bad");

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex justify-between gap-3 text-sm">
    <span className="text-ink-2">{label}</span>
    <span className="font-medium text-right">{children}</span>
  </div>
);

const Score = ({ value }: { value: number }) => <span className={metricTone(value)}>{value}/100</span>;

const Items = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="mt-2 space-y-1.5">
    <p className="text-xs font-semibold text-ink-2">{title}</p>
    {children}
  </div>
);

const ItemBox = ({ children }: { children: ReactNode }) => (
  <div className="text-sm p-2.5 rounded-control bg-sheet border border-line">{children}</div>
);

export const ChainAnalyticsView = ({ need }: ChainAnalyticsViewProps) => {
  const [analyses, setAnalyses] = useState<Record<string, ChainAnalysis[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [expandedExpressions, setExpandedExpressions] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  
  const geminiService = getGeminiService();

  // Get all expressions from the need
  const getAllExpressions = (need: Need): IndustryExpression[] => {
    const expressions: IndustryExpression[] = [];
    
    const traverse = (expr: IndustryExpression) => {
      expressions.push(expr);
      expr.children?.forEach(child => traverse(child));
    };
    
    need.eras.forEach(era => {
      if (Array.isArray(era.expressions) && era.expressions.length > 0) {
        era.expressions.forEach((expr: any) => {
          if (typeof expr !== 'string') {
            traverse(expr);
          }
        });
      }
    });
    
    return expressions;
  };

  const allExpressions = getAllExpressions(need);

  // Load cached analyses on mount
  useEffect(() => {
    const loadCachedAnalyses = async () => {
      const cached = await DBService.getChainAnalysesByNeed(need.id);
      const analysesMap: Record<string, ChainAnalysis[]> = {};
      cached.forEach(item => {
        analysesMap[item.expressionId] = item.analyses;
      });
      setAnalyses(analysesMap);
    };
    loadCachedAnalyses();
  }, [need.id]);

  const analyzeExpression = async (expr: IndustryExpression) => {
    if (analyses[expr.id]) {
      // Already analyzed, just toggle expansion
      setExpandedExpressions(prev => ({ ...prev, [expr.id]: !prev[expr.id] }));
      return;
    }

    setLoading(prev => ({ ...prev, [expr.id]: true }));
    setError(null);

    try {
      const chainAnalyses = await geminiService.analyzeInspirationChain(expr, allExpressions);
      
      if (chainAnalyses.length > 0) {
        // Save to database
        await DBService.saveChainAnalysis(expr.id, expr.name, need.id, chainAnalyses);
        
        // Update state
        setAnalyses(prev => ({ ...prev, [expr.id]: chainAnalyses }));
        setExpandedExpressions(prev => ({ ...prev, [expr.id]: true }));
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Chain analysis failed:', err);
    } finally {
      setLoading(prev => ({ ...prev, [expr.id]: false }));
    }
  };

  if (allExpressions.length === 0) {
    return (
      <div className="p-5 rounded-card border border-dashed border-line text-sm text-ink-2">
        No industries to analyse yet. Switch to Tree and add or branch a prediction first.
      </div>
    );
  }

  const analyzedCount = Object.keys(analyses).length;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold">Inspiration chains</h3>
        <p className="text-sm text-ink-2">
          How the industries in this tree inspire each other: lineage, influence, divergence, speed and coherence.
          {" "}{analyzedCount} of {allExpressions.length} analysed.
        </p>
        <Hint>Tap an industry to analyse its chain with AI (10–30 s). Saved results open instantly.</Hint>
      </div>

      {error && (
        <div role="alert" className="p-3 rounded-card bg-bad/10 border border-bad/35 flex items-start gap-2.5 text-sm">
          <AlertCircle className="w-4 h-4 text-bad shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-bad">The chain analysis failed</p>
            <p className="text-ink-2 mt-0.5">{error} Tap the industry again to retry.</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {allExpressions.map((expr) => {
          const exprAnalyses = analyses[expr.id] || [];
          const isExpanded = expandedExpressions[expr.id];
          const isLoading = loading[expr.id];
          const isAnalyzed = exprAnalyses.length > 0;
          const summary = exprAnalyses[0];

          return (
            <div key={expr.id} className="rounded-card bg-sheet border border-line overflow-hidden">
              <button
                type="button"
                onClick={() => analyzeExpression(expr)}
                disabled={isLoading}
                aria-expanded={isAnalyzed ? !!isExpanded : undefined}
                className="w-full p-3 min-h-[56px] flex items-center gap-3 text-left hover:bg-ink/5 transition-colors touch-manipulation disabled:opacity-70"
              >
                <GitBranch className="w-4 h-4 text-accent shrink-0" aria-hidden />
                <span className="flex-1 min-w-0">
                  <span className="block font-medium truncate">{expr.name}</span>
                  <span className="block text-sm text-ink-2 truncate">{expr.mutation}</span>
                </span>
                {isLoading ? (
                  <span className="flex items-center gap-1.5 text-xs text-ink-2 shrink-0"><Loader2 className="w-4 h-4 animate-spin text-accent" />Analysing…</span>
                ) : isAnalyzed ? (
                  <span className="flex items-center gap-2 shrink-0">
                    <Badge tone="ok">Saved</Badge>
                    <ChevronDown className={cx("w-4 h-4 text-ink-2 transition-transform", isExpanded && "rotate-180")} aria-hidden />
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-accent shrink-0">
                    <Sparkles className="w-3.5 h-3.5" aria-hidden />Analyse
                  </span>
                )}
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && isAnalyzed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-line overflow-hidden"
                  >
                    <div className="p-3 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {summary?.innovationPotential !== undefined && (
                          <div>
                            <div className="flex justify-between items-baseline mb-1 text-sm">
                              <span className="text-ink-2">Innovation potential</span>
                              <Score value={summary.innovationPotential} />
                            </div>
                            <div className="h-1.5 rounded-full bg-line overflow-hidden">
                              <div className="h-full bg-accent" style={{ width: `${Math.max(0, Math.min(100, summary.innovationPotential))}%` }} />
                            </div>
                          </div>
                        )}
                        {summary?.chainComplexity && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-ink-2">Complexity</span>
                            <Badge tone={ratingTone(summary.chainComplexity)}>{summary.chainComplexity}</Badge>
                          </div>
                        )}
                        {summary?.strategicValue && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-ink-2">Strategic value</span>
                            <Badge tone={ratingTone(summary.strategicValue)}>{summary.strategicValue}</Badge>
                          </div>
                        )}
                      </div>

                      {exprAnalyses.map((analysis, aIdx) => {
                        const fw = FRAMEWORKS[analysis.analysisType] ?? {
                          label: analysis.analysisType ?? "Analysis",
                          icon: <Target className="w-4 h-4" />,
                          description: "",
                        };
                        return (
                          <section key={aIdx} className="p-3 rounded-control bg-well border border-line space-y-2">
                            <header className="flex items-start gap-2.5">
                              <span className="text-accent mt-0.5">{fw.icon}</span>
                              <div className="flex-1">
                                <h4 className="font-semibold">{fw.label}</h4>
                                {fw.description && <p className="text-xs text-ink-2">{fw.description}</p>}
                              </div>
                            </header>
                            {analysis.summary && <p className="text-sm">{analysis.summary}</p>}

                            {analysis.analysisType === "lineage-tracing" && (
                              <>
                                {analysis.generationDepth !== undefined && <Row label="Generations">{analysis.generationDepth}</Row>}
                                {analysis.totalNodes !== undefined && <Row label="Industries in chain">{analysis.totalNodes}</Row>}
                                {Array.isArray(analysis.branchingPoints) && analysis.branchingPoints.length > 0 && (
                                  <Items title="Where it splits">
                                    {analysis.branchingPoints.map((bp: any, i: number) => (
                                      <ItemBox key={i}>
                                        <span className="font-medium">{bp.node}</span>
                                        <span className="text-ink-2">: {bp.branchCount} branches at generation {bp.generation}</span>
                                      </ItemBox>
                                    ))}
                                  </Items>
                                )}
                              </>
                            )}

                            {analysis.analysisType === "influence-mapping" && (
                              <>
                                {analysis.networkDensity !== undefined && <Row label="Network density"><Score value={analysis.networkDensity} /></Row>}
                                {Array.isArray(analysis.centralNodes) && analysis.centralNodes.length > 0 && (
                                  <Items title="Most influential">
                                    {analysis.centralNodes.map((node: any, i: number) => (
                                      <ItemBox key={i}>
                                        <div className="flex justify-between items-start gap-2">
                                          <span className="font-medium">{node.node}</span>
                                          {node.role && <Badge>{node.role}</Badge>}
                                        </div>
                                        <p className="text-xs text-ink-2 mt-1">Centrality {node.centralityScore}, reach {node.influenceRadius}</p>
                                      </ItemBox>
                                    ))}
                                  </Items>
                                )}
                              </>
                            )}

                            {analysis.analysisType === "divergence-patterns" && (
                              <>
                                {analysis.branchingStrategy && <Row label="Branching strategy">{analysis.branchingStrategy}</Row>}
                                {analysis.diversityScore !== undefined && <Row label="Diversity"><Score value={analysis.diversityScore} /></Row>}
                                {Array.isArray(analysis.noveltyHotspots) && analysis.noveltyHotspots.length > 0 && (
                                  <Items title="Most novel">
                                    {analysis.noveltyHotspots.map((hs: any, i: number) => (
                                      <ItemBox key={i}>
                                        <span className="font-medium">{hs.node}</span>
                                        <span className="text-ink-2">: {hs.noveltyScore}/100{hs.innovationType ? `, ${hs.innovationType}` : ""}</span>
                                      </ItemBox>
                                    ))}
                                  </Items>
                                )}
                              </>
                            )}

                            {analysis.analysisType === "innovation-velocity" && (
                              <>
                                {analysis.overallVelocity && <Row label="Overall pace">{analysis.overallVelocity}</Row>}
                                {analysis.velocityScore !== undefined && <Row label="Velocity"><Score value={analysis.velocityScore} /></Row>}
                                {Array.isArray(analysis.accelerationZones) && analysis.accelerationZones.length > 0 && (
                                  <Items title="Where it speeds up">
                                    {analysis.accelerationZones.map((zone: any, i: number) => (
                                      <ItemBox key={i}>
                                        <p className="font-medium">{Array.isArray(zone.nodes) ? zone.nodes.join(", ") : ""}</p>
                                        <p className="text-xs text-ink-2 mt-0.5">{[zone.velocityChange, zone.triggerEvent].filter(Boolean).join(". ")}</p>
                                      </ItemBox>
                                    ))}
                                  </Items>
                                )}
                              </>
                            )}

                            {analysis.analysisType === "coherence-assessment" && (
                              <>
                                {analysis.overallCoherence && <Row label="Overall coherence">{analysis.overallCoherence}</Row>}
                                {analysis.coherenceScore !== undefined && <Row label="Coherence"><Score value={analysis.coherenceScore} /></Row>}
                                {Array.isArray(analysis.thematicClusters) && analysis.thematicClusters.length > 0 && (
                                  <Items title="Themes">
                                    {analysis.thematicClusters.map((cluster: any, i: number) => (
                                      <ItemBox key={i}>
                                        <span className="font-medium">{cluster.theme}</span>
                                        <span className="text-ink-2">: {Array.isArray(cluster.nodes) ? cluster.nodes.length : 0} industries, cohesion {cluster.cohesion}</span>
                                      </ItemBox>
                                    ))}
                                  </Items>
                                )}
                              </>
                            )}

                            {Array.isArray(analysis.keyInsights) && analysis.keyInsights.length > 0 && (
                              <div className="pt-2 border-t border-line">
                                <p className="text-xs font-semibold text-ink-2 mb-1">Key insights</p>
                                <ul className="list-disc pl-5 space-y-0.5 text-sm">
                                  {analysis.keyInsights.map((insight: string, i: number) => <li key={i}>{insight}</li>)}
                                </ul>
                              </div>
                            )}

                            {Array.isArray(analysis.recommendedActions) && analysis.recommendedActions.length > 0 && (
                              <div className="pt-2 border-t border-line">
                                <p className="text-xs font-semibold text-ink-2 mb-1 flex items-center gap-1.5">
                                  <TrendingUp className="w-3.5 h-3.5" aria-hidden />What to do next
                                </p>
                                <ul className="list-disc pl-5 space-y-0.5 text-sm">
                                  {analysis.recommendedActions.map((action: string, i: number) => <li key={i}>{action}</li>)}
                                </ul>
                              </div>
                            )}
                          </section>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
