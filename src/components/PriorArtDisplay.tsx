import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Users, 
  Target, 
  TrendingUp, 
  Lightbulb, 
  Map,
  ChevronDown,
  ChevronUp,
  Loader2,
  BarChart3,
  AlertCircle
} from "lucide-react";
import { DBService } from "../services/db.service";
import type { PriorArt, PriorArtAnalysis } from "../types";
import type { Theme } from "../config/theme";

interface PriorArtDisplayProps {
  needName: string;
  priorArt: PriorArt;
  theme: Theme;
}

export const PriorArtDisplay = ({ needName, priorArt, theme }: PriorArtDisplayProps) => {
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

  const getMetricColor = (value: number) => {
    if (value >= 70) return "text-emerald-400";
    if (value >= 40) return "text-amber-400";
    return "text-rose-400";
  };

  const getRatingColor = (rating: string) => {
    const r = rating.toLowerCase();
    if (r.includes("high") || r === "disruptive" || r === "oligopolistic") return "bg-rose-500/20 text-rose-300 border-rose-500/30";
    if (r.includes("medium") || r === "moderate" || r === "emerging") return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className={`mb-4 p-6 rounded-lg ${theme.sectionBg} border flex items-center justify-center gap-2`}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading prior art analysis...</span>
      </motion.div>
    );
  }

  if (analyses.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className={`mb-4 p-4 rounded-lg ${theme.sectionBg} border`}
      >
        <h3 className={`text-sm font-medium mb-3 flex items-center gap-2`}>
          <BookOpen className={`w-4 h-4 ${theme.accent}`} />
          Prior Art Research
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <p className={`font-medium ${theme.muted} mb-2`}>Current Leaders</p>
            {priorArt.currentLeaders?.map((c: any, i: number) => (
              <div key={i} className={`mb-2 p-2 rounded ${theme.itemBg}`}>
                <p className="font-medium">{c.name} <span className={theme.muted}>({c.domain})</span></p>
                <p className={theme.muted}>Mechanism: {c.mechanism}</p>
                <p className="text-amber-400/80">Limitation: {c.limitation}</p>
              </div>
            ))}
          </div>
          <div>
            <p className={`font-medium ${theme.muted} mb-2`}>Historical Precedents</p>
            {priorArt.historicalPrecedents?.map((h: any, i: number) => (
              <div key={i} className={`mb-2 p-2 rounded ${theme.itemBg}`}>
                <p className="font-medium">{h.name} <span className={theme.muted}>({h.era})</span></p>
                <p className={theme.muted}>Mechanism: {h.mechanism}</p>
                <p className="text-emerald-400/80">Lesson: {h.lesson}</p>
              </div>
            ))}
          </div>
          <div>
            <p className={`font-medium ${theme.muted} mb-2`}>Adjacent Domains</p>
            {priorArt.adjacentDomains?.map((a: any, i: number) => (
              <div key={i} className={`mb-2 p-2 rounded ${theme.itemBg}`}>
                <p className="font-medium">{a.name} <span className={theme.muted}>({a.originalDomain})</span></p>
                <p className={theme.muted}>Mechanism: {a.mechanism}</p>
                <p className="text-gray-400/80">Transfer: {a.transferPotential}</p>
              </div>
            ))}
          </div>
          <div>
            <p className={`font-medium ${theme.muted} mb-2`}>Nature's Solutions</p>
            {priorArt.natureSolutions?.map((n: any, i: number) => (
              <div key={i} className={`mb-2 p-2 rounded ${theme.itemBg}`}>
                <p className="font-medium">{n.name}</p>
                <p className={theme.muted}>Mechanism: {n.mechanism}</p>
                <p className="text-gray-400/80">Biomimicry: {n.biomimicryPotential}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  // Get aggregate metrics from all analyses
  const avgMetrics = {
    competitiveIntensity: Math.round(analyses.reduce((s, a) => s + (a.competitiveIntensity || 0), 0) / analyses.length),
    marketMaturity: Math.round(analyses.reduce((s, a) => s + (a.marketMaturity || 0), 0) / analyses.length),
    innovationOpportunity: Math.round(analyses.reduce((s, a) => s + (a.innovationOpportunity || 0), 0) / analyses.length),
    whiteSpaceScore: Math.round(analyses.reduce((s, a) => s + (a.whiteSpaceScore || 0), 0) / analyses.length),
  };

  const mostCommonRatings = {
    entryBarrier: analyses[0]?.entryBarrier || "unknown",
    competitiveStructure: analyses[0]?.competitiveStructure || "unknown",
    innovationPace: analyses[0]?.innovationPace || "unknown",
    customerSatisfaction: analyses[0]?.customerSatisfaction || "unknown",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className={`mb-6 rounded-lg ${theme.sectionBg} border overflow-hidden`}
    >
      {/* Header with Key Metrics */}
      <div className="p-6 border-b border-gray-700/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className={`w-5 h-5 ${theme.accent}`} />
          Competitive Intelligence & Prior Art Analysis
          <span className={`ml-2 px-2 py-0.5 text-xs rounded ${theme.itemBg}`}>
            {analyses.length} Framework{analyses.length > 1 ? 's' : ''}
          </span>
        </h3>
        
        {/* Metric Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium">Competitive Intensity</span>
              <span className={`text-xs font-bold ${getMetricColor(avgMetrics.competitiveIntensity)}`}>
                {avgMetrics.competitiveIntensity}/100
              </span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  avgMetrics.competitiveIntensity >= 70 ? 'bg-rose-500' : 
                  avgMetrics.competitiveIntensity >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${avgMetrics.competitiveIntensity}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium">Market Maturity</span>
              <span className={`text-xs font-bold ${getMetricColor(avgMetrics.marketMaturity)}`}>
                {avgMetrics.marketMaturity}/100
              </span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  avgMetrics.marketMaturity >= 70 ? 'bg-gray-500' : 
                  avgMetrics.marketMaturity >= 40 ? 'bg-gray-500' : 'bg-gray-500'
                }`}
                style={{ width: `${avgMetrics.marketMaturity}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium">Innovation Opportunity</span>
              <span className={`text-xs font-bold ${getMetricColor(avgMetrics.innovationOpportunity)}`}>
                {avgMetrics.innovationOpportunity}/100
              </span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-gray-600 to-pink-500 transition-all"
                style={{ width: `${avgMetrics.innovationOpportunity}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium">White Space Score</span>
              <span className={`text-xs font-bold ${getMetricColor(avgMetrics.whiteSpaceScore)}`}>
                {avgMetrics.whiteSpaceScore}/100
              </span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-gray-600 transition-all"
                style={{ width: `${avgMetrics.whiteSpaceScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Categorical Ratings */}
        <div className="flex flex-wrap gap-2">
          <span className={`px-2 py-1 rounded text-xs border ${getRatingColor(mostCommonRatings.entryBarrier)}`}>
            Entry Barrier: {mostCommonRatings.entryBarrier}
          </span>
          <span className={`px-2 py-1 rounded text-xs border ${getRatingColor(mostCommonRatings.competitiveStructure)}`}>
            Structure: {mostCommonRatings.competitiveStructure}
          </span>
          <span className={`px-2 py-1 rounded text-xs border ${getRatingColor(mostCommonRatings.innovationPace)}`}>
            Innovation: {mostCommonRatings.innovationPace}
          </span>
          <span className={`px-2 py-1 rounded text-xs border ${getRatingColor(mostCommonRatings.customerSatisfaction)}`}>
            Satisfaction: {mostCommonRatings.customerSatisfaction}
          </span>
        </div>
      </div>

      {/* Framework Analyses */}
      <div className="p-6 space-y-4">
        {analyses.map((analysis, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-4 rounded-lg ${theme.itemBg} border border-gray-700/50`}
          >
            {/* Framework Header */}
            <div className="flex items-start gap-3 mb-3">
              {analysis.analysisType === 'competitive-landscape' && <Users className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />}
              {analysis.analysisType === 'gap-analysis' && <Target className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />}
              {analysis.analysisType === 'evolution-pattern' && <TrendingUp className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />}
              {analysis.analysisType === 'innovation-potential' && <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />}
              {analysis.analysisType === 'strategic-positioning' && <Map className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />}
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1">
                  {analysis.analysisType?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Analysis'}
                </h4>
                {analysis.summary && (
                  <p className={`text-xs ${theme.muted} leading-relaxed`}>{analysis.summary}</p>
                )}
              </div>
            </div>

            {/* Framework-Specific Content */}
            {analysis.analysisType === 'competitive-landscape' && (
              <div className="space-y-3 mt-3">
                {analysis.competitiveSegments && analysis.competitiveSegments.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-2 flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5" />
                      Market Segments ({analysis.competitiveSegments.length})
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {analysis.competitiveSegments.map((seg: any, i: number) => (
                        <div key={i} className={`p-2 rounded ${theme.sectionBg} text-xs`}>
                          <p className="font-medium">{seg.name}</p>
                          <p className={theme.muted}>Size: {seg.size} • Players: {seg.keyPlayers}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {analysis.leaderProfiles && analysis.leaderProfiles.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-2">Market Leaders</p>
                    <div className="space-y-2">
                      {analysis.leaderProfiles.map((leader: any, i: number) => (
                        <div key={i} className={`p-2 rounded ${theme.sectionBg} text-xs`}>
                          <p className="font-medium text-gray-300">{leader.company}</p>
                          <p className={theme.muted}>Strength: {leader.coreStrength}</p>
                          {leader.vulnerability && (
                            <p className="text-amber-300/80">Weakness: {leader.vulnerability}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {analysis.analysisType === 'gap-analysis' && (
              <div className="space-y-3 mt-3">
                {analysis.unmetNeeds && analysis.unmetNeeds.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-2 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                      Unmet Needs ({analysis.unmetNeeds.length})
                    </p>
                    <div className="space-y-2">
                      {analysis.unmetNeeds.map((need: any, i: number) => (
                        <div key={i} className={`p-2 rounded ${theme.sectionBg} text-xs`}>
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-medium">{need.description}</p>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              need.severity === 'critical' ? 'bg-rose-500/20 text-rose-300' :
                              need.severity === 'high' ? 'bg-amber-500/20 text-amber-300' :
                              'bg-gray-500/20 text-gray-300'
                            }`}>{need.severity}</span>
                          </div>
                          <p className={theme.muted}>Affected: {need.affectedSegment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {analysis.whiteSpaces && analysis.whiteSpaces.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-2 text-emerald-300">White Space Opportunities</p>
                    <div className="space-y-1.5">
                      {analysis.whiteSpaces.map((space: any, i: number) => (
                        <div key={i} className={`p-2 rounded ${theme.sectionBg} text-xs`}>
                          <p className="font-medium">{space.area}</p>
                          <p className={theme.muted}>Potential: {space.potential}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {analysis.analysisType === 'evolution-pattern' && (
              <div className="space-y-3 mt-3">
                {analysis.evolutionTimeline && analysis.evolutionTimeline.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-2">Evolution Timeline</p>
                    <div className="space-y-2">
                      {analysis.evolutionTimeline.map((stage: any, i: number) => (
                        <div key={i} className={`p-2 rounded ${theme.sectionBg} text-xs flex gap-3`}>
                          <span className="font-mono text-gray-300">{stage.period}</span>
                          <div className="flex-1">
                            <p className="font-medium">{stage.stage}</p>
                            <p className={theme.muted}>{stage.characteristics}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {analysis.futureStages && analysis.futureStages.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-2 text-gray-300">Future Predictions</p>
                    <div className="space-y-1.5">
                      {analysis.futureStages.map((stage: any, i: number) => (
                        <div key={i} className={`p-2 rounded ${theme.sectionBg} text-xs`}>
                          <p className="font-medium">{stage.stage} <span className={theme.muted}>({stage.timeframe})</span></p>
                          <p className={theme.muted}>{stage.prediction}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {analysis.analysisType === 'innovation-potential' && (
              <div className="space-y-3 mt-3">
                {analysis.innovationOpportunities && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {analysis.innovationOpportunities.incremental && analysis.innovationOpportunities.incremental.length > 0 && (
                      <div>
                        <p className="text-xs font-medium mb-2 text-gray-300">Incremental</p>
                        <div className="space-y-1.5">
                          {analysis.innovationOpportunities.incremental.map((opp: any, i: number) => (
                            <div key={i} className={`p-2 rounded ${theme.sectionBg} text-xs`}>
                              <p className="font-medium">{opp.opportunity}</p>
                              <p className={theme.muted}>Impact: {opp.impact}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {analysis.innovationOpportunities.adjacent && analysis.innovationOpportunities.adjacent.length > 0 && (
                      <div>
                        <p className="text-xs font-medium mb-2 text-amber-300">Adjacent</p>
                        <div className="space-y-1.5">
                          {analysis.innovationOpportunities.adjacent.map((opp: any, i: number) => (
                            <div key={i} className={`p-2 rounded ${theme.sectionBg} text-xs`}>
                              <p className="font-medium">{opp.opportunity}</p>
                              <p className={theme.muted}>Impact: {opp.impact}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {analysis.innovationOpportunities.breakthrough && analysis.innovationOpportunities.breakthrough.length > 0 && (
                      <div>
                        <p className="text-xs font-medium mb-2 text-gray-300">Breakthrough</p>
                        <div className="space-y-1.5">
                          {analysis.innovationOpportunities.breakthrough.map((opp: any, i: number) => (
                            <div key={i} className={`p-2 rounded ${theme.sectionBg} text-xs`}>
                              <p className="font-medium">{opp.opportunity}</p>
                              <p className={theme.muted}>Impact: {opp.impact}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {analysis.analysisType === 'strategic-positioning' && (
              <div className="space-y-3 mt-3">
                {analysis.positioningStrategies && analysis.positioningStrategies.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-2">Recommended Strategies</p>
                    <div className="space-y-2">
                      {analysis.positioningStrategies.map((strategy: any, i: number) => (
                        <div key={i} className={`p-2 rounded ${theme.sectionBg} text-xs`}>
                          <p className="font-medium text-rose-300">{strategy.strategy}</p>
                          <p className={theme.muted}>Rationale: {strategy.rationale}</p>
                          {strategy.requirements && (
                            <p className="text-amber-300/80 mt-1">Requires: {strategy.requirements}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {analysis.differentiationPillars && analysis.differentiationPillars.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-2">Differentiation Pillars</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.differentiationPillars.map((pillar: string, i: number) => (
                        <span key={i} className="px-2 py-1 rounded bg-gray-500/20 text-gray-300 text-xs">
                          {pillar}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Key Insights */}
            {analysis.keyInsights && analysis.keyInsights.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-700/30">
                <p className="text-xs font-medium mb-2">Key Insights</p>
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
          </motion.div>
        ))}
      </div>

      {/* Toggle Raw Data */}
      <div className="border-t border-gray-700/50">
        <button
          onClick={() => setShowRawData(!showRawData)}
          className={`w-full p-3 flex items-center justify-center gap-2 text-xs ${theme.hover}`}
        >
          {showRawData ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showRawData ? 'Hide' : 'Show'} Original Prior Art Data
        </button>
        
        <AnimatePresence>
          {showRawData && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 border-t border-gray-700/50 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className={`font-medium ${theme.muted} mb-2`}>Current Leaders</p>
                  {priorArt.currentLeaders?.map((c: any, i: number) => (
                    <div key={i} className={`mb-2 p-2 rounded ${theme.itemBg}`}>
                      <p className="font-medium">{c.name} <span className={theme.muted}>({c.domain})</span></p>
                      <p className={theme.muted}>Mechanism: {c.mechanism}</p>
                      <p className="text-amber-400/80">Limitation: {c.limitation}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className={`font-medium ${theme.muted} mb-2`}>Historical Precedents</p>
                  {priorArt.historicalPrecedents?.map((h: any, i: number) => (
                    <div key={i} className={`mb-2 p-2 rounded ${theme.itemBg}`}>
                      <p className="font-medium">{h.name} <span className={theme.muted}>({h.era})</span></p>
                      <p className={theme.muted}>Mechanism: {h.mechanism}</p>
                      <p className="text-emerald-400/80">Lesson: {h.lesson}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className={`font-medium ${theme.muted} mb-2`}>Adjacent Domains</p>
                  {priorArt.adjacentDomains?.map((a: any, i: number) => (
                    <div key={i} className={`mb-2 p-2 rounded ${theme.itemBg}`}>
                      <p className="font-medium">{a.name} <span className={theme.muted}>({a.originalDomain})</span></p>
                      <p className={theme.muted}>Mechanism: {a.mechanism}</p>
                      <p className="text-gray-400/80">Transfer: {a.transferPotential}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className={`font-medium ${theme.muted} mb-2`}>Nature's Solutions</p>
                  {priorArt.natureSolutions?.map((n: any, i: number) => (
                    <div key={i} className={`mb-2 p-2 rounded ${theme.itemBg}`}>
                      <p className="font-medium">{n.name}</p>
                      <p className={theme.muted}>Mechanism: {n.mechanism}</p>
                      <p className="text-gray-400/80">Biomimicry: {n.biomimicryPotential}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
