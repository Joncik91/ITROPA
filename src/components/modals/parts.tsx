/**
 * Small building blocks shared by the analysis sheets (mechanism, deep dive, app ideas).
 */

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cx } from "../ui";

/** Labelled group of content inside an analysis. */
export const Block = ({ title, children, className }: { title: ReactNode; children: ReactNode; className?: string }) => (
  <div className={cx("space-y-2", className)}>
    <h4 className="text-sm font-semibold text-ink-2">{title}</h4>
    {children}
  </div>
);

/** Inset item inside a Block. */
export const Item = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cx("p-3 rounded-control bg-well border border-line/60 text-sm space-y-1", className)}>{children}</div>
);

/** "Label: value" line; renders nothing without a value. */
export const Line = ({ label, children, muted }: { label: string; children: ReactNode; muted?: boolean }) =>
  children === undefined || children === null || children === "" ? null : (
    <p className={cx("text-sm", muted && "text-ink-2")}>
      <span className="font-medium text-ink">{label}: </span>
      {children}
    </p>
  );

/** 0–100 score with a bar; `hint` explains what a high value means. */
export const Meter = ({ label, value, hint, good = 80, fair = 60 }: { label: string; value: number; hint?: string; good?: number; fair?: number }) => {
  const v = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  const level = v >= good ? "ok" : v >= fair ? "warn" : "bad";
  const meterTone = () => ({ ok: "bg-ok", warn: "bg-warn", bad: "bg-bad" })[level];
  const meterText = () => ({ ok: "text-ok", warn: "text-warn", bad: "text-bad" })[level];
  return (
    <div className="p-3 rounded-control bg-well border border-line/60">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm text-ink-2">{label}</p>
        <span className={cx("font-semibold", meterText())}>{v}</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-line overflow-hidden" role="meter" aria-label={label} aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
        <div className={cx("h-full rounded-full", meterTone())} style={{ width: `${v}%` }} />
      </div>
      {hint && <p className="text-xs text-ink-2 mt-1.5">{hint}</p>}
    </div>
  );
};

/** Native disclosure: keyboard and screen-reader friendly, no state needed. */
export const Disclosure = ({ title, aside, children, defaultOpen }: {
  title: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) => (
  <details open={defaultOpen} className="group rounded-card border border-line bg-sheet">
    <summary className="flex items-center gap-3 px-4 min-h-[52px] md:min-h-[44px] cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden">
      <span className="flex-1 min-w-0 font-semibold">{title}</span>
      {aside}
      <ChevronDown className="w-4 h-4 text-ink-2 transition-transform group-open:rotate-180 shrink-0" aria-hidden />
    </summary>
    <div className="px-4 pb-4 pt-1 space-y-4">{children}</div>
  </details>
);

export const asArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v.filter((x) => x != null) as T[]) : []);
