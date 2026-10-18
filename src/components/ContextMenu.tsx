import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { GitBranch, Layers, TrendingUp, Shuffle, Plus, Trash2, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { INDUSTRY_ACTIONS, type IndustryActionId } from "../config/actions";
import { cx } from "./ui";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onBranch: () => void;
  onMechanism: () => void;
  onDeepDive: () => void;
  onAppConcepts: () => void;
  onCrossPollinate: () => void;
  onAddChild: () => void;
  onDelete?: () => void;
}

export const ContextMenu = ({
  x,
  y,
  onClose,
  onBranch,
  onMechanism,
  onDeepDive,
  onAppConcepts,
  onCrossPollinate,
  onAddChild,
  onDelete,
}: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Measure before paint so the menu never flashes off-screen.
  useLayoutEffect(() => {
    const rect = menuRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({
      x: Math.max(8, Math.min(x, window.innerWidth - rect.width - 8)),
      y: Math.max(8, Math.min(y, window.innerHeight - rect.height - 8)),
    });
  }, [x, y]);

  useEffect(() => {
    menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const close = () => onCloseRef.current();
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) close();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
      const idx = items.indexOf(document.activeElement as HTMLButtonElement);
      const next = e.key === "ArrowDown" ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length;
      items[next]?.focus();
    };
    // Attach after the opening right-click has finished propagating: React 18 runs this
    // effect synchronously inside that event, so a document listener would see it and close.
    const timer = window.setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("contextmenu", close);
      window.addEventListener("scroll", close, true);
    }, 0);
    document.addEventListener("keydown", handleKey, true);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey, true);
      document.removeEventListener("contextmenu", close);
      window.removeEventListener("scroll", close, true);
    };
  }, []);

  const menuItems: Array<{ id: IndustryActionId; icon: typeof GitBranch; action: () => void }> = [
    { id: "branch", icon: GitBranch, action: onBranch },
    { id: "mechanism", icon: Layers, action: onMechanism },
    { id: "deepDive", icon: TrendingUp, action: onDeepDive },
    { id: "apps", icon: Lightbulb, action: onAppConcepts },
    { id: "cross", icon: Shuffle, action: onCrossPollinate },
    { id: "addChild", icon: Plus, action: onAddChild },
    ...(onDelete ? [{ id: "delete" as const, icon: Trash2, action: onDelete }] : []),
  ];

  return (
    <motion.div
      ref={menuRef}
      role="menu"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.1 }}
      className="fixed z-50 bg-sheet text-ink border border-line rounded-card shadow-pop overflow-hidden py-1 w-72 max-w-[calc(100vw-16px)]"
      style={{ left: position.x, top: position.y }}
    >
      {menuItems.map((item) => {
        const info = INDUSTRY_ACTIONS[item.id];
        const danger = item.id === "delete";
        return (
          <button
            key={item.id}
            role="menuitem"
            onClick={() => {
              onCloseRef.current();
              item.action();
            }}
            className={cx(
              "w-full flex items-start gap-3 px-3 py-2 text-left transition-colors focus:outline-none",
              danger ? "hover:bg-bad/10 focus:bg-bad/10" : "hover:bg-ink/5 focus:bg-ink/5",
            )}
          >
            <item.icon className={cx("w-4 h-4 mt-0.5 shrink-0", danger ? "text-bad" : item.id === "cross" ? "text-pollen" : "text-accent")} aria-hidden />
            <span className="min-w-0">
              <span className={cx("block text-sm font-medium", danger && "text-bad")}>{info.label}</span>
              <span className="block text-xs text-ink-2">{info.description}</span>
            </span>
          </button>
        );
      })}
    </motion.div>
  );
};
