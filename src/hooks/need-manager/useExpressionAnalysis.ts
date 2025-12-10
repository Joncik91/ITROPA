import toast from 'react-hot-toast';
import { getGeminiService } from '../../services/gemini.service';
import { DBService } from '../../services/db.service';
import type { IndustryExpression } from '../../types';

/**
 * Expression analysis operations (mechanism, deep dive)
 * Dependencies: uiState
 */
export function useExpressionAnalysis(deps: {
  setMechanism: (mechanism: any) => void;
  setMechanismLoading: (loading: boolean) => void;
  setDeepDive: (deepDive: any) => void;
  setDeepDiveLoading: (loading: boolean) => void;
}) {
  const {
    setMechanism,
    setMechanismLoading,
    setDeepDive,
    setDeepDiveLoading,
  } = deps;

  const geminiService = getGeminiService();

  const fetchMechanism = async (expr: IndustryExpression) => {
    setMechanismLoading(true);
    const toastId = toast.loading(`Extracting mechanism for: ${expr.name}...`);
    try {
      // Check cache first
      const cached = await DBService.getMechanism(expr.id);
      if (cached) {
        setMechanism(cached.details);
        toast.success(`Loaded cached mechanism analysis`, { id: toastId });
        return;
      }

      const mechanism = await geminiService.extractMechanism(expr);
      setMechanism(mechanism);
      // Save to database
      if (mechanism.length > 0) {
        await DBService.saveMechanism(expr.id, expr.name, expr.id, mechanism);
      }
      toast.success(`Analyzed: ${expr.name}`, { id: toastId });
    } catch (e: any) {
      toast.error(`Failed to extract mechanism: ${e.message}`, { id: toastId });
    } finally {
      setMechanismLoading(false);
    }
  };

  const fetchDeepDive = async (expr: IndustryExpression) => {
    setDeepDiveLoading(true);
    const toastId = toast.loading(`Deep diving: ${expr.name}...`);
    try {
      // Check cache first
      const cached = await DBService.getDeepDive(expr.id, expr.id);
      if (cached) {
        setDeepDive(cached.details);
        toast.success(`Loaded cached deep dive`, { id: toastId });
        return;
      }

      const deepDive = await geminiService.deepDive(expr);
      setDeepDive(deepDive);
      // Save to database
      await DBService.saveDeepDive(expr.id, expr.name, expr.id, deepDive);
      toast.success(`Deep dive complete: ${expr.name}`, { id: toastId });
    } catch (e: any) {
      toast.error(`Failed deep dive: ${e.message}`, { id: toastId });
    } finally {
      setDeepDiveLoading(false);
    }
  };

  return {
    fetchMechanism,
    fetchDeepDive,
  };
}
