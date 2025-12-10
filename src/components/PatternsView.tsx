import { motion } from "framer-motion";
import { Loader2, Layers, ArrowRight, TrendingUp, Network, Target, Shuffle, BarChart3 } from "lucide-react";
import { usePatterns } from "../hooks/usePatterns";
import { createRatingBadgeGetter } from "../utils/badge-styles";
import { getFrameworkLabel } from "../config/analysis-frameworks";
import type { Theme } from "../config/theme";

interface PatternsViewProps {
  theme: Theme;
  dark: boolean;
  onLoadNeed: (need: any) => void;
}

export const PatternsView = ({ theme, dark, onLoadNeed }: PatternsViewProps) => {
  const { patterns, loading } = usePatterns();

  const getScoreColor = (score: number) => {
    if (score >= 80) return dark ? 'text-green-400' : 'text-green-600';
    if (score >= 60) return dark ? 'text-yellow-400' : 'text-yellow-600';
    return dark ? 'text-orange-400' : 'text-orange-600';
  };

  // Use shared badge utility
  const getRatingBadge = createRatingBadgeGetter(dark);

  const getFrameworkIcon = (type?: string) => {
    switch (type) {
      case 'frequency-distribution': return <BarChart3 className="w-4 h-4" />;
      case 'need-mapping': return <Target className="w-4 h-4" />;
      case 'evolution-trajectory': return <TrendingUp className="w-4 h-4" />;
      case 'combination-synergies': return <Network className="w-4 h-4" />;
      case 'transfer-potential': return <Shuffle className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  // getFrameworkLabel is now imported from config/analysis-frameworks

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className={`w-8 h-8 ${theme.accent} animate-spin`} />
      </div>
    );
  }

  if (patterns.length === 0) {
    return (
      <div className="text-center py-16">
        <Layers className={`w-12 h-12 ${theme.muted} mx-auto mb-4 opacity-50`} />
        <p className={`${theme.muted} mb-2`}>No patterns found</p>
        <p className={`text-xs ${theme.muted} max-w-md mx-auto`}>
          Extract mechanisms from industries (2+ instances) to see recurring patterns analyzed across different needs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">Pattern Intelligence</h2>
        <p className={`text-sm ${theme.muted}`}>
          AI-powered analysis of {patterns.length} patterns discovered across {patterns.reduce((sum, p) => sum + p.mechanisms.length, 0)} industries
        </p>
      </div>

      <div className="space-y-8">
        {patterns.map((patternGroup, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`rounded-xl ${theme.card} border ${theme.border} overflow-hidden`}
          >
            {/* Pattern Header */}
            <div className={`p-4 ${dark ? "bg-gray-500/5" : "bg-gray-50/50"} border-b ${theme.border}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className={`w-5 h-5 ${theme.accent}`} />
                    <h3 className="font-bold">Pattern: {patternGroup.pattern}</h3>
                  </div>
                  {patternGroup.analyses?.[0]?.abstractDescription && (
                    <p className={`text-sm ${theme.muted} mb-2`}>{patternGroup.analyses[0].abstractDescription}</p>
                  )}
                </div>
                <div className={`px-3 py-1 rounded-full ${dark ? "bg-gray-500/20 text-gray-300" : "bg-gray-100 text-gray-700"} text-xs font-medium`}>
                  {patternGroup.mechanisms.length} instances
                </div>
              </div>

              {/* Overall Metadata (from first analysis) */}
              {patternGroup.analyses && patternGroup.analyses.length > 0 && patternGroup.analyses[0].strengthScore !== undefined && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {patternGroup.analyses[0].strengthScore !== undefined && (
                    <div className={`p-2 rounded ${theme.itemBgAlt}`}>
                      <p className={`text-xs ${theme.muted} mb-1`}>Strength</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${patternGroup.analyses[0].strengthScore >= 80 ? 'bg-green-500' : patternGroup.analyses[0].strengthScore >= 60 ? 'bg-yellow-500' : 'bg-orange-500'}`}
                            style={{ width: `${patternGroup.analyses[0].strengthScore}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${getScoreColor(patternGroup.analyses[0].strengthScore)}`}>
                          {patternGroup.analyses[0].strengthScore}
                        </span>
                      </div>
                    </div>
                  )}
                  {patternGroup.analyses[0].universalityScore !== undefined && (
                    <div className={`p-2 rounded ${theme.itemBgAlt}`}>
                      <p className={`text-xs ${theme.muted} mb-1`}>Universality</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${patternGroup.analyses[0].universalityScore >= 80 ? 'bg-green-500' : patternGroup.analyses[0].universalityScore >= 60 ? 'bg-yellow-500' : 'bg-orange-500'}`}
                            style={{ width: `${patternGroup.analyses[0].universalityScore}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${getScoreColor(patternGroup.analyses[0].universalityScore)}`}>
                          {patternGroup.analyses[0].universalityScore}
                        </span>
                      </div>
                    </div>
                  )}
                  {patternGroup.analyses[0].maturityLevel !== undefined && (
                    <div className={`p-2 rounded ${theme.itemBgAlt}`}>
                      <p className={`text-xs ${theme.muted} mb-1`}>Maturity</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${patternGroup.analyses[0].maturityLevel >= 80 ? 'bg-green-500' : patternGroup.analyses[0].maturityLevel >= 60 ? 'bg-yellow-500' : 'bg-orange-500'}`}
                            style={{ width: `${patternGroup.analyses[0].maturityLevel}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${getScoreColor(patternGroup.analyses[0].maturityLevel)}`}>
                          {patternGroup.analyses[0].maturityLevel}
                        </span>
                      </div>
                    </div>
                  )}
                  {patternGroup.analyses[0].adoptionRate !== undefined && (
                    <div className={`p-2 rounded ${theme.itemBgAlt}`}>
                      <p className={`text-xs ${theme.muted} mb-1`}>Adoption Rate</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${patternGroup.analyses[0].adoptionRate >= 80 ? 'bg-green-500' : patternGroup.analyses[0].adoptionRate >= 60 ? 'bg-yellow-500' : 'bg-orange-500'}`}
                            style={{ width: `${patternGroup.analyses[0].adoptionRate}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${getScoreColor(patternGroup.analyses[0].adoptionRate)}`}>
                          {patternGroup.analyses[0].adoptionRate}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Categorical Ratings */}
              {patternGroup.analyses && patternGroup.analyses.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {patternGroup.analyses[0].needCoverage && (
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs ${theme.muted}`}>Coverage:</span>
                      <span className={getRatingBadge(patternGroup.analyses[0].needCoverage)}>{patternGroup.analyses[0].needCoverage}</span>
                    </div>
                  )}
                  {patternGroup.analyses[0].stabilityRating && (
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs ${theme.muted}`}>Stability:</span>
                      <span className={getRatingBadge(patternGroup.analyses[0].stabilityRating)}>{patternGroup.analyses[0].stabilityRating}</span>
                    </div>
                  )}
                  {patternGroup.analyses[0].combinationAffinity && (
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs ${theme.muted}`}>Combination:</span>
                      <span className={getRatingBadge(patternGroup.analyses[0].combinationAffinity)}>{patternGroup.analyses[0].combinationAffinity}</span>
                    </div>
                  )}
                  {patternGroup.analyses[0].transferReadiness && (
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs ${theme.muted}`}>Transfer:</span>
                      <span className={getRatingBadge(patternGroup.analyses[0].transferReadiness)}>{patternGroup.analyses[0].transferReadiness}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Framework Analyses */}
            {patternGroup.loading ? (
              <div className="p-8 flex items-center justify-center">
                <Loader2 className={`w-6 h-6 ${theme.accent} animate-spin mr-2`} />
                <span className={theme.muted}>Analyzing pattern...</span>
              </div>
            ) : patternGroup.analyses && patternGroup.analyses.length > 0 ? (
              <div className="p-4 space-y-4">
                {patternGroup.analyses.map((analysis, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border ${dark ? 'bg-gray-800/30 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    {/* Framework Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className={theme.accent}>
                        {getFrameworkIcon(analysis.analysisType)}
                      </div>
                      <h4 className="font-semibold text-sm">{getFrameworkLabel(analysis.analysisType)}</h4>
                    </div>

                    {/* Key Insight */}
                    {analysis.keyInsight && (
                      <div className={`mb-3 p-2 rounded ${theme.itemBgAlt}`}>
                        <p className="text-xs">{analysis.keyInsight}</p>
                      </div>
                    )}

                    {/* Framework-Specific Content */}
                    {analysis.distributionMap && (
                      <div className="space-y-2">
                        {analysis.distributionMap.hotZones && analysis.distributionMap.hotZones.length > 0 && (
                          <div>
                            <p className={`text-xs font-medium ${theme.muted} mb-1`}>Hot Zones (High Concentration):</p>
                            <div className="flex flex-wrap gap-1">
                              {analysis.distributionMap.hotZones.map((zone: string, i: number) => (
                                <span key={i} className={`px-2 py-0.5 rounded text-xs ${getRatingBadge('high')}`}>{zone}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {analysis.distributionMap.coldZones && analysis.distributionMap.coldZones.length > 0 && (
                          <div>
                            <p className={`text-xs font-medium ${theme.muted} mb-1`}>Cold Zones (Expansion Opportunities):</p>
                            <div className="flex flex-wrap gap-1">
                              {analysis.distributionMap.coldZones.map((zone: string, i: number) => (
                                <span key={i} className={`px-2 py-0.5 rounded text-xs ${theme.itemBgAlt}`}>{zone}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {analysis.needAdaptations && analysis.needAdaptations.length > 0 && (
                      <div className="space-y-2">
                        <p className={`text-xs font-medium ${theme.muted}`}>Need-Specific Adaptations:</p>
                        {analysis.needAdaptations.slice(0, 3).map((adapt: any, i: number) => (
                          <div key={i} className={`p-2 rounded ${theme.itemBgAlt}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-xs">{adapt.needName}</span>
                              <span className={getRatingBadge(adapt.effectiveness)}>{adapt.effectiveness}</span>
                            </div>
                            <p className="text-xs">{adapt.adaptation}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {analysis.evolutionStages && (
                      <div className="space-y-2">
                        <p className={`text-xs font-medium ${theme.muted}`}>Evolution:</p>
                        <div className={`p-2 rounded ${theme.itemBgAlt} space-y-1`}>
                          {analysis.evolutionStages.nextEvolution && (
                            <p className="text-xs"><span className="font-medium">Next Stage:</span> {analysis.evolutionStages.nextEvolution}</p>
                          )}
                          {analysis.evolutionStages.evolutionSpeed && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">Speed:</span>
                              <span className={getRatingBadge(analysis.evolutionStages.evolutionSpeed)}>{analysis.evolutionStages.evolutionSpeed}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {analysis.synergyPatterns && analysis.synergyPatterns.strongPairings && analysis.synergyPatterns.strongPairings.length > 0 && (
                      <div className="space-y-2">
                        <p className={`text-xs font-medium ${theme.muted}`}>Strong Pairings:</p>
                        {analysis.synergyPatterns.strongPairings.slice(0, 2).map((pair: any, i: number) => (
                          <div key={i} className={`p-2 rounded ${dark ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'} border`}>
                            <p className="text-xs"><span className="font-medium">{pair.pattern}</span> - {pair.synergyType}</p>
                            <p className="text-xs mt-1">{pair.benefit}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {analysis.transferTargets && analysis.transferTargets.length > 0 && (
                      <div className="space-y-2">
                        <p className={`text-xs font-medium ${theme.muted}`}>Transfer Opportunities:</p>
                        {analysis.transferTargets.slice(0, 2).map((target: any, i: number) => (
                          <div key={i} className={`p-2 rounded ${dark ? 'bg-gray-600/10 border-gray-600/30' : 'bg-gray-100 border-gray-300'} border`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-xs">{target.targetNeed} → {target.targetIndustry}</span>
                              <span className={getRatingBadge(target.expectedImpact)}>{target.expectedImpact} impact</span>
                            </div>
                            <p className="text-xs">{target.marketGap}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Strategic Implications */}
                    {analysis.strategicImplications && analysis.strategicImplications.length > 0 && (
                      <div className="mt-2">
                        <p className={`text-xs font-medium ${theme.muted} mb-1`}>Strategic Implications:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          {analysis.strategicImplications.map((impl: string, i: number) => (
                            <li key={i} className="text-xs">{impl}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}

            {/* Pattern Instances */}
            <div className={`p-4 border-t ${theme.border}`}>
              <p className={`text-xs font-medium ${theme.muted} mb-3`}>Found in {patternGroup.mechanisms.length} industries:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {patternGroup.mechanisms.map((mech, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded ${theme.itemBgAlt} ${theme.hover} cursor-pointer transition-all text-xs`}
                    onClick={() => onLoadNeed({ id: mech.needId, name: mech.needName })}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{mech.expressionName}</span>
                      {mech.needName && (
                        <>
                          <ArrowRight className={`w-3 h-3 ${theme.muted}`} />
                          <span className={theme.accent}>{mech.needName}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
