import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode, useEffect, useId, useRef } from "react";
import type { Theme } from "../config/theme";
import { ErrorBoundary } from "./ErrorBoundary";

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  theme: Theme;
  maxWidth?: string;
}

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal: dialog semantics, Escape to close, focus moved in, trapped,
 * and restored on close, and exit animations. Content is isolated by an error boundary.
 */
export const ModalWrapper = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  theme,
  maxWidth = "max-w-lg",
}: ModalWrapperProps) => {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    (panel?.querySelector<HTMLElement>("[data-autofocus]") ?? panel)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className={`${theme.modalBg} rounded-xl p-6 w-full ${maxWidth} border max-h-[85vh] overflow-y-auto focus:outline-none`}
          >
            <div className="flex justify-between items-start mb-4 gap-4">
              <h3 id={titleId} className="font-medium text-lg flex items-center gap-2 min-w-0 break-words">
                {icon}
                {title}
              </h3>
              <button onClick={onClose} className={`${theme.muted} p-1 rounded hover:bg-gray-500/20`} aria-label="Close dialog">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ErrorBoundary inline label={title}>
              {children}
            </ErrorBoundary>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
