import { useEffect, useRef } from "react";
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

/** True when the keystroke belongs to a text field and must keep its native behaviour. */
function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

export const useKeyboardShortcuts = (props: UseKeyboardShortcutsProps) => {
  // A single listener reads the latest props through a ref instead of re-subscribing every render.
  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const { needs, activeTab, modalOpen, onTabChange, onCloseModals, onToggleShortcuts, onUndo, onRedo } = propsRef.current;

      if (e.key === "Escape") {
        onCloseModals();
        return;
      }
      if (isEditable(e.target) || e.altKey) return;

      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      if (mod && !modalOpen) {
        if (key === "z" && !e.shiftKey && onUndo) {
          e.preventDefault();
          onUndo();
        } else if ((key === "y" || (key === "z" && e.shiftKey)) && onRedo) {
          e.preventDefault();
          onRedo();
        }
        return;
      }
      if (mod || modalOpen) return;

      if (e.key === "?") {
        onToggleShortcuts();
      } else if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && needs.length > 1) {
        const idx = Math.max(0, needs.findIndex(n => n.id === activeTab));
        const step = e.key === "ArrowRight" ? 1 : -1;
        onTabChange(needs[(idx + step + needs.length) % needs.length].id);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
};
