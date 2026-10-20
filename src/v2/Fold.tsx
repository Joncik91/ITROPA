import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

/** Native <details>: folded content stays in the page, and the browser keeps the keyboard and focus behaviour. */
export const Fold = ({ summary, open, testId, children }: { summary: ReactNode; open?: boolean; testId?: string; children: ReactNode }) => (
  <details open={open} data-testid={testId} className="min-w-0">
    <summary className="flex items-start gap-2 p-3 min-h-11 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
      <div className="flex-1 min-w-0">{summary}</div>
      <ChevronDown className="w-4 h-4 mt-1 shrink-0 text-ink-2 transition-transform [details[open]>summary_&]:rotate-180" aria-hidden />
    </summary>
    <div className="px-3 pb-3 space-y-2">{children}</div>
  </details>
);
