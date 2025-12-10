import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, PlayCircle, AlertCircle } from "lucide-react";
import toast from 'react-hot-toast';
import type { AIActionSuggestion } from "../types";
import type { Theme } from "../config/theme";

interface AIAssistantProps {
  suggestions: AIActionSuggestion[];
  reasoning: string;
  theme: Theme;
  onExecuteAction: (suggestion: AIActionSuggestion) => Promise<void>;
}

export const AIAssistant = ({ suggestions, reasoning, theme, onExecuteAction }: AIAssistantProps) => {
  const [executing, setExecuting] = useState<string | null>(null);
  const [executed, setExecuted] = useState<Set<string>>(new Set());
  const [executingAll, setExecutingAll] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [currentExecutionIndex, setCurrentExecutionIndex] = useState(0);

  const handleExecute = async (suggestion: AIActionSuggestion) => {
    console.log("=== AIAssistant.handleExecute called ===");
    console.log("Suggestion ID:", suggestion.id);
    console.log("Action Type:", suggestion.actionType);
    setExecuting(suggestion.id);
    try {
      await onExecuteAction(suggestion);
      setExecuted(new Set([...executed, suggestion.id]));
      console.log("=== Action completed successfully ===");
    } catch (e: any) {
      console.error("Action execution failed:", e);
      throw e;
    } finally {
      setExecuting(null);
    }
  };

  const handleExecuteAll = async () => {
    setShowConfirmDialog(false);
    setExecutingAll(true);
    setCurrentExecutionIndex(0);
    
    const remainingSuggestions = suggestions.filter(s => !executed.has(s.id));
    const totalCount = remainingSuggestions.length;
    
    const toastId = toast.loading(`Executing 0/${totalCount} actions...`);
    
    for (let i = 0; i < remainingSuggestions.length; i++) {
      const suggestion = remainingSuggestions[i];
      setCurrentExecutionIndex(i + 1);
      toast.loading(`Executing ${i + 1}/${totalCount}: ${suggestion.action}...`, { id: toastId });
      
      try {
        await onExecuteAction(suggestion);
        setExecuted(prev => new Set([...prev, suggestion.id]));
      } catch (e: any) {
        console.error(`Failed to execute action ${i + 1}:`, e);
        toast.error(`Failed at ${i + 1}/${totalCount}: ${suggestion.action}`, { id: toastId });
        setExecutingAll(false);
        setCurrentExecutionIndex(0);
        return; // Stop on first error
      }
    }
    
    toast.success(`Completed all ${totalCount} actions!`, { id: toastId });
    setExecutingAll(false);
    setCurrentExecutionIndex(0);
  };

  const remainingCount = suggestions.filter(s => !executed.has(s.id)).length;

  return (
    <div className="space-y-4">
      {/* AI Reasoning */}
      <div className={`p-3 rounded-lg ${theme.itemBg} border ${theme.border}`}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className={`w-4 h-4 ${theme.accent}`} />
          <p className="text-sm font-medium">AI Analysis</p>
        </div>
        <p className={`text-sm ${theme.muted}`}>{reasoning}</p>
      </div>

      {/* Suggested Actions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium">Suggested Actions:</p>
          {remainingCount > 0 && (
            <button
              onClick={() => setShowConfirmDialog(true)}
              disabled={executingAll}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                executingAll
                  ? "bg-gray-500/50 text-white cursor-not-allowed"
                  : "bg-gray-500 text-white hover:bg-gray-600"
              }`}
            >
              {executingAll ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Executing {currentExecutionIndex}/{remainingCount}...
                </>
              ) : (
                <>
                  <PlayCircle className="w-3.5 h-3.5" />
                  Execute All ({remainingCount})
                </>
              )}
            </button>
          )}
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowConfirmDialog(false)}>
            <div
              className={`${theme.modalBg} rounded-lg p-6 max-w-md mx-4 border ${theme.border}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium mb-1">Execute All Actions?</h3>
                  <p className={`text-sm ${theme.muted}`}>
                    This will execute {remainingCount} action{remainingCount !== 1 ? 's' : ''} in sequence. 
                    The process will stop if any action fails.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className={`px-4 py-2 rounded text-sm font-medium ${theme.btn} transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteAll}
                  className="px-4 py-2 rounded text-sm font-medium bg-gray-500 text-white hover:bg-gray-600 transition-colors"
                >
                  Execute All
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`p-3 rounded-lg border ${theme.border} ${
                executed.has(suggestion.id) ? "bg-green-500/10 border-green-500/30" : theme.itemBgAlt
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium flex items-center gap-2">
                    {executed.has(suggestion.id) && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                    {suggestion.action}
                  </p>
                  <p className={`text-xs ${theme.muted} mt-1`}>{suggestion.reasoning}</p>
                </div>
                <button
                  onClick={() => handleExecute(suggestion)}
                  disabled={executing === suggestion.id || executed.has(suggestion.id) || executingAll}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    executed.has(suggestion.id)
                      ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                      : "bg-gray-500 text-white hover:bg-gray-600"
                  } disabled:opacity-50 flex items-center gap-1`}
                >
                  {executing === suggestion.id ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Running...
                    </>
                  ) : executed.has(suggestion.id) ? (
                    "Done"
                  ) : (
                    "Execute"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
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
    {loading ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : (
      <Sparkles className="w-4 h-4" />
    )}
    {label}
  </button>
);
