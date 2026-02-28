/**
 * Right sidebar component for the HomePage.
 * Contains history panel and AI assistant with suggestions.
 */

import { ChevronRight, Loader2, Sparkles } from "lucide-react";
import { HistoryPanel } from "../HistoryPanel";
import type { HomePageManager, AIActionSuggestion } from "../../types";
import type { Theme } from "../../config/theme";

export interface RightSidebarProps {
  theme: Theme;
  manager: HomePageManager;
  isOpen: boolean;
  onClose: () => void;
}

export const RightSidebar = ({
  theme,
  manager,
  isOpen,
  onClose
}: RightSidebarProps) => {
  if (!manager.activeNeed) return null;

  return (
    <div className={`w-80 border-l ${theme.border} flex-shrink-0 flex flex-col
      md:block ${isOpen ? 'block fixed inset-y-0 right-0 z-40 shadow-2xl' : 'hidden'}
      ${theme.card}`}>
      {/* Mobile close button */}
      <button
        onClick={onClose}
        className={`md:hidden absolute top-4 right-4 z-10 p-2 rounded-lg ${theme.hover}`}
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
      </button>

      {/* History Panel - Top Half */}
      <div className="h-1/2 border-b border-gray-700 overflow-hidden">
        <HistoryPanel
          history={manager.history}
          theme={theme}
          onUndo={manager.undo}
          onRedo={manager.redo}
          onClear={manager.clearHistory}
        />
      </div>

      {/* AI Assistant - Bottom Half */}
      <div className="h-1/2 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Context Header */}
          <div>
            <h3 className="text-sm font-semibold mb-1">AI Assistant</h3>
            <p className={`text-xs ${theme.muted}`}>Working on: {manager.selected?.name || manager.activeNeed.name}</p>
          </div>

          {/* Need-level AI Suggestions */}
          {manager.needAISuggestions && (
            <AISuggestionList
              title="Suggested Next Steps"
              suggestions={manager.needAISuggestions.suggestions}
              theme={theme}
              onExecute={manager.executeAIAction}
              disabled={manager.aiLoading}
            />
          )}

          {/* Mechanism AI Suggestions */}
          {manager.mechanism && manager.mechanismAISuggestions && (
            <AISuggestionList
              title="Mechanism Insights"
              suggestions={manager.mechanismAISuggestions.suggestions}
              theme={theme}
              onExecute={manager.executeAIAction}
              disabled={manager.aiLoading}
            />
          )}

          {/* Deep Dive AI Suggestions */}
          {manager.deepDive && manager.deepDiveAISuggestions && (
            <AISuggestionList
              title="Deep Dive Actions"
              suggestions={manager.deepDiveAISuggestions.suggestions}
              theme={theme}
              onExecute={manager.executeAIAction}
              disabled={manager.aiLoading}
              buttonHoverClass="hover:bg-gray-600/20"
            />
          )}

          {/* Request AI Assistance Buttons */}
          {!manager.needAISuggestions && !manager.mechanismAISuggestions && !manager.deepDiveAISuggestions && (
            <div className="space-y-2">
              <button
                onClick={() => manager.requestNeedAIAssist(manager.activeNeed!.id)}
                disabled={manager.aiLoading}
                className={`w-full px-3 py-2 rounded-lg text-xs ${theme.btn} hover:bg-gray-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50`}
              >
                {manager.aiLoading ? (
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/** Reusable AI suggestion list component */
interface AISuggestionListProps {
  title: string;
  suggestions: AIActionSuggestion[];
  theme: Theme;
  onExecute: (suggestion: AIActionSuggestion) => Promise<void>;
  disabled: boolean;
  buttonHoverClass?: string;
}

const AISuggestionList = ({
  title,
  suggestions,
  theme,
  onExecute,
  disabled,
  buttonHoverClass = "hover:bg-gray-500/20"
}: AISuggestionListProps) => (
  <div className="space-y-3">
    <div className="text-xs font-medium text-gray-300">{title}</div>
    {suggestions.map((suggestion) => (
      <div key={suggestion.id} className={`p-3 rounded-lg border ${theme.border} ${theme.card}`}>
        <div className="text-xs font-medium mb-1">{suggestion.action}</div>
        <div className={`text-xs ${theme.muted} mb-2`}>{suggestion.reasoning}</div>
        <button
          onClick={() => onExecute(suggestion)}
          disabled={disabled}
          className={`w-full px-3 py-1.5 rounded text-xs ${theme.btn} ${buttonHoverClass} transition-colors disabled:opacity-50`}
        >
          Execute
        </button>
      </div>
    ))}
  </div>
);
