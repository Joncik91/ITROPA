import { Plus, X } from "lucide-react";
import type { NeedManager } from "../../hooks/useNeedManager";
import { cx, Hint } from "../ui";

/** Needs open in the workspace. `strip` is the horizontal mobile variant. */
export const OpenNeeds = ({ manager, variant, onNew, onPicked, trailing }: {
  manager: NeedManager;
  variant: "list" | "strip";
  onNew?: () => void;
  onPicked?: () => void;
  /** Strip only: controls pinned to the right of the scrolling chips. */
  trailing?: React.ReactNode;
}) => {
  if (variant === "strip") {
    return (
      <div className="flex items-center border-b border-line">
      <nav aria-label="Open needs" className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto no-scrollbar pl-4 pr-2 py-2">
        {manager.needs.map((n) => {
          const on = manager.activeTab === n.id;
          return (
            <span key={n.id} className={cx("inline-flex items-center rounded-full border shrink-0", on ? "border-accent/50 bg-accent/10 text-accent" : "border-line")}>
              <button
                type="button"
                onClick={() => manager.setActiveTab(n.id)}
                aria-current={on ? "page" : undefined}
                className="pl-3 pr-1 min-h-[40px] text-sm font-medium max-w-[11rem] truncate"
              >
                {n.name}
              </button>
              <button
                type="button"
                onClick={() => manager.closeNeed(n.id)}
                aria-label={`Close ${n.name}. It stays in your library.`}
                className="w-9 h-10 inline-flex items-center justify-center text-ink-2 hover:text-ink"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          );
        })}
        {onNew && (
          <button type="button" onClick={onNew} className="inline-flex items-center gap-1 px-3 min-h-[40px] rounded-full border border-dashed border-line text-sm text-ink-2 shrink-0">
            <Plus className="w-4 h-4" /> New
          </button>
        )}
      </nav>
      {trailing && <div className="flex items-center pr-1 border-l border-line">{trailing}</div>}
      </div>
    );
  }

  if (!manager.needs.length) return null;
  return (
    <section className="space-y-2">
      <h3 className="text-base font-semibold">Open needs</h3>
      <ul className="space-y-1">
        {manager.needs.map((n) => {
          const on = manager.activeTab === n.id;
          return (
            <li key={n.id} className={cx("flex items-center rounded-control", on ? "bg-accent/10 text-accent" : "hover:bg-ink/5")}>
              <button
                type="button"
                onClick={() => { manager.setActiveTab(n.id); onPicked?.(); }}
                aria-current={on ? "page" : undefined}
                className="flex-1 text-left px-3 min-h-[44px] md:min-h-[36px] text-sm font-medium truncate"
              >
                {n.name}
              </button>
              <button
                type="button"
                onClick={() => manager.closeNeed(n.id)}
                title="Close. It stays in your library."
                aria-label={`Close ${n.name}. It stays in your library.`}
                className="w-11 h-11 md:w-9 md:h-9 inline-flex items-center justify-center text-ink-2 hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          );
        })}
      </ul>
      <Hint>Closing a need only removes it from here. Reopen it from the library.</Hint>
    </section>
  );
};
