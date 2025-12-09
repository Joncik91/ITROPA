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

export const MechanismModalContent = ({ mechanism, theme, dark, aiSuggestions, onAIAssist, aiLoading, onExecuteAction }: MechanismModalContentProps) => (
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
    <div className={`p-3 rounded-lg ${dark ? "bg-indigo-500/10 border-indigo-500/30" : "bg-indigo-50 border-indigo-200"} border`}>
      <p className={`text-xs ${theme.muted} mb-1`}>Core Mechanism</p>
      <p className="font-medium">{mechanism.details?.coreMechanism}</p>
    </div>
    <div className={`p-3 rounded-lg ${theme.itemBg}`}>
      <p className={`text-xs ${theme.muted} mb-1`}>Abstract Pattern</p>
      <p className={theme.accent}>{mechanism.details?.abstractPattern}</p>
    </div>
    <div>
      <p className={`text-xs font-medium ${theme.muted} mb-2`}>Historical Applications</p>
      {mechanism.details?.historicalApplications?.map((h: any, i: number) => (
        <div key={i} className={`mb-2 p-2 rounded ${theme.itemBgAlt}`}>
          <span className="font-medium">{h.domain}</span> <span className={theme.muted}>({h.era})</span>
          <p className="text-xs mt-1">{h.implementation}</p>
        </div>
      ))}
    </div>
    <div>
      <p className={`text-xs font-medium ${theme.muted} mb-2`}>Future Applications</p>
      {mechanism.details?.futureApplications?.map((f: any, i: number) => (
        <div key={i} className={`mb-2 p-2 rounded ${theme.itemBgAlt}`}>
          <span className="font-medium">{f.domain}</span>
          <p className="text-xs mt-1">{f.potential}</p>
        </div>
      ))}
    </div>
  </div>
);

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
        <p className={`text-sm font-medium ${theme.muted}`}>Novel Recombinations:</p>
        {crossPollinate.result.map((r, i) => (
          <div key={i} className={`p-3 rounded-lg ${theme.itemBg} border ${theme.border}`}>
            <p className="font-medium flex items-center gap-2">
              <Sparkles className={`w-3.5 h-3.5 ${theme.accent}`} />
              {r.name}
            </p>
            <p className={`text-xs ${theme.muted} mt-1`}>{r.mutation}</p>
            <p className="text-sm mt-2">{r.insight}</p>
            {r.inspirations && (
              <div className={`mt-2 pt-2 border-t ${theme.border} text-xs`}>
                {r.inspirations.map((ins, j) => (
                  <div key={j}>
                    <span className={theme.accent}>{ins.source}</span> → {ins.twist}
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
