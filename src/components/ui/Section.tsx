import type { ReactNode } from "react";
import { cx } from "./cx";

/** Titled group inside a panel or sheet. */
export const Section = ({ title, aside, description, children, className }: {
  title: ReactNode;
  aside?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <section className={cx("space-y-3", className)}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-base font-semibold">{title}</h3>
        {description && <p className="text-sm text-ink-2 mt-0.5">{description}</p>}
      </div>
      {aside}
    </div>
    {children}
  </section>
);
