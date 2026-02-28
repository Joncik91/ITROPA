import { useState } from 'react';
import toast from 'react-hot-toast';
import { getAIAssistant } from '../../services/ai-assistant.service';
import { getGeminiService } from '../../services/gemini.service';
import { findExpressionInNeed, findExpressionByNameInNeed } from '../../utils/tree-search';
import type { Need, IndustryExpression, AIActionSuggestion, AIAssistantResponse } from '../../types';

/**
 * AI Assistant operations
 * Dependencies: needState, crud, tree, analysis
 */
export function useAIAssistant(deps: {
  needs: Need[];
  setNeeds: (fn: any) => void;
  activeNeed: Need | undefined;
  fetchMechanism: (expr: IndustryExpression) => Promise<void>;
  fetchDeepDive: (expr: IndustryExpression) => Promise<void>;
  branchIndustry: (expr: IndustryExpression, needId: string) => Promise<void>;
}) {
  const {
    setNeeds,
    activeNeed,
    fetchMechanism,
    fetchDeepDive,
    branchIndustry,
  } = deps;

  const [mechanismAISuggestions, setMechanismAISuggestions] = useState<AIAssistantResponse | null>(null);
  const [deepDiveAISuggestions, setDeepDiveAISuggestions] = useState<AIAssistantResponse | null>(null);
  const [needAISuggestions, setNeedAISuggestions] = useState<AIAssistantResponse | null>(null);
  const [aiLoading, setAILoading] = useState(false);

  const geminiService = getGeminiService();

  const requestMechanismAIAssist = async (mechanismId: string) => {
    setAILoading(true);
    try {
      const suggestions = await getAIAssistant().suggestMechanismActions(mechanismId);
      setMechanismAISuggestions(suggestions);
    } catch (e: any) {
      toast.error(`AI assist failed: ${e.message}`);
    } finally {
      setAILoading(false);
    }
  };

  const requestDeepDiveAIAssist = async (deepDiveId: string) => {
    setAILoading(true);
    try {
      const suggestions = await getAIAssistant().suggestDeepDiveActions(deepDiveId);
      setDeepDiveAISuggestions(suggestions);
    } catch (e: any) {
      toast.error(`AI assist failed: ${e.message}`);
    } finally {
      setAILoading(false);
    }
  };

  const requestNeedAIAssist = async (needId: string) => {
    setAILoading(true);
    try {
      const suggestions = await getAIAssistant().suggestNeedActions(needId);
      setNeedAISuggestions(suggestions);
    } catch (e: any) {
      toast.error(`AI assist failed: ${e.message}`);
    } finally {
      setAILoading(false);
    }
  };

  const executeAIAction = async (suggestion: AIActionSuggestion) => {
    const toastId = toast.loading(suggestion.action);
    try {
      switch (suggestion.actionType) {
        case 'branch': {
          if (!activeNeed) throw new Error('No active need');
          const expr = suggestion.params.expressionName
            ? findExpressionByNameInNeed(activeNeed, suggestion.params.expressionName)
            : findExpressionInNeed(activeNeed, suggestion.params.expressionId);
          if (!expr) throw new Error('Expression not found');
          await branchIndustry(expr, activeNeed.id);
          toast.success(suggestion.action, { id: toastId });
          break;
        }

        case 'analyze': {
          if (!activeNeed) throw new Error('No active need');
          const expr = suggestion.params.expressionName
            ? findExpressionByNameInNeed(activeNeed, suggestion.params.expressionName)
            : findExpressionInNeed(activeNeed, suggestion.params.expressionId);
          if (!expr) throw new Error('Expression not found');
          await fetchMechanism(expr);
          toast.success(suggestion.action, { id: toastId });
          break;
        }

        case 'extract': {
          if (!activeNeed) throw new Error('No active need');
          const expr = suggestion.params.expressionName
            ? findExpressionByNameInNeed(activeNeed, suggestion.params.expressionName)
            : findExpressionInNeed(activeNeed, suggestion.params.expressionId);
          if (!expr) throw new Error('Expression not found');
          await fetchDeepDive(expr);
          toast.success(suggestion.action, { id: toastId });
          break;
        }

        case 'create_need': {
          const newNeed = await geminiService.generateNeed(
            suggestion.params.needName,
            activeNeed?.priorArt || {},
            suggestion.params.needDescription
          );
          setNeeds((prev: Need[]) => [...prev, newNeed]);
          toast.success(suggestion.action, { id: toastId });
          break;
        }

        default:
          throw new Error(`Unknown action: ${suggestion.actionType}`);
      }
    } catch (e: any) {
      toast.error(`Action failed: ${e.message}`, { id: toastId });
    }
  };

  return {
    mechanismAISuggestions,
    setMechanismAISuggestions,
    deepDiveAISuggestions,
    setDeepDiveAISuggestions,
    needAISuggestions,
    setNeedAISuggestions,
    aiLoading,
    requestMechanismAIAssist,
    requestDeepDiveAIAssist,
    requestNeedAIAssist,
    executeAIAction,
  };
}
