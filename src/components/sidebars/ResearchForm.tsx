import { useState, type FormEvent } from "react";
import { AlertCircle, Search } from "lucide-react";
import type { NeedManager } from "../../hooks/useNeedManager";
import { getIcon, SUGGESTED_NEEDS } from "../../config/constants";
import { Button, Chip, Field, Hint, TextArea, TextInput } from "../ui";

/** Start research on a need. Used in the desktop column, the mobile sheet and the empty state. */
export const ResearchForm = ({ manager, onStarted, autoFocus }: { manager: NeedManager; onStarted?: () => void; autoFocus?: boolean }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [touched, setTouched] = useState(false);

  const start = (needName: string, desc?: string) => {
    if (manager.loading) return;
    void manager.fetchNeed(needName, desc);
    setName("");
    setDescription("");
    setTouched(false);
    onStarted?.();
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!name.trim()) return;
    start(name.trim(), description.trim() || undefined);
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field
        label="Need to research"
        hint="A human need or a group of people, like “sleep” or “vibe coders”. A need you researched before opens from your library."
        error={touched && !name.trim() ? "Type a need to research." : null}
      >
        <TextInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. sleep"
          maxLength={200}
          enterKeyHint="search"
          autoFocus={autoFocus}
          data-autofocus={autoFocus || undefined}
        />
      </Field>
      <Field
        label="What you mean by it"
        optional
        hint="Narrows the research to your meaning. Adding this always runs fresh research instead of opening a saved one."
      >
        <TextArea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. people without coding skills who build software with AI"
          maxLength={1000}
          rows={3}
        />
      </Field>
      <div className="space-y-1.5">
        <Button type="submit" variant="primary" block loading={manager.loading} icon={<Search className="w-4 h-4" />}>
          {manager.loading ? "Researching…" : "Research this need"}
        </Button>
        <Hint>
          {manager.loading && manager.loadingStage
            ? manager.loadingStage
            : "Finds prior art, then predicts future industries from it. Uses AI, about 30–60 s."}
        </Hint>
      </div>

      {manager.error && (
        <p role="alert" className="p-3 rounded-card bg-bad/10 border border-bad/35 text-sm text-bad flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
          {manager.error}
        </p>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium">Or start from a common need</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_NEEDS.map((s) => {
            const Icon = getIcon(s.icon);
            return (
              <Chip key={s.name} type="button" disabled={manager.loading} onClick={() => start(s.name)}>
                <Icon className="w-4 h-4 text-accent" aria-hidden />
                {s.name}
              </Chip>
            );
          })}
        </div>
      </div>
    </form>
  );
};
