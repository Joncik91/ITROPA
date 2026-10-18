import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAIAssistant } from '../../services/ai-assistant.service';
import { findExpressionByNameInNeed } from '../../utils/tree-search';
import type { AIActionSuggestion, AIAssistantResponse, IndustryExpression, Need } from '../../types';
import type { NeedStateApi } from './useNeedState';

type Scope = 'need' | 'mechanism' | 'deepDive';

/** Suggestions are tagged with what they were generated for, so they never leak across contexts. */
interface ScopedSuggestions {
  targetId: string;
  response: AIAssistantResponse;
}

/**
 * AI "next step" suggestions and their execution.
 * Only executable actions are offered; execution reports success so callers can show truthful status.
 */
export function useAIAssistant(
  state: NeedStateApi,
  actions: {
    fetchNeed: (name: string, description?: string) => Promise<void>;
    fetchMechanism: (expr: IndustryExpression) => Promise<void>;
    fetchDeepDive: (expr: IndustryExpression) => Promise<void>;
    branchIndustry: (expr: IndustryExpression, needId: string) => Promise<void>;
  },
) {
  const { needsRef, activeTabRef, activeNeed } = state;
  const [suggestions, setSuggestions] = useState<Partial<Record<Scope, ScopedSuggestions>>>({});
  const [loadingScope, setLoadingScope] = useState<Scope | null>(null);

  // Need-level suggestions belong to one need; drop them when the user switches.
  const activeNeedId = activeNeed?.id;
  useEffect(() => {
    setSuggestions((prev) => (prev.need && prev.need.targetId !== activeNeedId ? { ...prev, need: undefined } : prev));
  }, [activeNeedId]);

  const request = useCallback(async (scope: Scope, targetId: string | undefined) => {
    if (!targetId) return;
    setLoadingScope(scope);
    try {
      const assistant = getAIAssistant();
      const response =
        scope === 'need' ? await assistant.suggestNeedActions(targetId)
        : scope === 'mechanism' ? await assistant.suggestMechanismActions(targetId)
        : await assistant.suggestDeepDiveActions(targetId);
      if (response.suggestions.length === 0) toast('The assistant had no actionable suggestions this time.');
      setSuggestions((prev) => ({ ...prev, [scope]: { targetId, response } }));
    } catch (e) {
      toast.error(`AI assist failed: ${(e as Error).message}`);
    } finally {
      setLoadingScope(null);
    }
  }, []);

  const requestNeedAIAssist = useCallback((needId: string) => request('need', needId), [request]);
  const requestMechanismAIAssist = useCallback((expressionId: string) => request('mechanism', expressionId), [request]);
  const requestDeepDiveAIAssist = useCallback((expressionId: string) => request('deepDive', expressionId), [request]);
  const clearSuggestions = useCallback((scope: Scope) => setSuggestions((prev) => ({ ...prev, [scope]: undefined })), []);

  /** Resolve an expression by name, preferring the active need, then any open need. */
  const resolveExpression = (name: unknown): { expr: IndustryExpression; need: Need } | null => {
    if (typeof name !== 'string' || !name.trim()) return null;
    const needs = needsRef.current;
    const ordered = [...needs.filter((n) => n.id === activeTabRef.current), ...needs.filter((n) => n.id !== activeTabRef.current)];
    for (const need of ordered) {
      const expr = findExpressionByNameInNeed(need, name);
      if (expr) return { expr, need };
    }
    return null;
  };

  /** Execute a suggestion. Resolves true on success; never throws. */
  const executeAIAction = useCallback(async (suggestion: AIActionSuggestion): Promise<boolean> => {
    try {
      switch (suggestion.actionType) {
        case 'branch':
        case 'analyze':
        case 'extract': {
          const target = resolveExpression(suggestion.params.expressionName);
          if (!target) throw new Error(`Could not find prediction "${suggestion.params.expressionName ?? '?'}"`);
          if (suggestion.actionType === 'branch') await actions.branchIndustry(target.expr, target.need.id);
          else if (suggestion.actionType === 'analyze') await actions.fetchMechanism(target.expr);
          else await actions.fetchDeepDive(target.expr);
          return true;
        }
        case 'create_need': {
          const name = typeof suggestion.params.needName === 'string' ? suggestion.params.needName : '';
          if (!name.trim()) throw new Error('The suggestion did not name a need.');
          const description = typeof suggestion.params.needDescription === 'string' ? suggestion.params.needDescription : undefined;
          await actions.fetchNeed(name, description);
          return true;
        }
        default:
          throw new Error(`"${suggestion.actionType}" actions are not supported.`);
      }
    } catch (e) {
      toast.error(`Action failed: ${(e as Error).message}`);
      return false;
    }
    // resolveExpression reads refs only; actions are stable callbacks.
  }, [actions.branchIndustry, actions.fetchMechanism, actions.fetchDeepDive, actions.fetchNeed]);

  return {
    needAISuggestions: suggestions.need && suggestions.need.targetId === activeNeedId ? suggestions.need.response : null,
    mechanismSuggestions: suggestions.mechanism ?? null,
    deepDiveSuggestions: suggestions.deepDive ?? null,
    aiLoading: loadingScope !== null,
    aiLoadingScope: loadingScope,
    requestNeedAIAssist,
    requestMechanismAIAssist,
    requestDeepDiveAIAssist,
    clearSuggestions,
    executeAIAction,
  };
}
