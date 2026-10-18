import { useState } from "react";
import { Sparkles, CheckCircle2, PlayCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import type { AIActionSuggestion } from "../types";
import { Button, Hint, cx } from "./ui";

type Status = "running" | "done" | "failed";

interface AIAssistantProps {
  suggestions: AIActionSuggestion[];
  reasoning: string;
  /** Resolves true on success. Must not throw. */
  onExecuteAction: (suggestion: AIActionSuggestion) => Promise<boolean>;
}

export const AIAssistant = ({ suggestions, reasoning, onExecuteAction }: AIAssistantProps) => {
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [runningAll, setRunningAll] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const setOne = (id: string, s: Status) => setStatus((prev) => ({ ...prev, [id]: s }));

  const execute = async (suggestion: AIActionSuggestion): Promise<boolean> => {
    setOne(suggestion.id, "running");
    const ok = await onExecuteAction(suggestion);
    setOne(suggestion.id, ok ? "done" : "failed");
    return ok;
  };

  const remaining = suggestions.filter((s) => status[s.id] !== "done");

  const executeAll = async () => {
    setConfirming(false);
    setRunningAll(true);
    const queue = [...remaining];
    const toastId = toast.loading(`Running 0 of ${queue.length} steps…`);
    try {
      for (let i = 0; i < queue.length; i++) {
        toast.loading(`Running ${i + 1} of ${queue.length}: ${queue[i].action}`, { id: toastId });
        if (!(await execute(queue[i]))) {
          toast.error(`Stopped at step ${i + 1} of ${queue.length}: ${queue[i].action}`, { id: toastId });
          return;
        }
      }
      toast.success(`Ran ${queue.length} step${queue.length === 1 ? "" : "s"}. Results are in the tree.`, { id: toastId });
    } finally {
      setRunningAll(false);
    }
  };

  return (
    <div className="space-y-4">
      {reasoning && (
        <div className="p-3 rounded-card bg-well border border-line">
          <p className="text-sm font-medium flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-accent" aria-hidden /> Why these steps
          </p>
          <p className="text-sm text-ink-2">{reasoning}</p>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">Suggested steps</p>
          {remaining.length > 1 && !confirming && (
            <Button size="sm" variant="primary" icon={<PlayCircle className="w-4 h-4" />} loading={runningAll} onClick={() => setConfirming(true)}>
              {runningAll ? "Running…" : `Run all ${remaining.length}`}
            </Button>
          )}
        </div>

        {confirming && (
          <div className="p-3 rounded-card border border-accent/40 bg-accent/5 text-sm space-y-3" role="alertdialog" aria-label="Confirm run all">
            <p>Run {remaining.length} steps in order? Each may call the AI (10–30 s each). The run stops at the first failure.</p>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>Cancel</Button>
              <Button size="sm" variant="primary" onClick={executeAll} autoFocus>Run all</Button>
            </div>
          </div>
        )}

        <ul className="space-y-2">
          {suggestions.map((suggestion) => {
            const s = status[suggestion.id];
            return (
              <li
                key={suggestion.id}
                className={cx(
                  "p-3 rounded-card border",
                  s === "done" ? "bg-ok/10 border-ok/35" : s === "failed" ? "bg-bad/10 border-bad/35" : "border-line bg-sheet",
                )}
              >
                <p className="text-sm font-medium flex items-start gap-2">
                  {s === "done" && <CheckCircle2 className="w-4 h-4 text-ok shrink-0 mt-0.5" aria-label="Done" />}
                  {s === "failed" && <XCircle className="w-4 h-4 text-bad shrink-0 mt-0.5" aria-label="Failed" />}
                  {suggestion.action}
                </p>
                {suggestion.reasoning && <p className="text-sm text-ink-2 mt-1">{suggestion.reasoning}</p>}
                <div className="mt-2 flex justify-end">
                  <Button
                    size="sm"
                    variant={s === "failed" ? "danger" : "secondary"}
                    loading={s === "running"}
                    disabled={s === "done" || runningAll}
                    onClick={() => void execute(suggestion)}
                  >
                    {s === "running" ? "Running" : s === "done" ? "Done" : s === "failed" ? "Retry" : "Run this step"}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

interface AIAssistButtonProps {
  onClick: () => void;
  loading: boolean;
  label?: string;
}

/** Asks the assistant for next steps on the open analysis. */
export const AIAssistButton = ({ onClick, loading, label = "Suggest next steps" }: AIAssistButtonProps) => (
  <div className="space-y-1.5">
    <Button size="sm" onClick={onClick} loading={loading} icon={<Sparkles className="w-4 h-4" />}>
      {loading ? "Thinking…" : label}
    </Button>
    <Hint>Suggests follow-up actions based on this analysis. Uses AI.</Hint>
  </div>
);
