import toast from 'react-hot-toast';
import { getGeminiService } from '../../services/gemini.service';
import { DBService } from '../../services/db.service';
import type { Need, IndustryExpression } from '../../types';
import type { UseHistoryReturn } from '../useHistory';

/**
 * Tree manipulation operations (branching, adding children)
 * Dependencies: needState, uiState, history
 */
export function useTreeOperations(deps: {
  needs: Need[];
  setNeeds: (fn: any) => void;
  setBranchLoading: (id: string | null) => void;
  setExpandedBranches: (fn: any) => void;
  modal: { open: boolean; needId: string | null; parentId: string | null };
  setModal: (modal: any) => void;
  formData: { name: string; mutation: string; insight: string };
  setFormData: (data: any) => void;
  crossPollinate: { items: IndustryExpression[] };
  history: UseHistoryReturn;
}) {
  const {
    needs,
    setNeeds,
    setBranchLoading,
    setExpandedBranches,
    modal,
    setModal,
    formData,
    setFormData,
    crossPollinate,
    history,
  } = deps;

  const geminiService = getGeminiService();

  const branchIndustry = async (expr: IndustryExpression, needId: string) => {
    const need = needs.find(n => n.id === needId);
    if (!need) return;
    console.log('Branching:', expr.id, 'in need:', needId);
    setBranchLoading(expr.id);
    const toastId = toast.loading(`Branching deeper into: ${expr.name}...`);
    try {
      // Save previous state for undo
      const previousNeed = needs.find(n => n.id === needId);

      const children = await geminiService.branchIndustry(expr);
      console.log('Generated children:', children.map(c => c.id));
      const updatedNeeds = needs.map(n => {
        if (n.id !== needId) return n;
        const updateChildren = (expressions: any[]): any[] => expressions.map(e => {
          if (e.id === expr.id) {
            console.log('Found target expression:', e.id, '- adding children');
            return { ...e, children: [...(e.children || []), ...children] };
          }
          if (e.children?.length) return { ...e, children: updateChildren(e.children) };
          return e;
        });
        return {
          ...n,
          eras: n.eras.map(era =>
            era.name.includes("2025")
              ? { ...era, expressions: updateChildren(era.expressions as IndustryExpression[]) }
              : era
          )
        };
      });

      const updatedNeed = updatedNeeds.find(n => n.id === needId);

      // Add to history
      history.addToHistory({
        type: 'branch',
        description: `Branch: ${expr.name}`,
        data: {
          needId,
          expressionId: expr.id,
          previousState: previousNeed,
          newState: updatedNeed,
        },
      });

      setNeeds(updatedNeeds);
      setExpandedBranches((p: any) => ({ ...p, [expr.id]: true }));
      console.log('Branch complete - auto-expanded:', expr.id);
      // Save updated need to database
      if (updatedNeed) await DBService.updateNeed(updatedNeed);
      toast.success(`Added ${children.length} predictions to: ${expr.name}`, { id: toastId });
    } catch (e: any) {
      toast.error(`Failed to branch: ${e.message}`, { id: toastId });
    } finally {
      setBranchLoading(null);
    }
  };

  const addPrediction = async () => {
    if (!formData.name.trim()) return;
    const newExpr: IndustryExpression = {
      id: `expr-${Date.now()}`,
      name: formData.name,
      mutation: formData.mutation,
      insight: formData.insight,
      type: "future",
      inspirations: [],
      children: [],
      userAdded: true
    };

    let updatedNeeds: Need[];
    if (modal.parentId) {
      updatedNeeds = needs.map(n => {
        if (n.id !== modal.needId) return n;
        const addToParent = (expressions: any[]): any[] => expressions.map(e => {
          if (e.id === modal.parentId) return { ...e, children: [...(e.children || []), newExpr] };
          if (e.children?.length) return { ...e, children: addToParent(e.children) };
          return e;
        });
        return {
          ...n,
          eras: n.eras.map(era =>
            era.name.includes("2025")
              ? { ...era, expressions: addToParent(era.expressions as IndustryExpression[]) }
              : era
          )
        };
      });
      setNeeds(updatedNeeds);
      setExpandedBranches((p: any) => ({ ...p, [modal.parentId!]: true }));
      toast.success(`Added child prediction: ${formData.name}`);
    } else {
      updatedNeeds = needs.map(n =>
        n.id === modal.needId
          ? {
              ...n,
              eras: n.eras.map(era =>
                era.name.includes("2025")
                  ? { ...era, expressions: [...(era.expressions as IndustryExpression[]), newExpr] }
                  : era
              )
            }
          : n
      );
      setNeeds(updatedNeeds);
      toast.success(`Added prediction: ${formData.name}`);
    }

    // Save updated need to database
    const updatedNeed = updatedNeeds.find(n => n.id === modal.needId);
    if (updatedNeed) await DBService.updateNeed(updatedNeed);

    setFormData({ name: "", mutation: "", insight: "" });
    setModal({ open: false, needId: null, parentId: null });
  };

  const addCrossPollinationResult = async (result: IndustryExpression, targetNeedId: string) => {
    // Create new expression with cross-pollination metadata
    const newExpr: IndustryExpression = {
      ...result,
      id: `cross-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      crossPollinated: true,
      sourceExpressions: crossPollinate.items.map(item => item.id)
    };

    // Add to target need's Post-AI era
    const updatedNeeds = needs.map(n =>
      n.id === targetNeedId
        ? {
            ...n,
            eras: n.eras.map(era =>
              era.name.includes("2025")
                ? { ...era, expressions: [...(era.expressions as IndustryExpression[]), newExpr] }
                : era
            )
          }
        : n
    );

    setNeeds(updatedNeeds);

    // Save updated need to database
    const updatedNeed = updatedNeeds.find(n => n.id === targetNeedId);
    if (updatedNeed) await DBService.updateNeed(updatedNeed);
  };

  return {
    branchIndustry,
    addPrediction,
    addCrossPollinationResult,
  };
}
