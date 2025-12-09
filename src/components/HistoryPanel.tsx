import { motion, AnimatePresence } from "framer-motion";
import { History, Undo2, Redo2, Trash2 } from "lucide-react";
import type { HistoryState } from "../types";

interface HistoryPanelProps {
  history: HistoryState;
  theme: any;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
}

export const HistoryPanel = ({ history, theme, onUndo, onRedo, onClear }: HistoryPanelProps) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'branch':
        return '🌿';
      case 'add_child':
        return '➕';
      case 'delete_expression':
        return '🗑️';
      case 'cross_pollinate':
        return '🔀';
      case 'add_need':
        return '📋';
      case 'delete_need':
        return '❌';
      default:
        return '•';
    }
  };

  return (
    <div className={`flex flex-col h-full ${theme.card}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${theme.border}`}>
        <div className="flex items-center gap-2">
          <History className={`w-4 h-4 ${theme.accent}`} />
          <h3 className={`font-semibold ${theme.text}`}>History</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!history.canUndo}
            className={`p-1.5 rounded ${theme.hover} disabled:opacity-40 disabled:cursor-not-allowed`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!history.canRedo}
            className={`p-1.5 rounded ${theme.hover} disabled:opacity-40 disabled:cursor-not-allowed`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          {history.past.length > 0 && (
            <button
              onClick={onClear}
              className={`p-1.5 rounded ${theme.hover} text-red-400 hover:text-red-300`}
              title="Clear history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* History list */}
      <div className="flex-1 overflow-y-auto">
        {history.past.length === 0 ? (
          <div className={`flex flex-col items-center justify-center h-full px-4 text-center ${theme.muted}`}>
            <History className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">No actions yet</p>
            <p className="text-xs mt-1">Your actions will appear here</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            <AnimatePresence>
              {[...history.past].reverse().map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.02 }}
                  className={`p-2.5 rounded-lg border ${theme.border} ${theme.itemBg} ${theme.hover}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg leading-none">{getActionIcon(action.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${theme.text} truncate`}>
                        {action.description}
                      </p>
                      <p className={`text-[10px] ${theme.muted} mt-0.5`}>
                        {formatTime(action.timestamp)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer with shortcuts */}
      <div className={`px-4 py-2 border-t ${theme.border} ${theme.itemBg}`}>
        <div className="flex items-center justify-between text-[10px] text-gray-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700">Ctrl</kbd>
              {" + "}
              <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700">Z</kbd>
              {" Undo"}
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700">Ctrl</kbd>
              {" + "}
              <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700">Y</kbd>
              {" Redo"}
            </span>
          </div>
          <span>{history.past.length} actions</span>
        </div>
      </div>
    </div>
  );
};
