/**
 * Modal content for displaying mechanism analysis results.
 * Shows multi-framework analysis with key principles, structural elements,
 * causal chains, and other mechanism details.
 */

import type { AIActionSuggestion } from "../../types";
import type { Theme } from "../../config/theme";
import { AIAssistant, AIAssistButton } from "../AIAssistant";
import { createRatingBadgeGetter } from "../../utils/badge-styles";
import { getFrameworkLabel } from "../../config/analysis-frameworks";

export interface MechanismModalContentProps {
  mechanism: any;
  theme: Theme;
  dark: boolean;
  aiSuggestions?: { suggestions: AIActionSuggestion[]; reasoning: string } | null;
  onAIAssist?: () => void;
  aiLoading?: boolean;
  onExecuteAction?: (suggestion: AIActionSuggestion) => Promise<void>;
}

export const MechanismModalContent = ({
  mechanism,
  theme,
  dark,
  aiSuggestions,
  onAIAssist,
  aiLoading,
  onExecuteAction
}: MechanismModalContentProps) => {
  // Handle both formats:
  // 1. mechanism is the array directly (from extractMechanism or cache)
  // 2. mechanism.details is the array (legacy format)
  const rawAnalyses = Array.isArray(mechanism)
    ? mechanism
    : Array.isArray(mechanism?.details)
      ? mechanism.details
      : mechanism?.details
        ? [mechanism.details]
        : [];
  // Filter out undefined/null entries to prevent rendering errors
  const analyses = rawAnalyses.filter((a: any) => a != null);

  // Use shared framework labels from config
  const getAnalysisTypeLabel = (type?: string) => getFrameworkLabel(type);

  const getScoreColor = (score: number) => {
    if (score >= 80) return dark ? 'text-green-400' : 'text-green-600';
    if (score >= 60) return dark ? 'text-yellow-400' : 'text-yellow-600';
    return dark ? 'text-orange-400' : 'text-orange-600';
  };

  // Use shared badge utility
  const getRatingBadge = createRatingBadgeGetter(dark);

  return (
    <div className="space-y-6 text-sm">
      {/* AI Assistant */}
      {onAIAssist && (
        <div className="mb-4">
          <AIAssistButton onClick={onAIAssist} loading={!!aiLoading} theme={theme} />
        </div>
      )}
      {aiSuggestions && onExecuteAction && (
        <div className="mb-4">
          <AIAssistant
            suggestions={aiSuggestions.suggestions}
            reasoning={aiSuggestions.reasoning}
            theme={theme}
            onExecuteAction={onExecuteAction}
          />
        </div>
      )}

      {/* Display each mechanism analysis */}
      {analyses.length === 0 && (
        <div className={`p-4 rounded-lg border ${dark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <p className={theme.muted}>No mechanism analysis data available.</p>
        </div>
      )}
      {analyses.map((analysis: any, idx: number) => (
        <div key={idx} className={`space-y-4 p-4 rounded-lg border ${dark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          {/* Analysis Type Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-semibold ${theme.accent}`}>
              {getAnalysisTypeLabel(analysis.analysisType)}
            </h3>
            {analysis.analysisType && (
              <span className={getRatingBadge(analysis.analysisType)}>
                Framework {idx + 1}
              </span>
            )}
          </div>

          {/* Core Mechanism */}
          <div className={`p-3 rounded-lg ${dark ? "bg-gray-500/10 border-gray-500/30" : "bg-gray-50 border-gray-200"} border`}>
            <p className={`text-xs ${theme.muted} mb-1`}>Core Mechanism</p>
            <p className="font-medium">{analysis.coreMechanism}</p>
          </div>

          {/* Abstract Pattern */}
          <div className={`p-3 rounded-lg ${theme.itemBg}`}>
            <p className={`text-xs ${theme.muted} mb-1`}>Abstract Pattern</p>
            <p className={theme.accent}>{analysis.abstractPattern}</p>
          </div>

          {/* Metadata Scores */}
          {(analysis.transferPotential !== undefined || analysis.maturityScore !== undefined) && (
            <div className="grid grid-cols-2 gap-3">
              {analysis.transferPotential !== undefined && (
                <div className={`p-3 rounded-lg ${theme.itemBgAlt}`}>
                  <p className={`text-xs ${theme.muted} mb-1`}>Transfer Potential</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${analysis.transferPotential >= 80 ? 'bg-green-500' : analysis.transferPotential >= 60 ? 'bg-yellow-500' : 'bg-orange-500'}`}
                        style={{ width: `${analysis.transferPotential}%` }}
                      />
                    </div>
                    <span className={`font-semibold ${getScoreColor(analysis.transferPotential)}`}>
                      {analysis.transferPotential}
                    </span>
                  </div>
                </div>
              )}
              {analysis.maturityScore !== undefined && (
                <div className={`p-3 rounded-lg ${theme.itemBgAlt}`}>
                  <p className={`text-xs ${theme.muted} mb-1`}>Maturity Score</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${analysis.maturityScore >= 80 ? 'bg-green-500' : analysis.maturityScore >= 60 ? 'bg-yellow-500' : 'bg-orange-500'}`}
                        style={{ width: `${analysis.maturityScore}%` }}
                      />
                    </div>
                    <span className={`font-semibold ${getScoreColor(analysis.maturityScore)}`}>
                      {analysis.maturityScore}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Categorical Ratings */}
          {(analysis.abstractionLevel || analysis.complexityRating || analysis.universality || analysis.disruptionPotential) && (
            <div className="flex flex-wrap gap-2">
              {analysis.abstractionLevel && (
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs ${theme.muted}`}>Abstraction:</span>
                  <span className={getRatingBadge(analysis.abstractionLevel)}>{analysis.abstractionLevel}</span>
                </div>
              )}
              {analysis.complexityRating && (
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs ${theme.muted}`}>Complexity:</span>
                  <span className={getRatingBadge(analysis.complexityRating)}>{analysis.complexityRating}</span>
                </div>
              )}
              {analysis.universality && (
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs ${theme.muted}`}>Universality:</span>
                  <span className={getRatingBadge(analysis.universality)}>{analysis.universality}</span>
                </div>
              )}
              {analysis.disruptionPotential && (
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs ${theme.muted}`}>Disruption:</span>
                  <span className={getRatingBadge(analysis.disruptionPotential)}>{analysis.disruptionPotential}</span>
                </div>
              )}
            </div>
          )}

          {/* Framework-Specific Fields */}
          {analysis.keyPrinciples && analysis.keyPrinciples.length > 0 && (
            <div>
              <p className={`text-xs font-medium ${theme.muted} mb-2`}>Key Principles (Functional)</p>
              {analysis.keyPrinciples.map((p: any, i: number) => (
                <div key={i} className={`mb-2 p-2 rounded ${theme.itemBgAlt}`}>
                  <span className="font-medium">{p.principle}</span>
                  <p className="text-xs mt-1">{p.function}</p>
                  <p className={`text-xs mt-1 ${theme.muted}`}>Why critical: {p.criticality}</p>
                </div>
              ))}
            </div>
          )}

          {analysis.structuralElements && analysis.structuralElements.length > 0 && (
            <div>
              <p className={`text-xs font-medium ${theme.muted} mb-2`}>Structural Elements</p>
              {analysis.structuralElements.map((e: any, i: number) => (
                <div key={i} className={`mb-2 p-2 rounded ${theme.itemBgAlt}`}>
                  <span className="font-medium">{e.element}</span>
                  <p className="text-xs mt-1">Role: {e.role}</p>
                  <p className={`text-xs mt-1 ${theme.muted}`}>Interactions: {e.interactions}</p>
                </div>
              ))}
            </div>
          )}

          {analysis.causalChain && (
            <div>
              <p className={`text-xs font-medium ${theme.muted} mb-2`}>Causal Chain</p>
              <div className={`p-3 rounded-lg ${theme.itemBgAlt} space-y-2`}>
                <div><span className="font-medium">Trigger:</span> {analysis.causalChain.trigger}</div>
                <div>
                  <span className="font-medium">Sequence:</span>
                  <ol className="list-decimal list-inside ml-2 mt-1 space-y-1">
                    {analysis.causalChain.sequence.map((step: string, i: number) => (
                      <li key={i} className="text-xs">{step}</li>
                    ))}
                  </ol>
                </div>
                <div><span className="font-medium">Outcome:</span> {analysis.causalChain.outcome}</div>
                {analysis.causalChain.interventionPoints.length > 0 && (
                  <div>
                    <span className="font-medium">Intervention Points:</span>
                    <ul className="list-disc list-inside ml-2 mt-1">
                      {analysis.causalChain.interventionPoints.map((point: string, i: number) => (
                        <li key={i} className="text-xs">{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {analysis.constraintOpportunities && analysis.constraintOpportunities.length > 0 && (
            <div>
              <p className={`text-xs font-medium ${theme.muted} mb-2`}>Constraint-Opportunity Pairs</p>
              {analysis.constraintOpportunities.map((co: any, i: number) => (
                <div key={i} className={`mb-2 p-2 rounded ${theme.itemBgAlt}`}>
                  <div className="text-xs"><span className="font-medium">Constraint:</span> {co.constraint}</div>
                  <div className="text-xs mt-1"><span className="font-medium">Opportunity:</span> {co.opportunity}</div>
                  <div className={`text-xs mt-1 ${theme.muted}`}>Application: {co.application}</div>
                </div>
              ))}
            </div>
          )}

          {analysis.scaleContextInsights && (
            <div>
              <p className={`text-xs font-medium ${theme.muted} mb-2`}>Scale-Context Insights</p>
              <div className={`p-3 rounded-lg ${theme.itemBgAlt} space-y-2`}>
                <div><span className="font-medium">Micro Scale:</span> {analysis.scaleContextInsights.microScale}</div>
                <div><span className="font-medium">Meso Scale:</span> {analysis.scaleContextInsights.mesoScale}</div>
                <div><span className="font-medium">Macro Scale:</span> {analysis.scaleContextInsights.macroScale}</div>
                {analysis.scaleContextInsights.contextVariations.length > 0 && (
                  <div>
                    <span className="font-medium">Context Variations:</span>
                    <ul className="list-disc list-inside ml-2 mt-1">
                      {analysis.scaleContextInsights.contextVariations.map((v: string, i: number) => (
                        <li key={i} className="text-xs">{v}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Historical Applications */}
          {analysis.historicalApplications && analysis.historicalApplications.length > 0 && (
            <div>
              <p className={`text-xs font-medium ${theme.muted} mb-2`}>Historical Applications</p>
              {analysis.historicalApplications.map((h: any, i: number) => (
                <div key={i} className={`mb-2 p-2 rounded ${theme.itemBgAlt}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{h.domain}</span>
                    <span className={`text-xs ${theme.muted}`}>({h.era})</span>
                  </div>
                  <p className="text-xs mt-1">{h.example}</p>
                  {h.successFactors && <p className="text-xs mt-1"><span className="font-medium">Success:</span> {h.successFactors}</p>}
                  {h.limitations && <p className={`text-xs mt-1 ${theme.muted}`}><span className="font-medium">Limitations:</span> {h.limitations}</p>}
                  {h.evolutionPath && <p className="text-xs mt-1"><span className="font-medium">Evolution:</span> {h.evolutionPath}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Untapped Domains */}
          {analysis.untappedDomains && analysis.untappedDomains.length > 0 && (
            <div>
              <p className={`text-xs font-medium ${theme.muted} mb-2`}>Untapped Domains</p>
              {analysis.untappedDomains.map((u: any, i: number) => (
                <div key={i} className={`mb-2 p-3 rounded-lg border ${dark ? 'bg-gray-600/10 border-gray-600/30' : 'bg-gray-100 border-gray-300'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{u.domain}</span>
                    {u.impactPotential && (
                      <span className={getRatingBadge(u.impactPotential)}>
                        {u.impactPotential} impact
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-1"><span className="font-medium">Opportunity:</span> {u.opportunity}</p>
                  <p className="text-xs mt-1"><span className="font-medium">Novelty:</span> {u.novelty}</p>
                  {u.transferBarriers && <p className={`text-xs mt-1 ${theme.muted}`}><span className="font-medium">Barriers:</span> {u.transferBarriers}</p>}
                  {u.requiredAdaptations && <p className="text-xs mt-1"><span className="font-medium">Adaptations:</span> {u.requiredAdaptations}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Combination Potential */}
          {analysis.combinationPotential && analysis.combinationPotential.length > 0 && (
            <div>
              <p className={`text-xs font-medium ${theme.muted} mb-2`}>Combination Potential</p>
              <div className="flex flex-wrap gap-2">
                {analysis.combinationPotential.map((combo: string, i: number) => (
                  <span key={i} className={`px-2 py-1 rounded text-xs ${theme.itemBgAlt}`}>
                    {combo}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
