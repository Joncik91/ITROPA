/**
 * Modal content for adding a new prediction to the tree.
 * Provides form for industry name, mutation, and insight.
 */

import type { FormData } from "../../types";
import type { Theme } from "../../config/theme";

export interface AddPredictionModalContentProps {
  formData: FormData;
  theme: Theme;
  isSubBranch: boolean;
  onFormChange: (updates: Partial<FormData>) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export const AddPredictionModalContent = ({
  formData,
  theme,
  isSubBranch,
  onFormChange,
  onCancel,
  onSubmit
}: AddPredictionModalContentProps) => (
  <>
    <p className={`text-xs ${theme.muted} mb-4`}>
      {isSubBranch ? "Adding as sub-branch" : "Adding as root prediction"}
    </p>
    <div className="space-y-3">
      <input
        value={formData.name}
        onChange={e => onFormChange({ name: e.target.value })}
        placeholder="Industry name"
        className={`w-full px-3 py-2 rounded-lg ${theme.inputBg} border text-sm focus:outline-none focus:border-gray-500`}
      />
      <input
        value={formData.mutation}
        onChange={e => onFormChange({ mutation: e.target.value })}
        placeholder="Mutation (enabling shift)"
        className={`w-full px-3 py-2 rounded-lg ${theme.inputBg} border text-sm focus:outline-none focus:border-gray-500`}
      />
      <textarea
        value={formData.insight}
        onChange={e => onFormChange({ insight: e.target.value })}
        placeholder="Insight..."
        rows={2}
        className={`w-full px-3 py-2 rounded-lg ${theme.inputBg} border text-sm focus:outline-none focus:border-gray-500 resize-none`}
      />
    </div>
    <div className="flex gap-3 mt-5">
      <button
        onClick={onCancel}
        className={`flex-1 px-4 py-2 rounded-lg border ${theme.border} ${theme.muted} text-sm`}
      >
        Cancel
      </button>
      <button
        onClick={onSubmit}
        disabled={!formData.name.trim()}
        className="flex-1 px-4 py-2 rounded-lg bg-gray-500 text-white text-sm disabled:opacity-50"
      >
        Add
      </button>
    </div>
  </>
);
