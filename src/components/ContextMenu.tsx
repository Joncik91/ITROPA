import { useEffect, useRef, useState } from "react";
import { GitBranch, Layers, TrendingUp, Shuffle, Plus, Trash2, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  isUserAdded?: boolean;
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
  isUserAdded,
}: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState({ x, y });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    // Adjust position if menu would go off screen
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const newX = x + rect.width > window.innerWidth ? window.innerWidth - rect.width - 10 : x;
      const newY = y + rect.height > window.innerHeight ? window.innerHeight - rect.height - 10 : y;
      setAdjustedPosition({ x: newX, y: newY });
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("contextmenu", onClose);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("contextmenu", onClose);
    };
  }, [onClose, x, y]);

  const menuItems = [
    { icon: GitBranch, label: "Branch Further", action: onBranch, color: "text-gray-400" },
    { icon: Layers, label: "View Mechanism", action: onMechanism, color: "text-gray-400" },
    { icon: TrendingUp, label: "Deep Dive", action: onDeepDive, color: "text-gray-400" },
    { icon: Lightbulb, label: "App Concepts", action: onAppConcepts, color: "text-yellow-400" },
    { icon: Shuffle, label: "Cross-Pollinate", action: onCrossPollinate, color: "text-amber-400" },
    { icon: Plus, label: "Add Child", action: onAddChild, color: "text-emerald-400" },
  ];

  if (isUserAdded && onDelete) {
    menuItems.push({ icon: Trash2, label: "Delete", action: onDelete, color: "text-red-400" });
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className={`fixed z-50 ${theme.card} border ${theme.border} rounded-lg shadow-xl overflow-hidden`}
        style={{ left: adjustedPosition.x, top: adjustedPosition.y, minWidth: "180px" }}
      >
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              item.action();
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${theme.hover} transition-colors text-left`}
          >
            <item.icon className={`w-4 h-4 ${item.color}`} />
            <span>{item.label}</span>
          </button>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
