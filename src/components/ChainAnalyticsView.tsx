import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  GitBranch,
  Users,
  Binary,
  Zap,
  Link2,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Target,
  AlertCircle
} from "lucide-react";
import type { Need, IndustryExpression, ChainAnalysis } from "../types";
import { DBService } from "../services/db.service";
import { getGeminiService } from "../services/gemini.service";

interface ChainAnalyticsViewProps {
  need: Need;
  theme: any;
}

export const ChainAnalyticsView = ({ need, theme }: ChainAnalyticsViewProps) => {
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

  const getFrameworkIcon = (type: string) => {
    switch (type) {
      case 'lineage-tracing': return <GitBranch className="w-5 h-5 text-blue-400" />;
      case 'influence-mapping': return <Users className="w-5 h-5 text-purple-400" />;
      case 'divergence-patterns': return <Binary className="w-5 h-5 text-emerald-400" />;
      case 'innovation-velocity': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'coherence-assessment': return <Link2 className="w-5 h-5 text-rose-400" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getMetricColor = (value: number) => {
    if (value >= 70) return "text-emerald-400";
    if (value >= 40) return "text-amber-400";
    return "text-rose-400";
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case 'moderate': return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case 'complex': return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case 'highly-complex': return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  if (allExpressions.length === 0) {
    return (
      <div className={`p-6 rounded-lg ${theme.card} border text-center`}>
        <p className={theme.muted}>No expressions found to analyze. Create some predictions first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`p-6 rounded-lg ${theme.sectionBg} border`}>
        <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <GitBranch className={`w-5 h-5 ${theme.accent}`} />
          Inspiration Chain Analytics
        </h2>
        <p className={`text-sm ${theme.muted} mb-4`}>
          Analyze how expressions inspire each other, trace evolutionary lineages, and discover patterns in your innovation chains.
        </p>
        <p className={`text-xs ${theme.muted}`}>
          {allExpressions.length} expression{allExpressions.length > 1 ? 's' : ''} available • 
          {Object.keys(analyses).length} analyzed
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-rose-300 font-medium">Analysis Error</p>
            <p className="text-xs text-rose-400/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Expression Cards */}
      <div className="space-y-3">
        {allExpressions.map((expr, idx) => {
          const exprAnalyses = analyses[expr.id] || [];
          const isExpanded = expandedExpressions[expr.id];
          const isLoading = loading[expr.id];
          const isAnalyzed = exprAnalyses.length > 0;

          return (
            <motion.div
              key={expr.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`rounded-lg ${theme.card} border overflow-hidden`}
            >
              {/* Expression Header */}
              <button
                onClick={() => analyzeExpression(expr)}
                disabled={isLoading}
                className={`w-full p-4 flex items-center justify-between ${theme.hover} transition-colors`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <GitBranch className={`w-4 h-4 ${theme.accent} flex-shrink-0`} />
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className="font-medium text-sm truncate">{expr.name}</h3>
                    <p className={`text-xs ${theme.muted} truncate`}>{expr.mutation}</p>
                  </div>
                  {isAnalyzed && (
                    <span className="px-2 py-1 rounded text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex-shrink-0">
                      {exprAnalyses.length} frameworks
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isAnalyzed ? (
                    isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  ) : (
                    <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300">Analyze</span>
                  )}
                </div>
              </button>

              {/* Analysis Results */}
              <AnimatePresence>
                {isExpanded && exprAnalyses.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-700/50 overflow-hidden"
                  >
                    <div className="p-4 space-y-4">
                      {/* Overall Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {exprAnalyses[0]?.innovationPotential !== undefined && (
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium">Innovation Potential</span>
                              <span className={`text-xs font-bold ${getMetricColor(exprAnalyses[0].innovationPotential)}`}>
                                {exprAnalyses[0].innovationPotential}/100
                              </span>
                            </div>
                            <div className="w-full bg-gray-700/50 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                                style={{ width: `${exprAnalyses[0].innovationPotential}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {exprAnalyses[0]?.chainComplexity && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">Complexity:</span>
                            <span className={`px-2 py-1 rounded text-xs border ${getComplexityColor(exprAnalyses[0].chainComplexity)}`}>
                              {exprAnalyses[0].chainComplexity}
                            </span>
                          </div>
                        )}
                        
                        {exprAnalyses[0]?.strategicValue && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">Strategic Value:</span>
                            <span className={`px-2 py-1 rounded text-xs border ${
                              exprAnalyses[0].strategicValue === 'critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                              exprAnalyses[0].strategicValue === 'high' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                              exprAnalyses[0].strategicValue === 'medium' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                              'bg-gray-500/20 text-gray-300 border-gray-500/30'
                            }`}>
                              {exprAnalyses[0].strategicValue}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Framework Analyses */}
                      {exprAnalyses.map((analysis, aIdx) => (
                        <div
                          key={aIdx}
                          className={`p-4 rounded-lg ${theme.itemBg} border border-gray-700/50`}
                        >
                          {/* Framework Header */}
                          <div className="flex items-start gap-3 mb-3">
                            {getFrameworkIcon(analysis.analysisType)}
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm mb-1">
                                {analysis.analysisType?.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                              </h4>
                              {analysis.summary && (
                                <p className={`text-xs ${theme.muted} leading-relaxed`}>{analysis.summary}</p>
                              )}
                            </div>
                          </div>

                          {/* Framework-Specific Metrics */}
                          {analysis.analysisType === 'lineage-tracing' && (
                            <div className="space-y-2 mt-3">
                              {analysis.generationDepth !== undefined && (
                                <div className="flex justify-between text-xs">
                                  <span className={theme.muted}>Generation Depth:</span>
                                  <span className="font-medium">{analysis.generationDepth}</span>
                                </div>
                              )}
                              {analysis.totalNodes !== undefined && (
                                <div className="flex justify-between text-xs">
                                  <span className={theme.muted}>Total Nodes:</span>
                                  <span className="font-medium">{analysis.totalNodes}</span>
                                </div>
                              )}
                              {analysis.branchingPoints && analysis.branchingPoints.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium mb-1">Branching Points:</p>
                                  <div className="space-y-1">
                                    {analysis.branchingPoints.map((bp: any, i: number) => (
                                      <div key={i} className={`text-xs p-2 rounded ${theme.sectionBg}`}>
                                        <span className="font-medium text-blue-300">{bp.node}</span>
                                        <span className={theme.muted}> → {bp.branchCount} branches at gen {bp.generation}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {analysis.analysisType === 'influence-mapping' && (
                            <div className="space-y-2 mt-3">
                              {analysis.networkDensity !== undefined && (
                                <div className="flex justify-between text-xs">
                                  <span className={theme.muted}>Network Density:</span>
                                  <span className={`font-medium ${getMetricColor(analysis.networkDensity)}`}>
                                    {analysis.networkDensity}/100
                                  </span>
                                </div>
                              )}
                              {analysis.centralNodes && analysis.centralNodes.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium mb-1">Central Nodes:</p>
                                  <div className="space-y-1">
                                    {analysis.centralNodes.map((node: any, i: number) => (
                                      <div key={i} className={`text-xs p-2 rounded ${theme.sectionBg}`}>
                                        <div className="flex justify-between items-start mb-1">
                                          <span className="font-medium text-purple-300">{node.node}</span>
                                          <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">{node.role}</span>
                                        </div>
                                        <span className={theme.muted}>Score: {node.centralityScore} • Radius: {node.influenceRadius}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {analysis.analysisType === 'divergence-patterns' && (
                            <div className="space-y-2 mt-3">
                              {analysis.branchingStrategy && (
                                <div className="flex justify-between text-xs">
                                  <span className={theme.muted}>Branching Strategy:</span>
                                  <span className="font-medium text-emerald-300">{analysis.branchingStrategy}</span>
                                </div>
                              )}
                              {analysis.diversityScore !== undefined && (
                                <div className="flex justify-between text-xs">
                                  <span className={theme.muted}>Diversity Score:</span>
                                  <span className={`font-medium ${getMetricColor(analysis.diversityScore)}`}>
                                    {analysis.diversityScore}/100
                                  </span>
                                </div>
                              )}
                              {analysis.noveltyHotspots && analysis.noveltyHotspots.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium mb-1">Novelty Hotspots:</p>
                                  <div className="space-y-1">
                                    {analysis.noveltyHotspots.map((hs: any, i: number) => (
                                      <div key={i} className={`text-xs p-2 rounded ${theme.sectionBg}`}>
                                        <span className="font-medium text-emerald-300">{hs.node}</span>
                                        <span className={theme.muted}> → {hs.noveltyScore}/100 ({hs.innovationType})</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {analysis.analysisType === 'innovation-velocity' && (
                            <div className="space-y-2 mt-3">
                              {analysis.overallVelocity && (
                                <div className="flex justify-between text-xs">
                                  <span className={theme.muted}>Overall Velocity:</span>
                                  <span className="font-medium text-amber-300">{analysis.overallVelocity}</span>
                                </div>
                              )}
                              {analysis.velocityScore !== undefined && (
                                <div className="flex justify-between text-xs">
                                  <span className={theme.muted}>Velocity Score:</span>
                                  <span className={`font-medium ${getMetricColor(analysis.velocityScore)}`}>
                                    {analysis.velocityScore}/100
                                  </span>
                                </div>
                              )}
                              {analysis.accelerationZones && analysis.accelerationZones.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium mb-1 text-emerald-300">Acceleration Zones:</p>
                                  <div className="space-y-1">
                                    {analysis.accelerationZones.map((zone: any, i: number) => (
                                      <div key={i} className={`text-xs p-2 rounded ${theme.sectionBg}`}>
                                        <p className="font-medium">{zone.nodes.join(', ')}</p>
                                        <p className={theme.muted}>{zone.velocityChange} • {zone.triggerEvent}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {analysis.analysisType === 'coherence-assessment' && (
                            <div className="space-y-2 mt-3">
                              {analysis.overallCoherence && (
                                <div className="flex justify-between text-xs">
                                  <span className={theme.muted}>Overall Coherence:</span>
                                  <span className="font-medium text-rose-300">{analysis.overallCoherence}</span>
                                </div>
                              )}
                              {analysis.coherenceScore !== undefined && (
                                <div className="flex justify-between text-xs">
                                  <span className={theme.muted}>Coherence Score:</span>
                                  <span className={`font-medium ${getMetricColor(analysis.coherenceScore)}`}>
                                    {analysis.coherenceScore}/100
                                  </span>
                                </div>
                              )}
                              {analysis.thematicClusters && analysis.thematicClusters.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium mb-1">Thematic Clusters:</p>
                                  <div className="space-y-1">
                                    {analysis.thematicClusters.map((cluster: any, i: number) => (
                                      <div key={i} className={`text-xs p-2 rounded ${theme.sectionBg}`}>
                                        <span className="font-medium text-rose-300">{cluster.theme}</span>
                                        <span className={theme.muted}> → {cluster.nodes.length} nodes (cohesion: {cluster.cohesion})</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Key Insights */}
                          {analysis.keyInsights && analysis.keyInsights.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-700/30">
                              <p className="text-xs font-medium mb-2">Key Insights:</p>
                              <ul className="space-y-1">
                                {analysis.keyInsights.map((insight: string, i: number) => (
                                  <li key={i} className="text-xs text-gray-300 flex gap-2">
                                    <span className="text-gray-500">•</span>
                                    <span>{insight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Recommended Actions */}
                          {analysis.recommendedActions && analysis.recommendedActions.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-700/30">
                              <p className="text-xs font-medium mb-2 flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                                Recommended Actions:
                              </p>
                              <ul className="space-y-1">
                                {analysis.recommendedActions.map((action: string, i: number) => (
                                  <li key={i} className="text-xs text-indigo-300 flex gap-2">
                                    <span className="text-indigo-500">→</span>
                                    <span>{action}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
