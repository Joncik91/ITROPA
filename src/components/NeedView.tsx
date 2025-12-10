import { useState } from "react";
import { Plus, Clock, List } from "lucide-react";
import type { Need, IndustryExpression } from "../types";
import type { Theme } from "../config/theme";
import { getIcon } from "../config/constants";
import { TimelineView } from "./TimelineView";

interface NeedViewProps {
  need: Need;
  theme: Theme;
  dark: boolean;
  isPriorArtOpen?: boolean;
  onTogglePriorArt?: () => void;
  renderBranch: (expr: IndustryExpression, depth: number, needId: string) => JSX.Element;
  onAddPrediction: () => void;
  onFetchNeed: (needName: string) => void;
  aiSuggestions?: any;
  onAISuggest?: () => void;
  aiLoading?: boolean;
  onExecuteAction?: (suggestion: any) => Promise<void>;
}

export const NeedView = ({
  need,
  theme,
  dark,
  renderBranch,
  onAddPrediction,
  onFetchNeed,
}: NeedViewProps) => {
  const Icon = getIcon(need.icon);
  const [viewMode, setViewMode] = useState<"tree" | "timeline">("tree");

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className={`p-2 rounded-lg ${dark ? "bg-gray-500/20" : "bg-gray-100"}`}>
            <Icon className={`w-5 h-5 ${theme.accent}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-medium text-base md:text-lg truncate">{need.name}</h2>
          <p className={`text-xs md:text-sm ${theme.muted}`}>{need.description}</p>
        </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className={`flex items-center rounded-lg border ${theme.border} overflow-hidden flex-1 md:flex-initial`}>
            <button
              onClick={() => setViewMode("tree")}
              className={`flex-1 md:flex-initial px-3 py-2 text-xs flex items-center justify-center gap-1.5 transition-colors touch-manipulation ${
                viewMode === "tree" ? "bg-gray-500/20 text-gray-300" : theme.hover
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Tree
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`flex-1 md:flex-initial px-3 py-2 text-xs flex items-center justify-center gap-1.5 transition-colors touch-manipulation ${
                viewMode === "timeline" ? "bg-gray-500/20 text-gray-300" : theme.hover
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Timeline
            </button>
          </div>
        </div>
      </div>

      {viewMode === "timeline" ? (
        <TimelineView need={need} theme={theme} dark={dark} />
      ) : (
        <div className="space-y-4">
          {need.eras.map((era, i) => {
            const isFuture = era.name.includes("2025");
            return (
              <div key={i} className={`pl-4 border-l-2 ${theme.border}`}>
                <p className={`text-xs font-medium mb-2 ${isFuture ? theme.accent : theme.muted}`}>
                  {era.name}
                </p>
                {isFuture ? (
                  <div className="space-y-2">
                    {(era.expressions as IndustryExpression[]).map(expr => renderBranch(expr, 0, need.id))}
                    <button 
                      onClick={onAddPrediction}
                      className={`text-xs px-3 py-1.5 rounded-lg border border-dashed ${theme.borderDashed} flex items-center gap-1`}
                    >
                      <Plus className="w-3 h-3" />
                      Add prediction
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {(era.expressions as string[]).map((expr, j) => (
                      <span key={j} className={`text-xs px-2 py-1 rounded-lg ${theme.itemBgAlt}`}>
                        {expr}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {need.relatedNeeds && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className={`text-xs ${theme.muted} mb-2`}>Explore related:</p>
          <div className="flex flex-wrap gap-2">
            {need.relatedNeeds.map((r: string, i: number) => (
              <button
                key={i}
                onClick={() => onFetchNeed(r)}
                className={`text-xs px-2 py-1 rounded ${theme.itemBgAlt} ${theme.hover} transition-colors cursor-pointer`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
