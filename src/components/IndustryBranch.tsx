import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronRight,
  GitBranch,
  Layers,
  TrendingUp,
  Shuffle,
  Plus,
  Loader2,
  BookOpen,
  Microscope,
  Briefcase,
  UserPlus,
  TreeDeciduous,
  GripVertical,
  Target,
  Rocket,
} from "lucide-react";
import type { IndustryExpression } from "../types";
import type { Theme } from "../config/theme";
import { ContextMenu } from "./ContextMenu";
import type { MatchScoreResult } from "../utils/match-score";
import { getMatchScoreColor, getMatchScoreLabel } from "../utils/match-score";

const DRAG_MIME = "application/x-itropa-expression";

interface IndustryBranchProps {
  expr: IndustryExpression;
  depth: number;
  needId: string;
  isExpanded: boolean;
  isBranching: boolean;
  isCrossSelected: boolean;
  /** Rendered faded: scored below the profile filter but kept for its children. */
  dimmed?: boolean;
  theme: Theme;
  mechanismLoading: boolean;
  deepDiveLoading: boolean;
  appConceptsLoading?: boolean;
  hasMechanism?: boolean;
  hasDeepDive?: boolean;
  hasAppConcepts?: boolean;
  matchScore?: MatchScoreResult | null;  // Match score against user's constraints
  viewDensity?: "compact" | "comfortable";
  onToggleExpand: () => void;
  onBranch: () => void;
  onFetchMechanism: () => void;
  onFetchDeepDive: () => void;
  onFetchAppConcepts: () => void;
  onToggleCross: () => void;
  /** Another industry was dropped onto this one. */
  onDropCross: (dragged: IndustryExpression) => void;
  onAddSubIndustry: () => void;
  onDelete?: () => void;
  renderBranch: (child: IndustryExpression, depth: number, needId: string) => JSX.Element | null;
}

