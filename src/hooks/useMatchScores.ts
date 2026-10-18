import { useCallback, useEffect, useState } from "react";
import type { ConstraintsProfile, DeepDiveDetails, IndustryExpression } from "../types";
import { DBService } from "../services/db.service";
import { calculateMatchScore, type MatchScoreResult } from "../utils/match-score";

/**
 * Builder-profile fit scores for the active need. Only deep-dived industries can be
 * scored (the deep dive supplies market data), so `scoredCount` gates the fit filter.
 */
export function useMatchScores(activeNeedId: string | undefined, analyzedDeepDives: ReadonlySet<string>, profile: ConstraintsProfile) {
  const [cache, setCache] = useState<Map<string, DeepDiveDetails>>(new Map());

  useEffect(() => {
    let alive = true;
    setCache(new Map());
    if (!activeNeedId) return;
    DBService.getDeepDivesByNeed(activeNeedId)
      .then((dives) => {
        if (alive) setCache(new Map(dives.filter((d) => d.details?.marketOpportunity).map((d) => [d.id, d.details])));
      })
      .catch((e) => console.error("Failed to load deep dives for scoring:", e));
    return () => { alive = false; };
  }, [activeNeedId, analyzedDeepDives]);

  const getMatchScore = useCallback((expr: IndustryExpression): MatchScoreResult | null => {
    const deepDive = cache.get(expr.id);
    return deepDive ? calculateMatchScore(expr, deepDive, profile) : null;
  }, [cache, profile]);

  return { getMatchScore, scoredCount: cache.size };
}

/** Industries scoring below this are hidden by the fit filter. */
export const FIT_FILTER_THRESHOLD = 40;
