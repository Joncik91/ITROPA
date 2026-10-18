/**
 * Form for adding a prediction by hand, at the root of the future era or under an industry.
 */

import { useState } from "react";
import { Plus } from "lucide-react";
import type { FormData } from "../../types";
import { Button, Field, Hint, TextArea, TextInput } from "../ui";

export interface AddPredictionModalContentProps {
  formData: FormData;
  isSubBranch: boolean;
  onFormChange: (updates: Partial<FormData>) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export const AddPredictionModalContent = ({
  formData,
  isSubBranch,
  onFormChange,
  onCancel,
  onSubmit,
}: AddPredictionModalContentProps) => {
  const [attempted, setAttempted] = useState(false);
  const nameMissing = !formData.name.trim();

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setAttempted(true);
        if (!nameMissing) onSubmit();
      }}
      className="space-y-5"
    >
      <Hint>
        {isSubBranch
          ? "Added as a sub-industry under the card you chose."
          : "Added as a new prediction in the future era of this need."}
      </Hint>

      <Field label="Industry name" hint="The industry, in a few words." error={attempted && nameMissing ? "Give the industry a name." : null}>
        <TextInput
          data-autofocus
          value={formData.name}
          onChange={(e) => onFormChange({ name: e.target.value })}
          placeholder="Sleep-debt insurance"
          maxLength={120}
          required
        />
      </Field>

      <Field label="Mutation" optional hint="The shift that makes it possible: a technology, behaviour or regulation change.">
        <TextInput
          value={formData.mutation}
          onChange={(e) => onFormChange({ mutation: e.target.value })}
          placeholder="Wearables make sleep measurable"
          maxLength={300}
        />
      </Field>

      <Field label="Insight" optional hint="Why it matters or who it serves.">
        <TextArea
          value={formData.insight}
          onChange={(e) => onFormChange({ insight: e.target.value })}
          placeholder="Shift workers lose income when tired…"
          rows={3}
          maxLength={1000}
        />
      </Field>

      <div className="flex gap-2 pt-1">
        <Button variant="ghost" onClick={onCancel} className="flex-1 md:flex-none">
          Cancel
        </Button>
        <Button type="submit" variant="primary" icon={<Plus className="w-4 h-4" />} className="flex-1 md:flex-none md:ml-auto">
          Add prediction
        </Button>
      </div>
    </form>
  );
};