export const IndustryBranch = ({
  expr,
  depth,
  needId,
  isExpanded,
  isBranching,
  isCrossSelected,
  dimmed,
  theme,
  mechanismLoading,
  deepDiveLoading,
  appConceptsLoading,
  hasMechanism,
  hasDeepDive,
  hasAppConcepts,
  matchScore,
  viewDensity = "comfortable",
  onToggleExpand,
  onBranch,
  onFetchMechanism,
  onFetchDeepDive,
  onFetchAppConcepts,
  onToggleCross,
  onDropCross,
  onAddSubIndustry,
  onDelete,
  renderBranch,
}: IndustryBranchProps) => {
  const hasChildren = (expr.children?.length ?? 0) > 0;
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);
  
  // Calculate tree depth recursively
  const calculateDepth = (children: IndustryExpression[] = []): number => {
    if (children.length === 0) return 0;
    return 1 + Math.max(...children.map(child => calculateDepth(child.children)));
  };
  
  const treeDepth = calculateDepth(expr.children);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // nested branches: only the innermost card opens a menu
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData(DRAG_MIME, JSON.stringify(expr));
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes(DRAG_MIME)) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    setIsDropTarget(true);
  };

  const handleDragLeave = () => {
    setIsDropTarget(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTarget(false);
    
    try {
      const raw = e.dataTransfer.getData(DRAG_MIME);
      if (!raw) return;
      const draggedExpr = JSON.parse(raw) as IndustryExpression;
      if (draggedExpr?.id && draggedExpr.id !== expr.id) onDropCross(draggedExpr);
    } catch (err) {
      console.error('Drop failed:', err);
    }
  };

  const densityClasses = viewDensity === "compact" 
    ? { padding: "p-2", textSize: "text-xs", iconSize: "w-3 h-3", spacing: "space-y-1", gap: "gap-1" }
    : { padding: "p-3", textSize: "text-sm", iconSize: "w-3.5 h-3.5", spacing: "space-y-2", gap: "gap-2" };

  return (
    <>
    <div
      className="relative scroll-mt-4"
      data-expr-id={expr.id}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <motion.div
        layout
        onContextMenu={handleContextMenu}
        className={`${densityClasses.padding} rounded-lg border transition-all cursor-move touch-manipulation ${
          isDragging
            ? "opacity-50 scale-95"
            : isDropTarget
            ? "ring-2 ring-amber-500 bg-amber-500/10 border-amber-500 scale-105"
            : isCrossSelected
            ? "bg-amber-500/15 border-amber-500"
            : theme.cardHover
        } ${expr.userAdded ? "ring-1 ring-emerald-500/30" : ""} ${dimmed ? "opacity-50" : ""}`}
      >
        <div className={`flex items-start justify-between ${densityClasses.gap} ${viewDensity === "compact" ? "mb-1" : "mb-2"}`}>
            <div className={`flex items-center ${densityClasses.gap} flex-1`}>
              <span title="Drag to cross-pollinate">
                <GripVertical className={`${densityClasses.iconSize} ${theme.muted} flex-shrink-0 cursor-grab active:cursor-grabbing`} />
              </span>
              <Sparkles className={`${densityClasses.iconSize} ${theme.accent} flex-shrink-0`} />
              <span className={`font-medium ${densityClasses.textSize}`}>{expr.name}</span>
              
              {/* Status Badges */}
              <div className="flex items-center gap-1 ml-2">
                {/* Match Score badge - only show if we have a score */}
                {matchScore && (
                  <span
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] border ${getMatchScoreColor(matchScore.score)}`}
                    title={`${getMatchScoreLabel(matchScore.score)}: ${matchScore.reasons.join(', ')}`}
                  >
                    <Target className="w-2.5 h-2.5" />
                    {matchScore.score}%
                  </span>
                )}

                {/* User-added badge */}
                {expr.userAdded && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <UserPlus className="w-2.5 h-2.5" />
                    User
                  </span>
                )}

                {/* Branch depth badge */}
                {treeDepth > 0 && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-gray-500/20 text-gray-300 border border-gray-500/30">
                    <TreeDeciduous className="w-2.5 h-2.5" />
                    {treeDepth}
                  </span>
                )}

                {/* Mechanism analyzed badge */}
                {hasMechanism && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-gray-500/20 text-gray-300 border border-gray-500/30" title="Mechanism analyzed">
                    <Microscope className="w-2.5 h-2.5" />
                  </span>
                )}

                {/* Deep dive analyzed badge */}
                {hasDeepDive && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-gray-600/20 text-gray-300 border border-gray-600/30" title="Deep dive available">
                    <Briefcase className="w-2.5 h-2.5" />
                  </span>
                )}

                {hasAppConcepts && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-gray-600/20 text-gray-300 border border-gray-600/30" title="App concepts available">
                    <Rocket className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
            </div>
            {hasChildren && (
              <button
                onClick={onToggleExpand}
                className={`p-1 rounded ${theme.muted} ${theme.hover}`}
                aria-label={isExpanded ? `Collapse ${expr.name}` : `Expand ${expr.name}`}
                aria-expanded={isExpanded}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
          <p className={`${viewDensity === "compact" ? "text-[11px]" : "text-xs"} ${theme.muted} ${viewDensity === "compact" ? "mb-1" : "mb-2"}`}>{expr.mutation}</p>

          {(expr.inspirations?.length ?? 0) > 0 && (
            <div className={`mb-2 p-2 rounded ${theme.itemBg}`}>
              <p className={`text-xs font-medium ${theme.muted} mb-1 flex items-center gap-1`}>
                <BookOpen className="w-3 h-3" />
                Prior Art:
              </p>
              <div className="space-y-1">
                {expr.inspirations.map((ins, i) => (
                  <div key={i} className="text-xs">
                    <span className={theme.accent}>{ins.source}</span>
                    <span className={theme.muted}> → {ins.mechanism}</span>
                    {ins.twist && <span className="text-emerald-400"> → {ins.twist}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`flex flex-wrap gap-1.5 ${viewDensity === "compact" ? "mt-1.5" : "mt-2"}`}>
            <button
              onClick={onBranch}
              disabled={isBranching}
              className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${theme.btn} transition-colors disabled:opacity-50 touch-manipulation min-h-[32px] md:min-h-0`}
            >
              {isBranching ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <GitBranch className="w-3 h-3" />
              )}
              Branch
            </button>
            <button
              onClick={onFetchMechanism}
              disabled={mechanismLoading}
              className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${theme.btn} transition-colors disabled:opacity-50 touch-manipulation min-h-[32px] md:min-h-0`}
            >
              {mechanismLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Layers className="w-3 h-3" />}
              Mechanism
            </button>
            <button
              onClick={onFetchDeepDive}
              disabled={deepDiveLoading}
              className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${theme.btn} transition-colors disabled:opacity-50 touch-manipulation min-h-[32px] md:min-h-0`}
            >
              {deepDiveLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <TrendingUp className="w-3 h-3" />}
              Dive
            </button>
            <button
              onClick={onToggleCross}
              className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                isCrossSelected ? "bg-amber-500/20 text-amber-300" : theme.btn
              } transition-colors touch-manipulation min-h-[32px] md:min-h-0`}
              title="Click to select, or drag-and-drop predictions to cross-pollinate"
            >
              <Shuffle className="w-3 h-3" />
              {isCrossSelected ? "Selected" : "Cross"}
            </button>
            <button
              onClick={onFetchAppConcepts}
              disabled={appConceptsLoading}
              className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${theme.btn} transition-colors disabled:opacity-50 touch-manipulation min-h-[32px] md:min-h-0`}
              title="Generate buildable app concepts for this industry"
            >
              {appConceptsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Rocket className="w-3 h-3" />}
              Apps
            </button>
            <button
              onClick={onAddSubIndustry}
              className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${theme.btn} transition-colors touch-manipulation min-h-[32px] md:min-h-0`}
              aria-label={`Add sub-industry to ${expr.name}`}
              title="Add sub-industry"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      </div>
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`${viewDensity === "compact" ? "mt-1 ml-4 pl-2" : "mt-2 ml-6 pl-3"} border-l-2 border-gray-500/20 ${densityClasses.spacing}`}
          >
            {(expr.children ?? []).map((child) => renderBranch(child, depth + 1, needId))}
          </motion.div>
        )}
      </AnimatePresence>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onBranch={onBranch}
          onMechanism={onFetchMechanism}
          onDeepDive={onFetchDeepDive}
          onAppConcepts={onFetchAppConcepts}
          onCrossPollinate={onToggleCross}
          onAddChild={onAddSubIndustry}
          onDelete={onDelete}
          theme={theme}
        />
      )}
    </>
  );
};
