import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, PlayCircle, XCircle } from "lucide-react";
import toast from 'react-hot-toast';
import type { AIActionSuggestion } from "../types";
import type { Theme } from "../config/theme";

type Status = "running" | "done" | "failed";

interface AIAssistantProps {
  suggestions: AIActionSuggestion[];
  reasoning: string;
  theme: Theme;
  /** Resolves true on success. Must not throw. */
  onExecuteAction: (suggestion: AIActionSuggestion) => Promise<boolean>;
}

export const AIAssistant = ({ suggestions, reasoning, theme, onExecuteAction }: AIAssistantProps) => {
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
    const toastId = toast.loading(`Executing 0/${queue.length} actions...`);
    try {
      for (let i = 0; i < queue.length; i++) {
        toast.loading(`Executing ${i + 1}/${queue.length}: ${queue[i].action}`, { id: toastId });
        if (!(await execute(queue[i]))) {
          toast.error(`Stopped at ${i + 1}/${queue.length}: ${queue[i].action}`, { id: toastId });
          return;
        }
      }
      toast.success(`Completed ${queue.length} action${queue.length === 1 ? "" : "s"}`, { id: toastId });
    } finally {
      setRunningAll(false);
    }
  };

  return (
    <div className="space-y-4">
      {reasoning && (
        <div className={`p-3 rounded-lg ${theme.itemBg} border ${theme.border}`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`w-4 h-4 ${theme.accent}`} />
            <p className="text-sm font-medium">AI Analysis</p>
          </div>
          <p className={`text-sm ${theme.muted}`}>{reasoning}</p>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2 gap-2">
          <p className="text-xs font-medium">Suggested Actions:</p>
          {remaining.length > 1 && !confirming && (
            <button
              onClick={() => setConfirming(true)}
              disabled={runningAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-50"
            >
              {runningAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5" />}
              {runningAll ? "Executing..." : `Execute All (${remaining.length})`}
            </button>
          )}
        </div>

        {confirming && (
          <div className={`mb-3 p-3 rounded-lg border ${theme.border} ${theme.itemBg} text-xs space-y-2`} role="alertdialog" aria-label="Confirm execute all">
            <p>Run {remaining.length} actions in sequence? Each may call the AI; the run stops at the first failure.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirming(false)} className={`px-3 py-1.5 rounded ${theme.btn}`}>Cancel</button>
              <button onClick={executeAll} className="px-3 py-1.5 rounded bg-gray-500 text-white hover:bg-gray-600" autoFocus>Execute All</button>
            </div>
          </div>
        )}

        <ul className="space-y-2">
          {suggestions.map((suggestion) => {
            const s = status[suggestion.id];
            return (
              <li
                key={suggestion.id}
                className={`p-3 rounded-lg border ${
                  s === "done" ? "bg-green-500/10 border-green-500/30"
                  : s === "failed" ? "bg-red-500/10 border-red-500/30"
                  : `${theme.border} ${theme.itemBgAlt}`
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium flex items-center gap-2">
                      {s === "done" && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                      {s === "failed" && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                      {suggestion.action}
                    </p>
                    {suggestion.reasoning && <p className={`text-xs ${theme.muted} mt-1`}>{suggestion.reasoning}</p>}
                  </div>
                  <button
                    onClick={() => void execute(suggestion)}
                    disabled={s === "running" || s === "done" || runningAll}
                    className="px-3 py-1.5 rounded text-xs font-medium bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-50 flex items-center gap-1 flex-shrink-0"
                  >
                    {s === "running" ? <><Loader2 className="w-3 h-3 animate-spin" />Running</>
                      : s === "done" ? "Done"
                      : s === "failed" ? "Retry"
                      : "Execute"}
                  </button>
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
  theme: Theme;
  label?: string;
}

export const AIAssistButton = ({ onClick, loading, theme, label = "AI Assist" }: AIAssistButtonProps) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      theme.accent === "text-gray-400"
        ? "bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 border border-gray-500/50"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
    } disabled:opacity-50`}
  >
    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
    {label}
  </button>
);
