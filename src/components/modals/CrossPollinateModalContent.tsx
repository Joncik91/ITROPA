/**
 * Modal content for cross-pollination between two industries.
 * Allows selecting two industries and generating novel recombinations.
 */

import { useEffect, useState } from "react";
import { Sparkles, Loader2, Shuffle, Check, RefreshCw, RotateCcw } from "lucide-react";
import type { CrossPollinateState, IndustryExpression, Need } from "../../types";
import type { Theme } from "../../config/theme";

export interface CrossPollinateModalContentProps {
  crossPollinate: CrossPollinateState;
  crossLoading: boolean;
  theme: Theme;
  onExecute: () => void;
  onRegenerate: () => void;
  onReset: () => void;
  needs: Need[];
  activeNeedId: string | null;
  /** Returns true when the result was added. */
  onAddToNeed: (result: IndustryExpression, needId: string) => boolean;
}

const scoreClass = (score: number) =>
  score >= 85 ? 'bg-green-500/20 text-green-400' : score >= 70 ? 'bg-gray-500/20 text-gray-400' : 'bg-amber-500/20 text-amber-400';

export const CrossPollinateModalContent = ({
  crossPollinate,
  crossLoading,
  theme,
  onExecute,
  onRegenerate,
  onReset,
  needs,
  activeNeedId,
  onAddToNeed,
}: CrossPollinateModalContentProps) => {
  const { items, result } = crossPollinate;
  const defaultTarget = activeNeedId && needs.some((n) => n.id === activeNeedId) ? activeNeedId : needs[0]?.id ?? "";
  const [targets, setTargets] = useState<Record<number, string>>({});
  const [added, setAdded] = useState<Record<string, string>>({});

  // A new result set invalidates per-result selections.
  useEffect(() => {
    setTargets({});
    setAdded({});
  }, [result]);

  return (
    <>
      <p className={`text-sm ${theme.muted} mb-4`}>Combine mechanisms from two industries to generate novel recombinations.</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {[0, 1].map(i => (
          <div key={i} className={`p-3 rounded-lg border ${items[i] ? "border-amber-500/50 bg-amber-500/10" : theme.borderDashed}`}>
            {items[i] ? (
              <div>
                <p className="font-medium text-sm">{items[i].name}</p>
                <p className={`text-xs ${theme.muted} line-clamp-3`}>{items[i].mutation}</p>
              </div>
            ) : (
              <p className={`text-sm ${theme.muted}`}>Select industry {i + 1} with its "Cross" button, or drag one card onto another.</p>
            )}
          </div>
        ))}
      </div>

      {items.length === 2 && !result && (
        <button
          onClick={onExecute}
          disabled={crossLoading}
          className="w-full py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
          data-autofocus
        >
          {crossLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shuffle className="w-4 h-4" />}
          {crossLoading ? "Generating..." : "Generate Recombinations"}
        </button>
      )}

      {result && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className={`text-sm font-medium ${theme.muted}`}>Novel Recombinations ({result.length}):</p>
            <div className="flex gap-1">
              <button onClick={onRegenerate} disabled={crossLoading} className={`p-1.5 rounded ${theme.hover} disabled:opacity-40`} title="Generate a fresh set" aria-label="Regenerate recombinations">
                <RefreshCw className={`w-3.5 h-3.5 ${crossLoading ? "animate-spin" : ""}`} />
              </button>
              <button onClick={onReset} className={`p-1.5 rounded ${theme.hover}`} title="Start over with a new pair" aria-label="Clear selection">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {result.map((r, i) => {
            const target = targets[i] ?? defaultTarget;
            const addedTo = added[`${i}:${target}`];
            return (
              <div key={`${r.name}-${i}`} className={`p-3 rounded-lg ${theme.itemBg} border ${theme.border}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium flex items-center gap-2">
                    <Sparkles className={`w-3.5 h-3.5 ${theme.accent}`} />
                    {r.name}
                  </p>
                  {typeof r.synergyScore === "number" && (
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${scoreClass(r.synergyScore)}`}>
                      <span className="font-mono">{r.synergyScore}</span>
                      <span className="text-xs opacity-70">synergy</span>
                    </div>
                  )}
                </div>

                {r.combinationType && (
                  <div className={`mt-1 text-xs ${theme.muted} flex items-center gap-1`}>
                    <span className="opacity-60">Strategy:</span>
                    <span className={theme.accent}>{r.combinationType}</span>
                    {typeof r.noveltyFactor === "number" && (
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

                {Array.isArray(r.challenges) && r.challenges.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className={`text-xs font-medium ${theme.muted}`}>Challenges:</p>
                    {r.challenges.map((challenge, idx) => (
                      <div key={idx} className={`text-xs ${theme.muted} flex items-start gap-1`}>
                        <span className="text-amber-400 mt-0.5">⚠</span>
                        <span>{challenge}</span>
                      </div>
                    ))}
                  </div>
                )}

                {Array.isArray(r.inspirations) && r.inspirations.length > 0 && (
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

                {needs.length > 0 ? (
                  <div className="mt-3 flex items-center gap-2">
                    <select
                      value={target}
                      onChange={(e) => setTargets((p) => ({ ...p, [i]: e.target.value }))}
                      className={`flex-1 min-w-0 px-2 py-1.5 rounded text-xs ${theme.inputBg} border`}
                      aria-label={`Need to add "${r.name}" to`}
                    >
                      {needs.map(n => (
                        <option key={n.id} value={n.id}>{n.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        if (target && onAddToNeed(r, target)) setAdded((p) => ({ ...p, [`${i}:${target}`]: target }));
                      }}
                      disabled={!target || !!addedTo}
                      className="px-3 py-1.5 rounded text-xs bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-60 transition-colors flex items-center gap-1"
                    >
                      {addedTo ? <><Check className="w-3 h-3" />Added</> : "Add to Tree"}
                    </button>
                  </div>
                ) : (
                  <p className={`mt-3 text-xs ${theme.muted}`}>Open a need to add this result to its tree.</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
