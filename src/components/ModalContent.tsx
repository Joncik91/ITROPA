import { Sparkles, Loader2, Shuffle } from "lucide-react";
import type { FormData, CrossPollinateState, AIActionSuggestion } from "../types";
import { KEYBOARD_SHORTCUTS } from "../config/constants";
import { AIAssistant, AIAssistButton } from "./AIAssistant";

interface MechanismModalContentProps {
  mechanism: any;
  theme: any;
  dark: boolean;
  aiSuggestions?: { suggestions: AIActionSuggestion[]; reasoning: string } | null;
  onAIAssist?: () => void;
  aiLoading?: boolean;
  onExecuteAction?: (suggestion: AIActionSuggestion) => Promise<void>;
}

export const MechanismModalContent = ({ mechanism, theme, dark, aiSuggestions, onAIAssist, aiLoading, onExecuteAction }: MechanismModalContentProps) => {
  // mechanism.details is now an array of MechanismDetails
  const analyses = Array.isArray(mechanism.details) ? mechanism.details : [mechanism.details];
  
  const getAnalysisTypeLabel = (type?: string) => {
    const labels: Record<string, string> = {
      functional: 'Functional Decomposition',
      structural: 'Structural Analysis',
      causal: 'Causal Chain Mapping',
      'constraint-opportunity': 'Constraint-Opportunity',
      'scale-context': 'Scale-Context Transfer'
    };
    return type ? labels[type] || type : 'General Analysis';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return dark ? 'text-green-400' : 'text-green-600';
    if (score >= 60) return dark ? 'text-yellow-400' : 'text-yellow-600';
    return dark ? 'text-orange-400' : 'text-orange-600';
  };

  const getRatingBadge = (rating?: string) => {
    const colors: Record<string, string> = {
      high: dark ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-100 text-green-700 border-green-300',
      medium: dark ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: dark ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-gray-100 text-gray-700 border-gray-300',
      broad: dark ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-100 text-blue-700 border-blue-300',
      moderate: dark ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-indigo-100 text-indigo-700 border-indigo-300',
      narrow: dark ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-purple-100 text-purple-700 border-purple-300'
    };
    const color = rating ? colors[rating] : colors.medium;
    return `px-2 py-0.5 rounded-full text-xs border ${color}`;
  };

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
      {analyses.map((analysis, idx) => (
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
          <div className={`p-3 rounded-lg ${dark ? "bg-indigo-500/10 border-indigo-500/30" : "bg-indigo-50 border-indigo-200"} border`}>
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
              {analysis.keyPrinciples.map((p, i) => (
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
              {analysis.structuralElements.map((e, i) => (
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
                    {analysis.causalChain.sequence.map((step, i) => (
                      <li key={i} className="text-xs">{step}</li>
                    ))}
                  </ol>
                </div>
                <div><span className="font-medium">Outcome:</span> {analysis.causalChain.outcome}</div>
                {analysis.causalChain.interventionPoints.length > 0 && (
                  <div>
                    <span className="font-medium">Intervention Points:</span>
                    <ul className="list-disc list-inside ml-2 mt-1">
                      {analysis.causalChain.interventionPoints.map((point, i) => (
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
              {analysis.constraintOpportunities.map((co, i) => (
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
                      {analysis.scaleContextInsights.contextVariations.map((v, i) => (
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
              {analysis.historicalApplications.map((h, i) => (
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
              {analysis.untappedDomains.map((u, i) => (
                <div key={i} className={`mb-2 p-3 rounded-lg border ${dark ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'}`}>
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
                {analysis.combinationPotential.map((combo, i) => (
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

interface DeepDiveModalContentProps {
  deepDive: any;
  theme: any;
  aiSuggestions?: { suggestions: AIActionSuggestion[]; reasoning: string } | null;
  onAIAssist?: () => void;
  aiLoading?: boolean;
  onExecuteAction?: (suggestion: AIActionSuggestion) => Promise<void>;
}

export const DeepDiveModalContent = ({ deepDive, theme, aiSuggestions, onAIAssist, aiLoading, onExecuteAction }: DeepDiveModalContentProps) => (
  <div className="space-y-4 text-sm">
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
    <div className={`p-3 rounded-lg ${theme.itemBg}`}>
      <p className={`text-xs ${theme.muted} mb-1`}>Market Opportunity</p>
      <p>{deepDive.details?.marketOpportunity}</p>
    </div>
    
    {deepDive.details?.keyEnablers && deepDive.details.keyEnablers.length > 0 && (
      <div>
        <p className={`text-xs font-medium ${theme.muted} mb-2`}>Key Enablers</p>
        {deepDive.details.keyEnablers.map((e: string, i: number) => (
          <div key={i} className={`mb-1 p-2 rounded ${theme.itemBgAlt} text-xs`}>{e}</div>
        ))}
      </div>
    )}
    
    {deepDive.details?.challenges && deepDive.details.challenges.length > 0 && (
      <div>
        <p className={`text-xs font-medium ${theme.muted} mb-2`}>Challenges & Solutions</p>
        {deepDive.details.challenges.map((c: any, i: number) => (
          <div key={i} className={`mb-2 p-2 rounded ${theme.itemBgAlt}`}>
            <p className="font-medium text-xs">{c.challenge}</p>
            <p className={`text-xs ${theme.muted} mt-1`}>→ {c.potentialSolution}</p>
          </div>
        ))}
      </div>
    )}
    
    {deepDive.details?.timeline && (
      <div className={`p-3 rounded-lg ${theme.itemBg}`}>
        <p className={`text-xs font-medium ${theme.muted} mb-1`}>Timeline to Market</p>
        <p className="text-xs">{deepDive.details.timeline}</p>
      </div>
    )}
    
    {deepDive.details?.firstMoverAdvantage && (
      <div className={`p-3 rounded-lg ${theme.itemBg}`}>
        <p className={`text-xs font-medium ${theme.muted} mb-1`}>First Mover Strategy</p>
        <p className="text-xs">{deepDive.details.firstMoverAdvantage}</p>
      </div>
    )}
    
    {deepDive.details?.priorArtLeverage && (
      <div className={`p-3 rounded-lg ${theme.itemBg}`}>
        <p className={`text-xs font-medium ${theme.muted} mb-1`}>Prior Art Advantage</p>
        <p className="text-xs">{deepDive.details.priorArtLeverage}</p>
      </div>
    )}
    
    {deepDive.details?.keyPlayers && deepDive.details.keyPlayers.length > 0 && (
      <div>
        <p className={`text-xs font-medium ${theme.muted} mb-2`}>Potential Key Players</p>
        <div className="flex flex-wrap gap-2">
          {deepDive.details.keyPlayers.map((player: string, i: number) => (
            <span key={i} className={`text-xs px-2 py-1 rounded-lg ${theme.itemBgAlt}`}>
              {player}
            </span>
          ))}
        </div>
      </div>
    )}
    
    {deepDive.details?.risks && deepDive.details.risks.length > 0 && (
      <div>
        <p className={`text-xs font-medium ${theme.muted} mb-2`}>Risk Factors</p>
        <div className="space-y-1">
          {deepDive.details.risks.map((risk: string, i: number) => (
            <div key={i} className={`text-xs p-2 rounded ${theme.itemBgAlt} flex items-start gap-2`}>
              <span className="text-red-400">⚠</span>
              <span className="flex-1">{risk}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

interface CrossPollinateModalContentProps {
  crossPollinate: CrossPollinateState;
  crossLoading: boolean;
  theme: any;
  onExecute: () => void;
  needs: any[];
  onAddToNeed: (result: any, needId: string) => void;
}

export const CrossPollinateModalContent = ({ 
  crossPollinate, 
  crossLoading, 
  theme, 
  onExecute,
  needs,
  onAddToNeed
}: CrossPollinateModalContentProps) => (
  <>
    <p className={`text-sm ${theme.muted} mb-4`}>Combine mechanisms from two industries to generate novel recombinations.</p>
    
    <div className="grid grid-cols-2 gap-4 mb-4">
      {[0, 1].map(i => (
        <div key={i} className={`p-3 rounded-lg border ${crossPollinate.items[i] ? "border-amber-500/50 bg-amber-500/10" : theme.borderDashed}`}>
          {crossPollinate.items[i] ? (
            <div>
              <p className="font-medium text-sm">{crossPollinate.items[i].name}</p>
              <p className={`text-xs ${theme.muted}`}>{crossPollinate.items[i].mutation}</p>
            </div>
          ) : (
            <p className={`text-sm ${theme.muted}`}>Select industry {i + 1}...</p>
          )}
        </div>
      ))}
    </div>

    {crossPollinate.items.length === 2 && !crossPollinate.result && (
      <button 
        onClick={onExecute} 
        disabled={crossLoading} 
        className="w-full py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {crossLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shuffle className="w-4 h-4" />}
        Generate Recombinations
      </button>
    )}

    {crossPollinate.result && (
      <div className="mt-4 space-y-3">
        <p className={`text-sm font-medium ${theme.muted}`}>Novel Recombinations ({crossPollinate.result.length} strategies):</p>
        {crossPollinate.result.map((r, i) => (
          <div key={i} className={`p-3 rounded-lg ${theme.itemBg} border ${theme.border}`}>
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium flex items-center gap-2">
                <Sparkles className={`w-3.5 h-3.5 ${theme.accent}`} />
                {r.name}
              </p>
              {r.synergyScore && (
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                  r.synergyScore >= 85 ? 'bg-green-500/20 text-green-400' : 
                  r.synergyScore >= 70 ? 'bg-blue-500/20 text-blue-400' : 
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  <span className="font-mono">{r.synergyScore}</span>
                  <span className="text-xs opacity-70">synergy</span>
                </div>
              )}
            </div>
            
            {r.combinationType && (
              <div className={`mt-1 text-xs ${theme.muted} flex items-center gap-1`}>
                <span className="opacity-60">Strategy:</span>
                <span className={theme.accent}>{r.combinationType}</span>
                {r.noveltyFactor && (
                  <span className="ml-2 opacity-60">• Novelty: <span className={theme.accent}>{r.noveltyFactor}/100</span></span>
                )}
              </div>
            )}
            
            <p className={`text-xs ${theme.muted} mt-1`}>{r.mutation}</p>
            <p className="text-sm mt-2">{r.insight}</p>
            
            {r.marketFit && (
              <div className={`mt-2 p-2 rounded ${theme.itemBgAlt} text-xs`}>
                <span className={`font-medium ${theme.accent}`}>Market Fit:</span> {r.marketFit}
              </div>
            )}
            
            {r.challenges && r.challenges.length > 0 && (
              <div className={`mt-2 space-y-1`}>
                <p className={`text-xs font-medium ${theme.muted}`}>Challenges:</p>
                {r.challenges.map((challenge, idx) => (
                  <div key={idx} className={`text-xs ${theme.muted} flex items-start gap-1`}>
                    <span className="text-amber-400 mt-0.5">⚠</span>
                    <span>{challenge}</span>
                  </div>
                ))}
              </div>
            )}
            
            {r.inspirations && (
              <div className={`mt-2 pt-2 border-t ${theme.border} text-xs space-y-1`}>
                <p className={`font-medium ${theme.muted} mb-1`}>Combination Elements:</p>
                {r.inspirations.map((ins, j) => (
                  <div key={j} className="flex items-start gap-1">
                    <span className={theme.accent}>{ins.source}</span>
                    <span className="opacity-60">→</span>
                    <span className="flex-1">{ins.twist || ins.mechanism}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 flex items-center gap-2">
              <select 
                className={`flex-1 px-2 py-1.5 rounded text-xs ${theme.inputBg} border`}
                id={`need-select-${i}`}
              >
                <option value="">Select need to add to...</option>
                {needs.map(n => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  const select = document.getElementById(`need-select-${i}`) as HTMLSelectElement;
                  const needId = select.value;
                  if (needId) {
                    onAddToNeed(r, needId);
                  }
                }}
                className="px-3 py-1.5 rounded text-xs bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
              >
                Add to Tree
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </>
);

interface AddPredictionModalContentProps {
  formData: FormData;
  theme: any;
  isSubBranch: boolean;
  onFormChange: (updates: Partial<FormData>) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export const AddPredictionModalContent = ({
  formData,
  theme,
  isSubBranch,
  onFormChange,
  onCancel,
  onSubmit
}: AddPredictionModalContentProps) => (
  <>
    <p className={`text-xs ${theme.muted} mb-4`}>
      {isSubBranch ? "Adding as sub-branch" : "Adding as root prediction"}
    </p>
    <div className="space-y-3">
      <input 
        value={formData.name} 
        onChange={e => onFormChange({ name: e.target.value })} 
        placeholder="Industry name" 
        className={`w-full px-3 py-2 rounded-lg ${theme.inputBg} border text-sm focus:outline-none focus:border-indigo-500`} 
      />
      <input 
        value={formData.mutation} 
        onChange={e => onFormChange({ mutation: e.target.value })} 
        placeholder="Mutation (enabling shift)" 
        className={`w-full px-3 py-2 rounded-lg ${theme.inputBg} border text-sm focus:outline-none focus:border-indigo-500`} 
      />
      <textarea 
        value={formData.insight} 
        onChange={e => onFormChange({ insight: e.target.value })} 
        placeholder="Insight..." 
        rows={2} 
        className={`w-full px-3 py-2 rounded-lg ${theme.inputBg} border text-sm focus:outline-none focus:border-indigo-500 resize-none`} 
      />
    </div>
    <div className="flex gap-3 mt-5">
      <button 
        onClick={onCancel} 
        className={`flex-1 px-4 py-2 rounded-lg border ${theme.border} ${theme.muted} text-sm`}
      >
        Cancel
      </button>
      <button 
        onClick={onSubmit} 
        disabled={!formData.name.trim()} 
        className="flex-1 px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm disabled:opacity-50"
      >
        Add
      </button>
    </div>
  </>
);

interface KeyboardShortcutsModalContentProps {
  theme: any;
}

export const KeyboardShortcutsModalContent = ({ theme }: KeyboardShortcutsModalContentProps) => (
  <div className="space-y-2 text-sm">
    {KEYBOARD_SHORTCUTS.map(([k, d]) => (
      <div key={k} className="flex justify-between">
        <kbd className={`px-2 py-0.5 rounded ${theme.itemBg} text-xs`}>{k}</kbd>
        <span className={theme.muted}>{d}</span>
      </div>
    ))}
  </div>
);
