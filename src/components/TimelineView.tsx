import { Shuffle } from "lucide-react";
import type { Need, IndustryExpression } from "../types";
import { isFutureEra } from "../utils/need-model";
import { Badge, cx } from "./ui";

interface TimelineViewProps {
  need: Need;
}

/** Eras in order on a stem; the future era shows each prediction with its lineage. */
export const TimelineView = ({ need }: TimelineViewProps) => (
  <ol className="relative">
    {need.eras.map((era, index) => {
      const isFuture = isFutureEra(era);
      const last = index === need.eras.length - 1;
      return (
        <li key={index} className="relative pl-10 pb-8 last:pb-0">
          {!last && <span aria-hidden className="absolute left-[13px] top-7 bottom-0 w-0.5 bg-line" />}
          <span
            aria-hidden
            className={cx(
              "absolute left-0 top-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-semibold",
              isFuture ? "border-pollen text-pollen bg-pollen/10" : "border-line text-ink-2 bg-sheet",
            )}
          >
            {index + 1}
          </span>
          <h3 className={cx("text-base font-semibold leading-7 mb-3", isFuture && "text-pollen")}>{era.name}</h3>

          {isFuture ? (
            <div className="space-y-3">
              {(era.expressions as IndustryExpression[]).map((expr) => (
                <article key={expr.id} className="p-3 md:p-4 rounded-card bg-sheet border border-line">
                  <div className="flex flex-wrap items-start gap-2">
                    <h4 className="font-semibold flex-1 min-w-0">{expr.name}</h4>
                    {expr.crossPollinated && (
                      <Badge tone="pollen"><Shuffle className="w-3 h-3" aria-hidden />Cross-pollinated</Badge>
                    )}
                  </div>
                  <p className="text-sm text-ink-2 mt-1">
                    <span className="font-medium text-ink">Shift: </span>{expr.mutation}
                  </p>
                  {expr.insight && <p className="text-sm mt-2">{expr.insight}</p>}

                  {!!expr.inspirations?.length && (
                    <div className="mt-3 pt-3 border-t border-line">
                      <p className="text-sm font-medium mb-1.5">Inspired by</p>
                      <ul className="space-y-1">
                        {expr.inspirations.map((insp, j) => (
                          <li key={j} className="text-sm">
                            <span className="font-medium text-accent">{insp.source}</span>
                            {insp.twist && <span className="text-ink-2">: {insp.twist}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!!expr.children?.length && (
                    <ul className="mt-3 pl-3 border-l-2 border-line space-y-2">
                      {expr.children.map(child => (
                        <li key={child.id} className="text-sm p-2 rounded-control bg-well">
                          <p className="font-medium">{child.name}</p>
                          <p className="text-ink-2">{child.mutation}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {(era.expressions as string[]).map((expr, i) => (
                <li key={i} className="text-sm px-3 py-1 rounded-full border border-line bg-ink/5 text-ink-2">{expr}</li>
              ))}
            </ul>
          )}
        </li>
      );
    })}
  </ol>
);
