import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { DBService } from "../services/db.service";
import { getGeminiService } from "../services/gemini.service";
import { clusterPatterns, type PatternInstance } from "../utils/pattern-clustering";
import type { MechanismDetails } from "../types";

export interface PatternMechanism {
  id: string;
  expressionName: string;
  needId: string;
  needName?: string;
  coreMechanism: string;
}

export interface PatternGroup {
  pattern: string;
  mechanisms: PatternMechanism[];
  analyses?: any[];
  loading?: boolean;
  failed?: boolean;
}

/** Analyses in flight, shared across mounts so revisiting the page never re-bills the same call. */
const inFlight = new Map<string, Promise<any[]>>();

function analyzeOnce(pattern: string, mechanisms: PatternMechanism[]): Promise<any[]> {
  const key = `${pattern}\u0000${mechanisms.length}`;
  let promise = inFlight.get(key);
  if (!promise) {
    promise = (async () => {
      const cached = await DBService.getPatternAnalysis(pattern);
      if (cached && cached.mechanismCount === mechanisms.length && cached.analyses?.length) return cached.analyses;
      const analyses = await getGeminiService().analyzePatterns(
        pattern,
        mechanisms.map((m) => ({ expressionName: m.expressionName, needName: m.needName || "Unknown", coreMechanism: m.coreMechanism })),
      );
      await DBService.savePatternAnalysis(pattern, analyses, mechanisms.length);
      return analyses;
    })().finally(() => inFlight.delete(key));
    inFlight.set(key, promise);
  }
  return promise;
}

const asList = (details: unknown): Partial<MechanismDetails>[] =>
  Array.isArray(details) ? details : details && typeof details === "object" ? [details as Partial<MechanismDetails>] : [];

export const usePatterns = () => {
  const [patterns, setPatterns] = useState<PatternGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let alive = true;
    const update = (pattern: string, patch: Partial<PatternGroup>) => {
      if (alive) setPatterns((prev) => prev.map((p) => (p.pattern === pattern ? { ...p, ...patch } : p)));
    };

    (async () => {
      setLoading(true);
      try {
        const [allMechanisms, allNeeds] = await Promise.all([DBService.getAllMechanisms(), DBService.getAllNeeds()]);
        const needNames = new Map(allNeeds.map((n) => [n.id, n.name]));
        const byId = new Map<string, PatternMechanism>();
        const instances: PatternInstance[] = [];

        for (const mech of allMechanisms) {
          const frameworks = asList(mech.details);
          byId.set(mech.id, {
            id: mech.id,
            expressionName: mech.expressionName,
            needId: mech.needId,
            needName: needNames.get(mech.needId),
            coreMechanism: frameworks.find((f) => f.coreMechanism)?.coreMechanism ?? "",
          });
          for (const f of frameworks) {
            if (typeof f.abstractPattern === "string" && f.abstractPattern.trim()) {
              instances.push({ mechanismId: mech.id, label: f.abstractPattern.trim() });
            }
          }
        }

        const groups: PatternGroup[] = clusterPatterns(instances).map((c) => ({
          pattern: c.name,
          mechanisms: c.mechanismIds.map((id) => byId.get(id)!).filter(Boolean),
          loading: true,
        }));
        if (!alive) return;
        setPatterns(groups);
        setLoading(false);

        const results = await Promise.allSettled(groups.map((g) =>
          analyzeOnce(g.pattern, g.mechanisms).then(
            (analyses) => update(g.pattern, { analyses, loading: false }),
            (error) => {
              update(g.pattern, { loading: false, failed: true });
              throw error;
            },
          )));
        const failed = results.filter((r) => r.status === "rejected").length;
        if (alive && failed) toast.error(`${failed} pattern analys${failed === 1 ? "is" : "es"} failed. Use Refresh to retry.`);
      } catch (e) {
        console.error("Failed to load patterns:", e);
        if (alive) {
          toast.error("Could not load the pattern library.");
          setLoading(false);
        }
      }
    })();

    return () => { alive = false; };
  }, [version]);

  const refreshPatterns = useCallback(() => setVersion((v) => v + 1), []);

  return { patterns, loading, refreshPatterns };
};
