import { useEffect } from "react";
import type { Need } from "../types";

interface UseKeyboardShortcutsProps {
  needs: Need[];
  activeTab: string | null;
  modalOpen: boolean;
  onTabChange: (tabId: string) => void;
  onCloseModals: () => void;
  onToggleShortcuts: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const useKeyboardShortcuts = ({
  needs,
  activeTab,
  modalOpen,
  onTabChange,
  onCloseModals,
  onToggleShortcuts,
  onUndo,
  onRedo,
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Undo/Redo shortcuts
      if (e.ctrlKey && e.key === "z" && !modalOpen && onUndo) {
        e.preventDefault();
        onUndo();
        return;
      }
      if (e.ctrlKey && e.key === "y" && !modalOpen && onRedo) {
        e.preventDefault();
        onRedo();
        return;
      }
      
      if (e.key === "Escape") {
        onCloseModals();
      }
      if (e.key === "?" && !modalOpen) {
        onToggleShortcuts();
      }
      if (e.key === "ArrowRight" && needs.length > 1 && !modalOpen) {
        const idx = needs.findIndex(n => n.id === activeTab);
        onTabChange(needs[(idx + 1) % needs.length].id);
      }
      if (e.key === "ArrowLeft" && needs.length > 1 && !modalOpen) {
        const idx = needs.findIndex(n => n.id === activeTab);
        onTabChange(needs[(idx - 1 + needs.length) % needs.length].id);
      }
    };
    
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [needs, activeTab, modalOpen, onTabChange, onCloseModals, onToggleShortcuts, onUndo, onRedo]);
};
