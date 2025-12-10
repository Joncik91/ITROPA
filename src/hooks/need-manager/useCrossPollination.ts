import toast from 'react-hot-toast';
import { getGeminiService } from '../../services/gemini.service';
import { DBService } from '../../services/db.service';
import type { IndustryExpression } from '../../types';

/**
 * Cross-pollination operations
 * Dependencies: uiState
 */
export function useCrossPollination(deps: {
  crossPollinate: { open: boolean; items: IndustryExpression[]; result: any };
  setCrossPollinate: (fn: any) => void;
  setCrossLoading: (loading: boolean) => void;
}) {
  const {
    crossPollinate,
    setCrossPollinate,
    setCrossLoading,
  } = deps;

  const geminiService = getGeminiService();

  const executeCrossPollinate = async () => {
    if (crossPollinate.items.length !== 2) {
      toast.error("Select exactly 2 industries to cross-pollinate");
      return;
    }

    const [a, b] = crossPollinate.items;
    setCrossLoading(true);
    const toastId = toast.loading(`Cross-pollinating: ${a.name} + ${b.name}...`);
    try {
      // Check cache first
      const cached = await DBService.getCrossPollinate(a.id, b.id);
      if (cached) {
        setCrossPollinate((prev: any) => ({ ...prev, result: cached.result }));
        toast.success(`Loaded cached cross-pollination result`, { id: toastId });
        setCrossLoading(false);
        return;
      }

      const result = await geminiService.crossPollinate(a, b);
      setCrossPollinate((prev: any) => ({ ...prev, result }));
      // Save to database
      await DBService.saveCrossPollinate(a, b, result);
      toast.success(`Generated ${result.length} hybrid industries`, { id: toastId });
    } catch (e: any) {
      toast.error(`Cross-pollination failed: ${e.message}`, { id: toastId });
    } finally {
      setCrossLoading(false);
    }
  };

  return {
    executeCrossPollinate,
  };
}
