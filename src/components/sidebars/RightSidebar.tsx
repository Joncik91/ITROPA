/**
 * Right sidebar component for the HomePage.
 * Contains history panel and AI assistant with suggestions.
 */

import { ChevronRight, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { HistoryPanel } from "../HistoryPanel";
import { AIAssistant } from "../AIAssistant";
import type { NeedManager } from "../../hooks/useNeedManager";
import type { Theme } from "../../config/theme";

export interface RightSidebarProps {
  theme: Theme;
  manager: NeedManager;
  isOpen: boolean;
  onClose: () => void;
}

export const RightSidebar = ({ theme, manager, isOpen, onClose }: RightSidebarProps) => {
  const need = manager.activeNeed;
  if (!need) return null;

  const suggestions = manager.needAISuggestions;
  const loading = manager.aiLoadingScope === "need";

  return (
    <aside
      className={`w-80 border-l ${theme.border} flex-shrink-0 flex-col
        md:flex ${isOpen ? 'flex fixed inset-y-0 right-0 z-40 shadow-2xl' : 'hidden'}
        ${theme.card}`}
      aria-label="History and AI assistant"
    >
      <button
        onClick={onClose}
        className={`md:hidden absolute top-4 right-4 z-10 p-2 rounded-lg ${theme.hover}`}
        aria-label="Close assistant panel"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <div className="h-1/2 border-b border-gray-700 overflow-hidden">
        <HistoryPanel
          history={manager.history}
          theme={theme}
          onUndo={manager.undo}
          onRedo={manager.redo}
          onClear={manager.clearHistory}
        />
      </div>

      <div className="h-1/2 overflow-y-auto">
        <div className="p-4 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold mb-1">AI Assistant</h3>
              <p className={`text-xs ${theme.muted} truncate`}>Working on: {need.name}</p>
            </div>
            {suggestions && (
              <button
                onClick={() => manager.requestNeedAIAssist(need.id)}
                disabled={manager.aiLoading}
                className={`p-1.5 rounded ${theme.hover} disabled:opacity-40`}
                title="Refresh suggestions"
                aria-label="Refresh suggestions"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            )}
          </div>

          {suggestions ? (
            suggestions.suggestions.length > 0 ? (
              <AIAssistant
                key={need.id}
                suggestions={suggestions.suggestions}
                reasoning={suggestions.reasoning}
                theme={theme}
                onExecuteAction={manager.executeAIAction}
              />
            ) : (
              <p className={`text-xs ${theme.muted}`}>No actionable suggestions. Try refreshing after adding predictions or analyses.</p>
            )
          ) : (
            <button
              onClick={() => manager.requestNeedAIAssist(need.id)}
              disabled={manager.aiLoading}
              className={`w-full px-3 py-2 rounded-lg text-xs ${theme.btn} hover:bg-gray-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Suggest Next Steps
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
