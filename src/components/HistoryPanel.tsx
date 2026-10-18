import { History, Undo2, Redo2, Trash2, GitBranch, Plus, X, Circle } from "lucide-react";
import type { HistoryState } from "../types";
import { IconButton, Hint } from "./ui";

interface HistoryPanelProps {
  history: HistoryState;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
}

const formatTime = (timestamp: number) => {
  const mins = Math.floor((Date.now() - timestamp) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(timestamp).toLocaleDateString();
};

const ICONS: Record<string, typeof GitBranch> = {
  branch: GitBranch,
  add_child: Plus,
  delete_expression: Trash2,
  close_need: X,
};

export const HistoryPanel = ({ history, onUndo, onRedo, onClear }: HistoryPanelProps) => (
  <div className="flex flex-col h-full">
    <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-line">
      <h3 className="font-semibold flex items-center gap-2">
        <History className="w-4 h-4 text-accent" aria-hidden /> History
      </h3>
      <div className="flex items-center">
        <IconButton label="Undo (Ctrl+Z)" onClick={onUndo} disabled={!history.canUndo}><Undo2 className="w-4 h-4" /></IconButton>
        <IconButton label="Redo (Ctrl+Y)" onClick={onRedo} disabled={!history.canRedo}><Redo2 className="w-4 h-4" /></IconButton>
        {history.past.length > 0 && (
          <IconButton label="Clear history (keeps your research)" onClick={onClear} className="hover:text-bad">
            <Trash2 className="w-4 h-4" />
          </IconButton>
        )}
      </div>
    </div>

    <div className="flex-1 overflow-y-auto">
      {history.past.length === 0 ? (
        <div className="px-4 py-6">
          <Hint>Branching, adding, deleting and closing show up here so you can undo them.</Hint>
        </div>
      ) : (
        <ol className="p-3 space-y-1">
          {[...history.past].reverse().map((action) => {
            const Icon = ICONS[action.type] ?? Circle;
            return (
              <li key={action.id} className="flex items-start gap-2.5 px-2 py-2 rounded-control">
                <Icon className="w-4 h-4 text-ink-2 mt-0.5 shrink-0" aria-hidden />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{action.description}</p>
                  <p className="text-xs text-ink-2">{formatTime(action.timestamp)}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  </div>
);
