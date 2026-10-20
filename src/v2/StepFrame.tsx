import type { ReactNode } from 'react';
import { useNav, type Place } from './nav';
import { PathBar } from './PathBar';

const STEPS = ['Need', 'Field', 'Industries', 'Build'] as const;

/** Steps already reachable are links; the current one is marked; the rest are plain text. */
const StepBar = ({ step }: { step: 0 | 1 | 2 | 3 | null }) => {
  const nav = useNav();
  const place = nav?.place;
  const target = (i: number): Place | undefined => {
    if (!nav) return undefined;
    if (i === 0) return { step: 'field' };
    if (!place?.need) return undefined;
    if (i === 1) return { need: place.need, step: 'field' };
    // On Field the later steps open through the screen's own button, which waits for prior art; a link here would start a second paid call.
    if (place.step === 'field') return undefined;
    if (i === 2) return { need: place.need, step: 'industries' };
    return place.industry ? { need: place.need, step: 'build', industry: place.industry } : undefined;
  };
  return (
    <nav aria-label="Progress" className="flex gap-1.5 text-xs">
      {STEPS.map((label, i) => {
        const to = i === step ? undefined : target(i);
        const cls = `flex-1 text-center py-1 rounded-full border ${i === step ? 'border-accent text-accent bg-accent/10 font-semibold' : to ? 'border-accent/40 text-accent' : 'border-line text-ink-2'}`;
        return to
          ? <button key={label} type="button" onClick={() => nav!.go(to)} className={cls}>{label}</button>
          : <span key={label} aria-current={i === step ? 'step' : undefined} className={cls}>{label}</span>;
      })}
    </nav>
  );
};

/** Every V2 step: where you are, what it is, why it matters, and one way forward. */
export const StepFrame = ({ step, what, why, children, next }: {
  step: 0 | 1 | 2 | 3 | null;
  what: string;
  why: string;
  children: ReactNode;
  next?: ReactNode;
}) => (
  <main className="max-w-lg mx-auto px-4 pt-6 space-y-6">
    <PathBar />
    <StepBar step={step} />
    <header className="space-y-1.5">
      <p className="text-sm break-words"><span className="font-semibold">What this is: </span>{what}</p>
      <p className="text-sm text-ink-2"><span className="font-semibold text-ink">Why it matters: </span>{why}</p>
    </header>
    {children}
    {next && <footer data-testid="action-bar" className="sticky bottom-0 -mx-4 px-4 py-3 bg-paper/95 border-t border-line backdrop-blur space-y-2">{next}</footer>}
  </main>
);
