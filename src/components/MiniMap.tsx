import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, ChevronRight, ChevronDown } from "lucide-react";
import type { IndustryExpression, Era } from "../types";
import type { Theme } from "../config/theme";

interface MiniMapProps {
  eras: Era[];
  theme: Theme;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  onNodeClick?: (exprId: string) => void;
}

export const MiniMap = ({ eras, theme, onNodeClick }: MiniMapProps) => {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleCollapse = (id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderExpression = (expr: IndustryExpression, depth: number = 0) => {
    const hasChildren = expr.children && expr.children.length > 0;
    const isCollapsed = collapsed.has(expr.id);
    const indent = depth * 12;

    return (
      <div key={expr.id}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex items-center gap-1 py-1.5 px-2 ${theme.hover} cursor-pointer group`}
          style={{ paddingLeft: `${indent + 8}px` }}
          onClick={() => onNodeClick?.(expr.id)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapse(expr.id);
              }}
              className="p-0.5 rounded hover:bg-gray-500/20"
            >
              {isCollapsed ? (
                <ChevronRight className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          )}
          
          {!hasChildren && <div className="w-4" />}
          
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            expr.userAdded 
              ? "bg-emerald-500" 
              : hasChildren 
                ? "bg-gray-500" 
                : "bg-gray-600"
          }`} />
          
          <span className={`text-xs truncate ${theme.text} group-hover:text-gray-400 transition-colors`}>
            {expr.name}
          </span>
        </motion.div>

        <AnimatePresence>
          {hasChildren && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {expr.children?.map(child => renderExpression(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const futureEra = eras.find(era => era.name.includes("2025") || era.name.includes("Post-AI"));
  const expressions = futureEra?.expressions as IndustryExpression[] | undefined;

  if (!expressions || expressions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${theme.card} border ${theme.border} rounded-lg overflow-hidden flex flex-col`}
      style={{ width: 240, maxHeight: 500 }}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${theme.border} flex-shrink-0`}>
        <div className="flex items-center gap-2">
          <List className={`w-4 h-4 ${theme.accent}`} />
          <span className={`text-xs font-medium ${theme.text}`}>Tree Index</span>
        </div>
        <span className={`text-[10px] ${theme.muted}`}>{expressions.length} roots</span>
      </div>

      {/* Tree Content */}
      <div className="overflow-y-auto flex-1">
        {expressions.map(expr => renderExpression(expr, 0))}
      </div>

      {/* Legend */}
      <div className={`px-3 py-2 ${theme.itemBg} border-t ${theme.border} flex-shrink-0`}>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
            <span className={theme.muted}>Branch</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-600"></div>
            <span className={theme.muted}>Leaf</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className={theme.muted}>User</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
