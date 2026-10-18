import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Check,
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
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import type { IndustryExpression } from "../types";
import { ContextMenu } from "./ContextMenu";
import type { MatchScoreResult } from "../utils/match-score";
import { getMatchScoreTone, getMatchScoreLabel } from "../utils/match-score";
import { INDUSTRY_ACTIONS, type IndustryActionId } from "../config/actions";
import { ActionSheet, Badge, IconButton, cx, type ActionItem } from "./ui";
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
  const [sheetOpen, setSheetOpen] = useState(false);
  
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

  const compact = viewDensity === "compact";

  type Action = Omit<ActionItem, "label" | "description"> & { id: IndustryActionId };
  const baseActions: Action[] = [
    { id: "branch", icon: <GitBranch className="w-4 h-4" />, onSelect: onBranch, loading: isBranching, ai: true, saved: hasChildren },
    { id: "mechanism", icon: <Layers className="w-4 h-4" />, onSelect: onFetchMechanism, loading: mechanismLoading, ai: true, saved: hasMechanism },
    { id: "deepDive", icon: <TrendingUp className="w-4 h-4" />, onSelect: onFetchDeepDive, loading: deepDiveLoading, ai: true, saved: hasDeepDive },
    { id: "apps", icon: <Rocket className="w-4 h-4" />, onSelect: onFetchAppConcepts, loading: appConceptsLoading, ai: true, saved: hasAppConcepts },
    { id: "cross", icon: <Shuffle className="w-4 h-4" />, onSelect: onToggleCross, selected: isCrossSelected },
    { id: "addChild", icon: <Plus className="w-4 h-4" />, onSelect: onAddSubIndustry },
    ...(onDelete ? [{ id: "delete" as const, icon: <Trash2 className="w-4 h-4" />, onSelect: onDelete, danger: true }] : []),
  ];
  const actions: Array<ActionItem & { id: IndustryActionId }> = baseActions.map((a) => ({
    ...a,
    label: INDUSTRY_ACTIONS[a.id].label,
    description: INDUSTRY_ACTIONS[a.id].description,
  }));
  // Branching again adds more children, so "saved" doesn't apply to it in the status line.
  const sheetActions = actions.map((a) => (a.id === "branch" ? { ...a, saved: false } : a));

  const inline = actions.filter((a) => a.id !== "delete");

  return (
    <>
    <div
      className="relative scroll-mt-24"
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
        className={cx(
          "rounded-card border bg-sheet transition-[border-color,background-color,opacity,transform] touch-manipulation",
          compact ? "p-2.5" : "p-3 md:p-4",
          isDragging
            ? "opacity-50 scale-[0.98] border-line"
            : isDropTarget
            ? "ring-2 ring-pollen border-pollen bg-pollen/10"
            : isCrossSelected
            ? "border-pollen bg-pollen/5"
            : "border-line hover:border-accent/50",
          dimmed && "opacity-50",
        )}
      >
        <div className="flex items-start gap-2">
          <span title="Drag onto another industry to cross-pollinate" className="hidden md:inline-flex mt-1 text-ink-2 cursor-grab active:cursor-grabbing shrink-0">
            <GripVertical className="w-4 h-4" aria-hidden />
          </span>
          <div className="flex-1 min-w-0">
            <h4 className={cx("font-semibold break-words", compact ? "text-sm" : "text-base")}>{expr.name}</h4>
            {expr.mutation && (
              <p className={cx("text-ink-2 mt-0.5", compact ? "text-xs" : "text-sm")}>{expr.mutation}</p>
            )}
            {(matchScore || expr.userAdded || treeDepth > 0 || hasMechanism || hasDeepDive || hasAppConcepts) && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {matchScore && (
                  <Badge
                    tone={getMatchScoreTone(matchScore.score)}
                    title={`${getMatchScoreLabel(matchScore.score)} with your builder profile: ${matchScore.reasons.join("; ")}`}
                  >
                    <Target className="w-3 h-3" aria-hidden />
                    {matchScore.score}% fit
                  </Badge>
                )}
                {expr.userAdded && (
                  <Badge tone="ok" title="You added this industry">
                    <UserPlus className="w-3 h-3" aria-hidden />Yours
                  </Badge>
                )}
                {treeDepth > 0 && (
                  <Badge title={`${treeDepth} level${treeDepth === 1 ? "" : "s"} of branches below`}>
                    <TreeDeciduous className="w-3 h-3" aria-hidden />{treeDepth} deep
                  </Badge>
                )}
                {hasMechanism && <Badge title="Mechanism analysis saved"><Microscope className="w-3 h-3" aria-hidden /><span className="sr-only">Mechanism saved</span></Badge>}
                {hasDeepDive && <Badge title="Deep dive saved"><Briefcase className="w-3 h-3" aria-hidden /><span className="sr-only">Deep dive saved</span></Badge>}
                {hasAppConcepts && <Badge title="App ideas saved"><Rocket className="w-3 h-3" aria-hidden /><span className="sr-only">App ideas saved</span></Badge>}
              </div>
            )}
          </div>
          {hasChildren && (
            <IconButton
              label={isExpanded ? `Collapse ${expr.name}` : `Expand ${expr.name}`}
              aria-expanded={isExpanded}
              onClick={onToggleExpand}
              className="-mr-1 -mt-1"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </IconButton>
          )}
        </div>

        {!compact && (expr.inspirations?.length ?? 0) > 0 && (
          <div className="mt-3 p-2.5 rounded-control bg-well">
            <p className="text-xs font-medium text-ink-2 mb-1 flex items-center gap-1">
              <BookOpen className="w-3 h-3" aria-hidden />
              Built from prior art
            </p>
            <ul className="space-y-1">
              {expr.inspirations.map((ins, i) => (
                <li key={i} className="text-sm">
                  <span className="text-accent font-medium">{ins.source}</span>
                  <span className="text-ink-2">: {ins.mechanism}</span>
                  {ins.twist && <span className="text-ink"> → {ins.twist}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Phones: one button opens a sheet that explains every action. */}
        <div className="md:hidden mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex-1 min-h-[44px] rounded-control border border-line text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-ink/5 touch-manipulation"
            aria-haspopup="dialog"
          >
            {(isBranching || mechanismLoading || deepDiveLoading || appConceptsLoading)
              ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              : <MoreHorizontal className="w-4 h-4" aria-hidden />}
            Actions
          </button>
          {isCrossSelected && (
            <Badge tone="pollen"><Shuffle className="w-3 h-3" aria-hidden />Selected</Badge>
          )}
        </div>

        {/* Pointer layouts: inline buttons; tooltips carry the same explanations. */}
        <div className={cx("hidden md:flex flex-wrap gap-1.5", compact ? "mt-2" : "mt-3")}>
          {inline.map((a) => {
            const info = INDUSTRY_ACTIONS[a.id];
            const isCross = a.id === "cross";
            const status = a.loading ? "Working…" : a.saved && a.id !== "branch" ? "Saved: opens instantly." : info.ai ? "Uses AI." : "";
            return (
              <button
                key={a.id}
                type="button"
                onClick={a.onSelect}
                disabled={a.loading}
                title={`${info.description} ${status}`.trim()}
                aria-description={`${info.description} ${status}`.trim()}
                aria-label={a.id === "addChild" ? `${info.label} under ${expr.name}` : undefined}
                aria-pressed={isCross ? isCrossSelected : undefined}
                className={cx(
                  "inline-flex items-center gap-1.5 px-2.5 min-h-[32px] rounded-control border text-sm transition-colors disabled:opacity-60",
                  isCross && isCrossSelected
                    ? "border-pollen/60 bg-pollen/15 text-pollen"
                    : "border-line text-ink hover:border-accent/60 hover:bg-accent/5",
                )}
              >
                {a.loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden /> : <span className={cx(isCross ? "text-pollen" : "text-accent")}>{a.icon}</span>}
                {a.id !== "addChild" && (isCross && isCrossSelected ? "Selected" : info.label)}
                {a.saved && a.id !== "branch" && !a.loading && <Check className="w-3.5 h-3.5 text-ok" aria-hidden />}
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
      <AnimatePresence initial={false}>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={cx(
              "border-l-2 border-line overflow-hidden",
              compact ? "mt-1.5 ml-3 pl-2 space-y-1.5" : "mt-2.5 ml-3 md:ml-5 pl-3 space-y-2.5",
            )}
          >
            {(expr.children ?? []).map((child) => renderBranch(child, depth + 1, needId))}
          </motion.div>
        )}
      </AnimatePresence>
      <ActionSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={expr.name}
        description="Each action explains what it does before it runs."
        actions={sheetActions}
      />
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
        />
      )}
    </>
  );
};
