import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";
import { AlertCircle, Info } from "lucide-react";
import { cx } from "./cx";

/** Secondary explanatory text. `live` announces changes (use for selection descriptions). */
export const Hint = ({ children, id, live, className }: { children: ReactNode; id?: string; live?: boolean; className?: string }) => (
  <p id={id} aria-live={live ? "polite" : undefined} className={cx("text-sm text-ink-2 flex gap-1.5", className)}>
    <Info className="w-3.5 h-3.5 mt-[2px] shrink-0 opacity-70" aria-hidden />
    <span>{children}</span>
  </p>
);

export interface FieldProps {
  label: ReactNode;
  /** Always visible: what this field is for and what it changes. */
  hint?: ReactNode;
  error?: string | null;
  optional?: boolean;
  className?: string;
  /** A single form control; it receives id and aria-describedby. */
  children: ReactElement;
}

/** Label + control + hint + error, wired for screen readers. */
export const Field = ({ label, hint, error, optional, className, children }: FieldProps) => {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })
    : children;

  return (
    <div className={cx("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
        {optional && <span className="font-normal text-ink-2"> (optional)</span>}
      </label>
      {control}
      {hint && <Hint id={hintId}>{hint}</Hint>}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-bad flex gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 mt-[2px] shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
};

export const controlClass =
  "w-full rounded-control bg-well border border-line text-ink placeholder:text-ink-2/70 " +
  "px-3 min-h-[44px] md:min-h-[38px] text-base md:text-sm transition-colors " +
  "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 aria-[invalid=true]:border-bad";
