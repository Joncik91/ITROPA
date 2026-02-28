import toast from 'react-hot-toast';
import { getGeminiService } from '../../services/gemini.service';
import { DBService } from '../../services/db.service';
import type { IndustryExpression, AppConcept } from '../../types';

/**
 * Expression analysis operations (mechanism, deep dive, app concepts)
 * Dependencies: uiState
 */
export function useExpressionAnalysis(deps: {
  setMechanism: (mechanism: any) => void;
  setMechanismLoading: (loading: boolean) => void;
  setDeepDive: (deepDive: any) => void;
  setDeepDiveLoading: (loading: boolean) => void;
  setAppConcepts: (concepts: AppConcept[] | null) => void;
  setAppConceptsLoading: (loading: boolean) => void;
}) {
  const {
    setMechanism,
    setMechanismLoading,
    setDeepDive,
    setDeepDiveLoading,
    setAppConcepts,
    setAppConceptsLoading,
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

  const fetchAppConcepts = async (expr: IndustryExpression, needId: string) => {
    setAppConceptsLoading(true);
    const toastId = toast.loading(`Generating app concepts for: ${expr.name}...`);
    try {
      // Check cache first
      const cached = await DBService.getAppConcepts(expr.id);
      if (cached) {
        setAppConcepts(cached.concepts);
        toast.success(`Loaded cached app concepts`, { id: toastId });
        return;
      }

      // Try to get deep dive for richer context
      const deepDiveCache = await DBService.getDeepDive(expr.id, needId);
      const deepDive = deepDiveCache?.details;

      const concepts = await geminiService.generateAppConcepts(expr, deepDive as any);
      setAppConcepts(concepts);
      // Save to database
      if (concepts.length > 0) {
        await DBService.saveAppConcepts(expr.id, expr.name, needId, concepts, !!deepDive);
      }
      toast.success(`Generated ${concepts.length} app concepts`, { id: toastId });
    } catch (e: any) {
      toast.error(`Failed to generate concepts: ${e.message}`, { id: toastId });
    } finally {
      setAppConceptsLoading(false);
    }
  };

  return {
    fetchMechanism,
    fetchDeepDive,
    fetchAppConcepts,
  };
}
