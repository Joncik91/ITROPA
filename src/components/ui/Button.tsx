import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cx } from "./cx";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "pollen";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent/90 border border-transparent",
  secondary: "bg-sheet text-ink border border-line hover:border-accent/60 hover:bg-accent/5",
  ghost: "text-ink hover:bg-ink/5 border border-transparent",
  danger: "text-bad border border-bad/40 hover:bg-bad/10",
  pollen: "bg-pollen/15 text-pollen border border-pollen/50 hover:bg-pollen/25",
};

// Touch-sized below md, denser on pointer layouts.
const SIZES: Record<Size, string> = {
  sm: "min-h-[40px] md:min-h-[32px] px-3 text-sm gap-1.5",
  md: "min-h-[44px] md:min-h-[38px] px-4 text-base md:text-sm gap-2",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  loading?: boolean;
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", icon, loading, block, className, children, disabled, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        "inline-flex items-center justify-center rounded-control font-medium transition-colors touch-manipulation",
        "disabled:opacity-45 disabled:pointer-events-none select-none",
        VARIANTS[variant],
        SIZES[size],
        block && "w-full",
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden /> : icon}
      {children}
    </button>
  );
});

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
}

/** Square icon-only button; `label` is both its accessible name and tooltip. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, active, className, children, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cx(
        "inline-flex items-center justify-center rounded-control transition-colors touch-manipulation",
        "w-11 h-11 md:w-9 md:h-9 shrink-0 disabled:opacity-45",
        active ? "bg-accent/15 text-accent" : "text-ink-2 hover:text-ink hover:bg-ink/5",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
