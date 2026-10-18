import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown } from "lucide-react";
import type { IndustryExpression, Era } from "../types";
import { isFutureEra } from "../utils/need-model";
import { Hint, cx } from "./ui";

interface MiniMapProps {
  eras: Era[];
  onNodeClick: (exprId: string) => void;
}

/** Compact index of the prediction tree; selecting a node reveals it in the main tree. */
export const MiniMap = ({ eras, onNodeClick }: MiniMapProps) => {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleCollapse = (id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderExpression = (expr: IndustryExpression, depth: number = 0) => {
    const hasChildren = !!expr.children?.length;
    const isCollapsed = collapsed.has(expr.id);

    return (
      <div key={expr.id}>
        <div
          className="flex items-center gap-1.5 min-h-[44px] md:min-h-[32px] pr-2 hover:bg-ink/5 cursor-pointer group rounded-control"
          style={{ paddingLeft: `${depth * 14 + 4}px` }}
          role="button"
          tabIndex={0}
          title={`Jump to ${expr.name}`}
          onClick={() => onNodeClick(expr.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onNodeClick(expr.id);
            }
          }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapse(expr.id);
              }}
              onKeyDown={(e) => e.stopPropagation()}
              className="w-8 h-8 md:w-6 md:h-6 flex items-center justify-center rounded-control text-ink-2 hover:bg-ink/10 shrink-0"
              aria-label={isCollapsed ? `Expand ${expr.name}` : `Collapse ${expr.name}`}
              aria-expanded={!isCollapsed}
            >
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span className="w-8 md:w-6 shrink-0" />
          )}
          <span
            aria-hidden
            className={cx(
              "w-2 h-2 rounded-full shrink-0",
              expr.userAdded ? "bg-ok" : hasChildren ? "bg-accent" : "border border-ink-2",
            )}
          />
          <span className="text-sm truncate group-hover:text-accent transition-colors">{expr.name}</span>
        </div>

        <AnimatePresence initial={false}>
          {hasChildren && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              {expr.children?.map(child => renderExpression(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const futureEra = eras.find(isFutureEra);
  const expressions = futureEra?.expressions as IndustryExpression[] | undefined;
  if (!expressions?.length) return null;

  return (
    <div className="space-y-2">
      <Hint>Tap a node to jump to it in the tree.</Hint>
      <div className="border border-line rounded-card bg-well/50 overflow-hidden">
        <div className="max-h-[420px] overflow-y-auto p-1">
          {expressions.map(expr => renderExpression(expr, 0))}
        </div>
        <div className="px-3 py-2 border-t border-line flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-2">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent" />Has branches</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full border border-ink-2" />Leaf</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-ok" />Added by you</span>
          <span className="ml-auto">{expressions.length} roots</span>
        </div>
      </div>
    </div>
  );
};
