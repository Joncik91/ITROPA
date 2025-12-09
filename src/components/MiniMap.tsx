import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Map, Maximize2, Minimize2 } from "lucide-react";
import type { IndustryExpression, Era } from "../types";

interface MiniMapProps {
  eras: Era[];
  theme: any;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  onNodeClick?: (exprId: string) => void;
}

interface TreeNode {
  id: string;
  name: string;
  x: number;
  y: number;
  depth: number;
  hasChildren: boolean;
  isUserAdded?: boolean;
}

export const MiniMap = ({ eras, theme, scrollContainerRef }: MiniMapProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const miniMapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const MINIMAP_WIDTH = isExpanded ? 280 : 200;
  const MINIMAP_HEIGHT = isExpanded ? 400 : 280;
  const NODE_SIZE = 4;
  const HORIZONTAL_SPACING = 20;
  const VERTICAL_SPACING = 25;

  // Build tree structure and calculate positions
  useEffect(() => {
    const treeNodes: TreeNode[] = [];

    const processExpression = (expr: IndustryExpression, depth: number, yOffset: number): number => {
      treeNodes.push({
        id: expr.id,
        name: expr.name,
        x: depth * HORIZONTAL_SPACING,
        y: yOffset,
        depth,
        hasChildren: (expr.children?.length || 0) > 0,
        isUserAdded: expr.userAdded,
      });

      let currentY = yOffset + VERTICAL_SPACING;
      
      if (expr.children && expr.children.length > 0) {
        expr.children.forEach((child) => {
          currentY = processExpression(child, depth + 1, currentY);
        });
      }

      return currentY;
    };

    let globalY = 0;
    eras.forEach((era) => {
      if (Array.isArray(era.expressions) && era.expressions.length > 0) {
        (era.expressions as IndustryExpression[]).forEach((expr) => {
          globalY = processExpression(expr, 0, globalY);
        });
      }
    });

    setNodes(treeNodes);
  }, [eras]);

  // Draw the mini-map on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate bounds
    const maxX = Math.max(...nodes.map(n => n.x)) + HORIZONTAL_SPACING;
    const maxY = Math.max(...nodes.map(n => n.y)) + VERTICAL_SPACING;

    // Scale to fit
    const scaleX = (MINIMAP_WIDTH - 20) / maxX;
    const scaleY = (MINIMAP_HEIGHT - 20) / maxY;
    const scale = Math.min(scaleX, scaleY, 1);

    // Draw connections
    ctx.strokeStyle = "rgba(99, 102, 241, 0.3)";
    ctx.lineWidth = 1;

    nodes.forEach((node) => {
      const expr = findExpressionById(node.id, eras);
      if (expr?.children) {
        expr.children.forEach((child) => {
          const childNode = nodes.find(n => n.id === child.id);
          if (childNode) {
            ctx.beginPath();
            ctx.moveTo(node.x * scale + 10, node.y * scale + 10);
            ctx.lineTo(childNode.x * scale + 10, childNode.y * scale + 10);
            ctx.stroke();
          }
        });
      }
    });

    // Draw nodes
    nodes.forEach((node) => {
      const x = node.x * scale + 10;
      const y = node.y * scale + 10;

      // Node color based on type
      if (node.isUserAdded) {
        ctx.fillStyle = "rgba(16, 185, 129, 0.8)"; // emerald
      } else if (node.hasChildren) {
        ctx.fillStyle = "rgba(99, 102, 241, 0.8)"; // indigo
      } else {
        ctx.fillStyle = "rgba(139, 92, 246, 0.6)"; // purple
      }

      ctx.beginPath();
      ctx.arc(x, y, NODE_SIZE, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw viewport rectangle
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      const viewportY = (scrollTop / scrollHeight) * MINIMAP_HEIGHT;
      const viewportHeight = (clientHeight / scrollHeight) * MINIMAP_HEIGHT;

      ctx.strokeStyle = "rgba(251, 191, 36, 0.8)"; // amber
      ctx.lineWidth = 2;
      ctx.strokeRect(5, viewportY, MINIMAP_WIDTH - 10, viewportHeight);
    }
  }, [nodes, isExpanded, eras, scrollContainerRef]);

  // Update viewport rectangle on scroll
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const handleScroll = () => {
      // Trigger re-render by forcing canvas redraw
      if (canvasRef.current) {
        // Force component update to redraw viewport
        setNodes(n => [...n]);
      }
    };

    const container = scrollContainerRef.current;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [scrollContainerRef]);

  // Helper function to find expression by ID
  const findExpressionById = (id: string, eras: Era[]): IndustryExpression | null => {
    for (const era of eras) {
      if (Array.isArray(era.expressions)) {
        const found = findInTree(era.expressions as IndustryExpression[], id);
        if (found) return found;
      }
    }
    return null;
  };

  const findInTree = (expressions: IndustryExpression[], id: string): IndustryExpression | null => {
    for (const expr of expressions) {
      if (expr.id === id) return expr;
      if (expr.children) {
        const found = findInTree(expr.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Handle click on mini-map to scroll
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!scrollContainerRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickY = e.clientY - rect.top;

    const container = scrollContainerRef.current;
    const scrollRatio = clickY / MINIMAP_HEIGHT;
    const targetScroll = scrollRatio * container.scrollHeight;

    container.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  };

  if (nodes.length === 0) return null;

  return (
    <motion.div
      ref={miniMapRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${theme.card} border ${theme.border} rounded-lg overflow-hidden`}
      style={{ width: MINIMAP_WIDTH, height: MINIMAP_HEIGHT }}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${theme.border}`}>
        <div className="flex items-center gap-2">
          <Map className={`w-4 h-4 ${theme.accent}`} />
          <span className={`text-xs font-medium ${theme.text}`}>Tree Map</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1 rounded ${theme.hover}`}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <Minimize2 className="w-3 h-3" />
            ) : (
              <Maximize2 className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={MINIMAP_WIDTH}
          height={MINIMAP_HEIGHT - 40}
          className="cursor-pointer"
          onClick={handleCanvasClick}
        />
      </div>

      {/* Legend */}
      <div className={`absolute bottom-0 left-0 right-0 px-3 py-2 ${theme.itemBg} border-t ${theme.border}`}>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            <span className={theme.muted}>Branch</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
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
