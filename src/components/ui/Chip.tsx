import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";

export type Tone = "neutral" | "accent" | "pollen" | "ok" | "warn" | "bad";

export const TONES: Record<Tone, string> = {
  neutral: "bg-ink/5 text-ink-2 border-line",
  accent: "bg-accent/10 text-accent border-accent/35",
  pollen: "bg-pollen/10 text-pollen border-pollen/40",
  ok: "bg-ok/10 text-ok border-ok/35",
  warn: "bg-warn/10 text-warn border-warn/35",
  bad: "bg-bad/10 text-bad border-bad/35",
};

/** Small read-only label. */
export const Badge = ({ tone = "neutral", children, className, title }: { tone?: Tone; children: ReactNode; className?: string; title?: string }) => (
  <span title={title} className={cx("inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium whitespace-nowrap", TONES[tone], className)}>
    {children}
  </span>
);

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  tone?: Tone;
}

/** Pressable pill: filters, multi-select options, suggestions. */
export const Chip = ({ selected, tone = "accent", className, children, type = "button", ...rest }: ChipProps) => (
  <button
    type={type}
    aria-pressed={selected}
    className={cx(
      "inline-flex items-center gap-1.5 px-3 rounded-full border text-sm min-h-[40px] md:min-h-[32px] transition-colors touch-manipulation",
      selected ? TONES[tone] : "border-line text-ink hover:border-accent/50",
      className,
    )}
    {...rest}
  >
    {children}
  </button>
);
