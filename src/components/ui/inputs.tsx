import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { controlClass, Hint } from "./Field";
import { cx } from "./cx";

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function TextInput(
  { className, ...rest },
  ref,
) {
  return <input ref={ref} className={cx(controlClass, className)} {...rest} />;
});

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextArea(
  { className, ...rest },
  ref,
) {
  return <textarea ref={ref} className={cx(controlClass, "py-2.5 resize-none leading-relaxed", className)} {...rest} />;
});

export interface Option<T extends string> {
  value: T;
  label: string;
  /** Shown under the control while this option is selected. */
  description?: string;
}

interface SelectProps<T extends string> {
  value: T;
  options: ReadonlyArray<Option<T>>;
  onChange: (value: T) => void;
  placeholder?: string;
  id?: string;
  "aria-describedby"?: string;
  "aria-label"?: string;
  className?: string;
  disabled?: boolean;
}

/** Native select (best on mobile) plus a live description of the chosen option. */
export function Select<T extends string>({ value, options, onChange, placeholder, className, ...rest }: SelectProps<T>) {
  const descId = useId();
  const selected = options.find((o) => o.value === value);
  const describedBy = [rest["aria-describedby"], selected?.description && descId].filter(Boolean).join(" ") || undefined;
  return (
    <div className="space-y-1.5">
      <div className="relative">
        <select
          id={rest.id}
          aria-label={rest["aria-label"]}
          aria-describedby={describedBy}
          disabled={rest.disabled}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className={cx(controlClass, "appearance-none pr-9", className)}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-2" aria-hidden />
      </div>
      {selected?.description && <Hint id={descId} live>{selected.description}</Hint>}
    </div>
  );
}

interface SegmentedProps<T extends string> {
  value: T;
  options: ReadonlyArray<Option<T> & { icon?: ReactNode }>;
  onChange: (value: T) => void;
  label: string;
  /** Render the selected option's description below. Default true. */
  describe?: boolean;
  /** Tab semantics (switching views) instead of a radio group (choosing a value). */
  asTabs?: boolean;
  className?: string;
  tone?: (value: T) => string | undefined;
}

/** Segmented choice with a live description of the selected option. */
export function Segmented<T extends string>({ value, options, onChange, label, describe = true, asTabs, className, tone }: SegmentedProps<T>) {
  const descId = useId();
  const selected = options.find((o) => o.value === value);
  return (
    <div className={cx("space-y-1.5", className)}>
      <div
        role={asTabs ? "tablist" : "radiogroup"}
        aria-label={label}
        className="flex rounded-control border border-line bg-well p-0.5 gap-0.5 overflow-x-auto no-scrollbar"
      >
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role={asTabs ? "tab" : "radio"}
              aria-selected={asTabs ? on : undefined}
              aria-checked={asTabs ? undefined : on}
              aria-describedby={on && describe && o.description ? descId : undefined}
              onClick={() => onChange(o.value)}
              className={cx(
                "flex-1 min-w-fit inline-flex items-center justify-center gap-1.5 px-3 rounded-[8px] text-sm font-medium",
                "min-h-[40px] md:min-h-[32px] transition-colors touch-manipulation whitespace-nowrap",
                on ? cx("bg-sheet text-ink shadow-[0_0_0_1px_rgb(var(--line))]", tone?.(o.value)) : "text-ink-2 hover:text-ink",
              )}
            >
              {o.icon}
              {o.label}
            </button>
          );
        })}
      </div>
      {describe && selected?.description && <Hint id={descId} live>{selected.description}</Hint>}
    </div>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  /** Describes what "on" means. */
  hint?: ReactNode;
  disabled?: boolean;
}

/** Switch with label and hint; the whole row is the hit target. */
export const Toggle = ({ checked, onChange, label, hint, disabled }: ToggleProps) => {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className={cx("flex items-center justify-between gap-3 min-h-[44px] md:min-h-[36px] cursor-pointer", disabled && "opacity-45 cursor-not-allowed")}>
        <span className="text-sm font-medium">{label}</span>
        <span className="relative inline-flex shrink-0">
          <input
            id={id}
            type="checkbox"
            role="switch"
            className="peer sr-only"
            checked={checked}
            disabled={disabled}
            aria-describedby={hint ? `${id}-hint` : undefined}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="w-11 h-6 rounded-full bg-line peer-checked:bg-accent transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-paper" />
          <span className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-sheet shadow transition-transform peer-checked:translate-x-5" />
        </span>
      </label>
      {hint && <Hint id={`${id}-hint`}>{hint}</Hint>}
    </div>
  );
};
