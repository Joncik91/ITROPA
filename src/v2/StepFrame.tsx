import type { ReactNode } from 'react';

const STEPS = ['Need', 'Field', 'Industries', 'Build'] as const;

/** Every V2 step: where you are, what it is, why it matters, and one way forward. */
export const StepFrame = ({ step, what, why, children, next }: {
  step: 0 | 1 | 2 | 3 | null;
  what: string;
  why: string;
  children: ReactNode;
  next?: ReactNode;
}) => (
  <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
    <nav aria-label="Progress" className="flex gap-1.5 text-xs">
      {STEPS.map((label, i) => (
        <span
          key={label}
          aria-current={i === step ? 'step' : undefined}
          className={`flex-1 text-center py-1 rounded-full border ${i === step ? 'border-accent text-accent bg-accent/10 font-semibold' : 'border-line text-ink-2'}`}
        >
          {label}
        </span>
      ))}
    </nav>
    <header className="space-y-1.5">
      <p className="text-sm break-words"><span className="font-semibold">What this is: </span>{what}</p>
      <p className="text-sm text-ink-2"><span className="font-semibold text-ink">Why it matters: </span>{why}</p>
    </header>
    {children}
    {next && <footer className="pt-2">{next}</footer>}
  </main>
);
