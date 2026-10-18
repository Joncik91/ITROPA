/**
 * Cross-pollination: combine two industries into hybrids, then add the ones you like to a tree.
 */

import { useEffect, useState } from "react";
import { Sparkles, Shuffle, Check, RefreshCw, RotateCcw, Plus, AlertTriangle } from "lucide-react";
import type { CrossPollinateState, IndustryExpression, Need } from "../../types";
import { Badge, Button, Field, Hint, Select, cx, type Tone } from "../ui";
import { asArray } from "./parts";

export interface CrossPollinateModalContentProps {
  crossPollinate: CrossPollinateState;
  crossLoading: boolean;
  onExecute: () => void;
  onRegenerate: () => void;
  onReset: () => void;
  needs: Need[];
  activeNeedId: string | null;
  /** Returns true when the result was added. */
  onAddToNeed: (result: IndustryExpression, needId: string) => boolean;
}

const synergyTone = (score: number): Tone => (score >= 85 ? "ok" : score >= 70 ? "neutral" : "warn");

export const CrossPollinateModalContent = ({
  crossPollinate,
  crossLoading,
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

  const needOptions = needs.map((n) => ({ value: n.id, label: n.name }));

  return (
    <div className="space-y-5">
      <p className="text-sm text-ink-2">
        Takes the mechanisms behind two industries and asks the AI for hybrids that neither could be alone.
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className={cx(
              "p-3 rounded-card border",
              items[i] ? "border-pollen/50 bg-pollen/10" : "border-dashed border-line",
            )}
          >
            <p className="text-xs text-ink-2 mb-0.5">Parent {i + 1}</p>
            {items[i] ? (
              <>
                <p className="font-semibold">{items[i].name}</p>
                {items[i].mutation && <p className="text-sm text-ink-2 line-clamp-3">{items[i].mutation}</p>}
              </>
            ) : (
              <p className="text-sm text-ink-2">
                Not chosen yet. Close this, then use Cross-pollinate on an industry card, or drag one card onto another.
              </p>
            )}
          </div>
        ))}
      </div>

      {items.length === 2 && !result && (
        <div className="space-y-2">
          <Button variant="pollen" block loading={crossLoading} icon={<Shuffle className="w-4 h-4" />} onClick={onExecute} data-autofocus>
            {crossLoading ? "Generating hybrids…" : "Generate hybrids"}
          </Button>
          <Hint>Uses AI and takes 10–30 seconds. Results are saved, so this pair opens instantly next time.</Hint>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold">{result.length} hybrids</h3>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={onRegenerate} disabled={crossLoading} icon={<RefreshCw className={cx("w-4 h-4", crossLoading && "animate-spin")} />} title="Ask the AI for a fresh set for this pair. Uses AI.">
                New set
              </Button>
              <Button size="sm" variant="ghost" onClick={onReset} icon={<RotateCcw className="w-4 h-4" />} title="Clear both parents and choose a new pair.">
                New pair
              </Button>
            </div>
          </div>

          {result.map((r, i) => {
            const target = targets[i] ?? defaultTarget;
            const addedTo = added[`${i}:${target}`];
            const challenges = asArray<string>(r.challenges);
            const inspirations = asArray<{ source: string; mechanism?: string; twist?: string }>(r.inspirations);
            return (
              <article key={`${r.name}-${i}`} className="p-4 rounded-card border border-line bg-sheet space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-pollen shrink-0" aria-hidden />
                    {r.name}
                  </h4>
                  {typeof r.synergyScore === "number" && (
                    <Badge tone={synergyTone(r.synergyScore)} title="How strongly the two parents reinforce each other, out of 100">
                      {r.synergyScore} synergy
                    </Badge>
                  )}
                </div>

                {(r.combinationType || typeof r.noveltyFactor === "number") && (
                  <p className="text-sm text-ink-2">
                    {r.combinationType && <>Strategy: <span className="text-ink">{r.combinationType}</span></>}
                    {r.combinationType && typeof r.noveltyFactor === "number" && ". "}
                    {typeof r.noveltyFactor === "number" && <>Novelty: <span className="text-ink">{r.noveltyFactor}/100</span></>}
                  </p>
                )}

                {r.mutation && <p className="text-sm text-ink-2">{r.mutation}</p>}
                {r.insight && <p className="text-sm">{r.insight}</p>}

                {r.marketFit && (
                  <p className="text-sm p-3 rounded-control bg-well">
                    <span className="font-medium">Market fit: </span>
                    {r.marketFit}
                  </p>
                )}

                {challenges.length > 0 && (
                  <ul className="space-y-1.5">
                    {challenges.map((c, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-ink-2">
                        <AlertTriangle className="w-4 h-4 text-warn shrink-0 mt-0.5" aria-hidden />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {inspirations.length > 0 && (
                  <div className="pt-3 border-t border-line space-y-1">
                    <p className="text-sm font-medium">What it borrows</p>
                    {inspirations.map((ins, j) => (
                      <p key={j} className="text-sm">
                        <span className="text-accent">{ins.source}</span>
                        <span className="text-ink-2">: {ins.twist || ins.mechanism}</span>
                      </p>
                    ))}
                  </div>
                )}

                {needs.length > 0 ? (
                  <div className="pt-1 space-y-2">
                    <Field label="Add to" hint="Where the hybrid is added as a new prediction, in that need's future era.">
                      <Select value={target} options={needOptions} onChange={(v) => setTargets((p) => ({ ...p, [i]: v }))} />
                    </Field>
                    <Button
                      variant={addedTo ? "secondary" : "primary"}
                      block
                      disabled={!target || !!addedTo}
                      icon={addedTo ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      onClick={() => {
                        if (target && onAddToNeed(r, target)) setAdded((p) => ({ ...p, [`${i}:${target}`]: target }));
                      }}
                    >
                      {addedTo ? "Added to tree" : "Add to tree"}
                    </Button>
                  </div>
                ) : (
                  <Hint>Open a need first to add this hybrid to its tree.</Hint>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
