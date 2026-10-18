import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { getGeminiService } from '../../services/gemini.service';
import { DBService } from '../../services/db.service';
import { findNeedIdForExpression } from '../../utils/need-model';
import { normalizeAppConcepts, normalizeDeepDive } from '../../utils/ai-normalizers';
import type { AppConcept, DeepDiveDetails, IndustryExpression, MechanismDetails } from '../../types';
import type { NeedStateApi } from './useNeedState';

/** An analysis shown in a modal, together with the expression it belongs to. */
export interface AnalysisView<T> {
  expressionId: string;
  expressionName: string;
  needId: string;
  details: T;
}

export interface AnalyzedIndex {
  mechanisms: Set<string>;
  deepDives: Set<string>;
  appConcepts: Set<string>;
}

const EMPTY_INDEX: AnalyzedIndex = { mechanisms: new Set(), deepDives: new Set(), appConcepts: new Set() };

/** Records saved before v6 stored a single mechanism object instead of one per framework. */
const asMechanismList = (details: unknown): MechanismDetails[] =>
  Array.isArray(details) ? details : details && typeof details === 'object' ? [details as MechanismDetails] : [];

/**
 * Mechanism extraction, deep dives and app concepts — cached per expression, with one
 * in-flight request per (kind, expression) and an index of what the active need has analyzed.
 */
export function useExpressionAnalysis(state: NeedStateApi) {
  const { needsRef, activeNeed } = state;

  const [mechanism, setMechanism] = useState<AnalysisView<MechanismDetails[]> | null>(null);
  const [deepDive, setDeepDive] = useState<AnalysisView<DeepDiveDetails> | null>(null);
  const [appConcepts, setAppConcepts] = useState<AnalysisView<AppConcept[]> | null>(null);
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const pendingRef = useRef(new Set<string>());
  const [analyzed, setAnalyzed] = useState<AnalyzedIndex>(EMPTY_INDEX);

  const activeNeedId = activeNeed?.id;
  const refreshIndex = useCallback(async (needId: string | undefined, isCurrent: () => boolean = () => true) => {
    if (!needId) {
      setAnalyzed(EMPTY_INDEX);
      return;
    }
    try {
      const [mechs, dives, concepts] = await Promise.all([
        DBService.getMechanismsByNeed(needId),
        DBService.getDeepDivesByNeed(needId),
        DBService.getAppConceptsByNeed(needId),
      ]);
      if (!isCurrent()) return;
      setAnalyzed({
        mechanisms: new Set(mechs.map((m) => m.id)),
        deepDives: new Set(dives.map((d) => d.id)),
        appConcepts: new Set(concepts.map((c) => c.id)),
      });
    } catch (e) {
      console.error('Failed to load analysis index:', e);
    }
  }, []);

  useEffect(() => {
    let current = true;
    setAnalyzed(EMPTY_INDEX);
    void refreshIndex(activeNeedId, () => current);
    return () => { current = false; };
  }, [activeNeedId, refreshIndex]);

  /** Shared cached-or-generate flow with per-expression de-duplication. */
  const run = useCallback(async <T,>(
    kind: 'mechanism' | 'deepDive' | 'appConcepts',
    expr: IndustryExpression,
    opts: {
      loading: string;
      cached: () => Promise<T | undefined>;
      generate: (needId: string) => Promise<T>;
      save: (needId: string, value: T) => Promise<void>;
      show: (view: AnalysisView<T>) => void;
      done: (value: T) => string;
    },
  ) => {
    const key = `${kind}:${expr.id}`;
    if (pendingRef.current.has(key)) return;
    const needId = findNeedIdForExpression(needsRef.current, expr.id);
    if (!needId) {
      toast.error('This prediction is no longer open.');
      return;
    }

    pendingRef.current.add(key);
    setPending((p) => ({ ...p, [key]: true }));
    const toastId = toast.loading(opts.loading);
    try {
      const cached = await opts.cached();
      if (cached !== undefined) {
        opts.show({ expressionId: expr.id, expressionName: expr.name, needId, details: cached });
        toast.dismiss(toastId);
        return;
      }
      const value = await opts.generate(needId);
      await opts.save(needId, value);
      opts.show({ expressionId: expr.id, expressionName: expr.name, needId, details: value });
      toast.success(opts.done(value), { id: toastId });
      if (needId === state.activeTabRef.current) void refreshIndex(needId, () => state.activeTabRef.current === needId);
    } catch (e) {
      toast.error((e as Error).message, { id: toastId });
    } finally {
      pendingRef.current.delete(key);
      setPending((p) => {
        const { [key]: _, ...rest } = p;
        return rest;
      });
    }
  }, [needsRef, refreshIndex, state.activeTabRef]);

  const fetchMechanism = useCallback((expr: IndustryExpression) => run<MechanismDetails[]>('mechanism', expr, {
    loading: `Extracting mechanism for: ${expr.name}...`,
    cached: async () => {
      const list = asMechanismList((await DBService.getMechanism(expr.id))?.details);
      return list.length ? list : undefined;
    },
    generate: () => getGeminiService().extractMechanism(expr),
    save: (needId, value) => DBService.saveMechanism(expr.id, expr.name, needId, value),
    show: setMechanism,
    done: (v) => `Analyzed ${expr.name} through ${v.length} frameworks`,
  }), [run]);

  const fetchDeepDive = useCallback((expr: IndustryExpression) => run<DeepDiveDetails>('deepDive', expr, {
    loading: `Deep diving: ${expr.name}...`,
    cached: async () => {
      const record = await DBService.getDeepDiveById(expr.id);
      if (!record) return undefined;
      try {
        return normalizeDeepDive(record.details); // records may predate validation
      } catch {
        return undefined; // unusable cache entry: regenerate
      }
    },
    generate: () => getGeminiService().deepDive(expr),
    save: (needId, value) => DBService.saveDeepDive(expr.id, expr.name, needId, value),
    show: setDeepDive,
    done: () => `Deep dive complete: ${expr.name}`,
  }), [run]);

  const fetchAppConcepts = useCallback((expr: IndustryExpression) => {
    let usedDeepDive = false;
    return run<AppConcept[]>('appConcepts', expr, {
      loading: `Generating app concepts for: ${expr.name}...`,
      cached: async () => {
        const record = await DBService.getAppConcepts(expr.id);
        const concepts = normalizeAppConcepts(record?.concepts);
        return concepts.length ? concepts : undefined;
      },
      generate: async () => {
        const record = await DBService.getDeepDiveById(expr.id);
        let dd: DeepDiveDetails | undefined;
        try {
          dd = record ? normalizeDeepDive(record.details) : undefined;
        } catch {
          dd = undefined;
        }
        usedDeepDive = !!dd;
        return getGeminiService().generateAppConcepts(expr, dd);
      },
      save: (needId, value) => DBService.saveAppConcepts(expr.id, expr.name, needId, value, usedDeepDive),
      show: (view) => {
        setAppConcepts(view);
        setAnalyzed((prev) => ({ ...prev, appConcepts: new Set(prev.appConcepts).add(view.expressionId) }));
      },
      done: (v) => `Generated ${v.length} app concepts`,
    });
  }, [run]);

  const isPending = useCallback(
    (kind: 'mechanism' | 'deepDive' | 'appConcepts', exprId: string) => !!pending[`${kind}:${exprId}`],
    [pending],
  );

  return {
    mechanism,
    setMechanism,
    deepDive,
    setDeepDive,
    appConcepts,
    setAppConcepts,
    analyzed,
    isPending,
    fetchMechanism,
    fetchDeepDive,
    fetchAppConcepts,
  };
}
