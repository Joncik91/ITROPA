import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ErrorBoundary } from "../ErrorBoundary";
import { IconButton } from "./Button";
import { cx } from "./cx";

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  /** One line under the title: what this sheet is for. */
  description?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  /** Sticky footer, typically the primary actions. */
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** Used for the error-boundary message when the title is not plain text. */
  label?: string;
}

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
const WIDTH = { sm: "md:max-w-md", md: "md:max-w-xl", lg: "md:max-w-3xl" };

/**
 * Responsive dialog: a bottom sheet on phones, a centered dialog from md up.
 * Escape closes, focus moves in, is trapped, and is restored; background scroll is locked.
 * Rendered into document.body so transformed or faded ancestors (animated cards) can't
 * clip it or make it translucent.
 */
export const Sheet = ({ isOpen, onClose, title, description, icon, children, footer, size = "md", label }: SheetProps) => {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    (panel?.querySelector<HTMLElement>("[data-autofocus]") ?? panel)?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

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
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  const isDesktop = typeof window !== "undefined" && window.matchMedia?.("(min-width: 768px)").matches;
  const from = reduce ? { opacity: 0 } : isDesktop ? { opacity: 0, scale: 0.97 } : { y: "100%" };
  const to = reduce ? { opacity: 1 } : isDesktop ? { opacity: 1, scale: 1 } : { y: 0 };

  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 bg-black/55 flex items-end md:items-center justify-center md:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            initial={from}
            animate={to}
            exit={from}
            transition={{ type: "tween", ease: [0.2, 0.8, 0.2, 1], duration: 0.24 }}
            className={cx(
              "w-full bg-sheet text-ink border border-line shadow-sheet flex flex-col focus:outline-none",
              "rounded-t-sheet md:rounded-sheet max-h-[92dvh] md:max-h-[85vh]",
              WIDTH[size],
            )}
          >
            <div className="md:hidden flex justify-center pt-2" aria-hidden>
              <span className="w-10 h-1 rounded-full bg-line" />
            </div>
            <header className="flex items-start gap-3 px-4 md:px-6 pt-3 md:pt-5 pb-3 border-b border-line">
              {icon && <span className="mt-0.5 text-accent shrink-0">{icon}</span>}
              <div className="flex-1 min-w-0">
                <h2 id={titleId} className="text-lg font-semibold break-words">{title}</h2>
                {description && <p id={descId} className="text-sm text-ink-2 mt-0.5">{description}</p>}
              </div>
              <IconButton label="Close" onClick={onClose} className="-mr-2 -mt-1">
                <X className="w-5 h-5" />
              </IconButton>
            </header>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 md:px-6 py-4">
              <ErrorBoundary inline label={label ?? (typeof title === "string" ? title : "this dialog")}>
                {children}
              </ErrorBoundary>
            </div>
            {footer && <footer className="px-4 md:px-6 py-3 border-t border-line pb-[max(12px,env(safe-area-inset-bottom))]">{footer}</footer>}
            {!footer && <div className="pb-safe" />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
