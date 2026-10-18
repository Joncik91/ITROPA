import type { ReactNode } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Sheet } from "./Sheet";
import { cx } from "./cx";

export interface ActionItem {
  id: string;
  label: string;
  /** What happens when chosen. */
  description: string;
  icon: ReactNode;
  onSelect: () => void;
  /** Calls the AI (slow, uses quota) unless a saved result exists. */
  ai?: boolean;
  /** A saved result exists; choosing it opens instantly. */
  saved?: boolean;
  loading?: boolean;
  selected?: boolean;
  danger?: boolean;
  disabled?: boolean;
}

/** Status line under an action: tells the user the cost before they commit. */
export const actionStatus = (a: Pick<ActionItem, "ai" | "saved" | "loading" | "selected">): string | null => {
  if (a.loading) return "Working…";
  if (a.selected) return "Selected";
  if (a.saved) return "Saved: opens instantly";
  if (a.ai) return "Uses AI: 10–30 s";
  return null;
};

/** Mobile action list: every option explains itself before it runs. */
export const ActionSheet = ({ isOpen, onClose, title, description, actions }: {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  actions: ActionItem[];
}) => (
  <Sheet isOpen={isOpen} onClose={onClose} title={title} description={description} size="sm" label="actions">
    <ul className="-mx-2 space-y-1">
      {actions.map((a) => {
        const status = actionStatus(a);
        return (
          <li key={a.id}>
            <button
              type="button"
              disabled={a.disabled || a.loading}
              onClick={() => {
                onClose();
                a.onSelect();
              }}
              className={cx(
                "w-full text-left flex gap-3 px-2 py-3 rounded-card transition-colors touch-manipulation disabled:opacity-50",
                a.danger ? "hover:bg-bad/10" : "hover:bg-ink/5",
              )}
            >
              <span className={cx("mt-0.5 w-9 h-9 rounded-control flex items-center justify-center shrink-0 border",
                a.danger ? "border-bad/40 text-bad" : a.selected ? "border-pollen/50 text-pollen bg-pollen/10" : "border-line text-accent")}>
                {a.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : a.icon}
              </span>
              <span className="flex-1 min-w-0">
                <span className={cx("block font-medium", a.danger && "text-bad")}>{a.label}</span>
                <span className="block text-sm text-ink-2">{a.description}</span>
                {status && (
                  <span className={cx("mt-1 inline-flex items-center gap-1 text-xs", a.saved ? "text-ok" : "text-ink-2")}>
                    {a.ai && !a.saved && !a.loading && <Sparkles className="w-3 h-3" aria-hidden />}
                    {status}
                  </span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  </Sheet>
);
