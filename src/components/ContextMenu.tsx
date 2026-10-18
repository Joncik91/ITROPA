import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { GitBranch, Layers, TrendingUp, Shuffle, Plus, Trash2, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import type { Theme } from "../config/theme";

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
  theme: Theme;
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
  theme,
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

  const menuItems = [
    { icon: GitBranch, label: "Branch Further", action: onBranch, color: "text-gray-400" },
    { icon: Layers, label: "View Mechanism", action: onMechanism, color: "text-gray-400" },
    { icon: TrendingUp, label: "Deep Dive", action: onDeepDive, color: "text-gray-400" },
    { icon: Lightbulb, label: "App Concepts", action: onAppConcepts, color: "text-yellow-400" },
    { icon: Shuffle, label: "Cross-Pollinate", action: onCrossPollinate, color: "text-amber-400" },
    { icon: Plus, label: "Add Child", action: onAddChild, color: "text-emerald-400" },
    ...(onDelete ? [{ icon: Trash2, label: "Delete (undoable)", action: onDelete, color: "text-red-400" }] : []),
  ];

  return (
    <motion.div
      ref={menuRef}
      role="menu"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.1 }}
      className={`fixed z-50 ${theme.card} border ${theme.border} rounded-lg shadow-xl overflow-hidden`}
      style={{ left: position.x, top: position.y, minWidth: "180px" }}
    >
      {menuItems.map((item) => (
        <button
          key={item.label}
          role="menuitem"
          onClick={() => {
            onCloseRef.current();
            item.action();
          }}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${theme.hover} focus:outline-none focus:bg-gray-500/20 transition-colors text-left`}
        >
          <item.icon className={`w-4 h-4 ${item.color}`} />
          <span>{item.label}</span>
        </button>
      ))}
    </motion.div>
  );
};
