import { RefreshCw, Sparkles } from "lucide-react";
import type { NeedManager } from "../../hooks/useNeedManager";
import { AIAssistant } from "../AIAssistant";
import { HistoryPanel } from "../HistoryPanel";
import { Button, Hint, IconButton } from "../ui";

/** Next-step suggestions for the open need. */
export const AssistantSection = ({ manager }: { manager: NeedManager }) => {
  const need = manager.activeNeed;
  if (!need) return null;
  const suggestions = manager.needAISuggestions;
  const loading = manager.isAILoading("need");

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-base font-semibold">Assistant</h3>
          <p className="text-sm text-ink-2 truncate">For “{need.name}”</p>
        </div>
        {suggestions && (
          <IconButton label="Get fresh suggestions (uses AI)" onClick={() => manager.requestNeedAIAssist(need.id)} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </IconButton>
        )}
      </div>

      {suggestions ? (
        suggestions.suggestions.length > 0 ? (
          <AIAssistant key={need.id} suggestions={suggestions.suggestions} reasoning={suggestions.reasoning} onExecuteAction={manager.executeAIAction} />
        ) : (
          <Hint>No steps to suggest yet. Add predictions or run analyses, then get fresh suggestions.</Hint>
        )
      ) : (
        <div className="space-y-1.5">
          <Button block onClick={() => manager.requestNeedAIAssist(need.id)} loading={loading} icon={<Sparkles className="w-4 h-4" />}>
            {loading ? "Thinking…" : "Suggest next steps"}
          </Button>
          <Hint>Reads the tree and proposes what to branch, analyze or combine next. You choose which steps to run. Uses AI.</Hint>
        </div>
      )}
    </div>
  );
};

export const HistorySection = ({ manager }: { manager: NeedManager }) => (
  <HistoryPanel history={manager.history} onUndo={manager.undo} onRedo={manager.redo} onClear={manager.clearHistory} />
);
