/**
 * Modal content for cross-pollination between two industries.
 * Allows selecting two industries and generating novel recombinations.
 */

import { Sparkles, Loader2, Shuffle } from "lucide-react";
import type { CrossPollinateState, Need } from "../../types";
import type { Theme } from "../../config/theme";

export interface CrossPollinateModalContentProps {
  crossPollinate: CrossPollinateState;
  crossLoading: boolean;
  theme: Theme;
  onExecute: () => void;
  needs: Need[];
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
                  r.synergyScore >= 70 ? 'bg-gray-500/20 text-gray-400' :
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
                className="px-3 py-1.5 rounded text-xs bg-gray-500 text-white hover:bg-gray-600 transition-colors"
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
