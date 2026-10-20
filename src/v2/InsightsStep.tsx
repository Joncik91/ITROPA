import { ArrowLeft } from 'lucide-react';
import { Badge, Button, Section } from '../components/ui';
import { loadInsights, type ChainInsight, type PatternInsight } from './insights';
import { StepFrame } from './StepFrame';
import { Failed, Loading } from './status';
import { useCall } from './useCall';

const Pattern = ({ p }: { p: PatternInsight }) => (
  <article data-testid="pattern" className="p-3 rounded-card bg-sheet border border-line space-y-2 min-w-0">
    <h3 className="font-semibold break-words">{p.name}</h3>
    <p className="text-sm break-words"><span className="font-medium">Seen in: </span>{p.needs.join(', ')}</p>
    <ul className="space-y-1.5">
      {p.members.map((m, i) => (
        <li key={i} className="text-sm break-words">
          <span className="font-medium">{m.industry}</span> <span className="text-ink-2">({m.needName})</span>
          {m.mechanism && <>: {m.mechanism}</>}
        </li>
      ))}
    </ul>
  </article>
);

const Chain = ({ c }: { c: ChainInsight }) => (
  <article data-testid="chain" className="p-3 rounded-card bg-sheet border border-line space-y-2 min-w-0">
    <div className="flex flex-wrap items-start gap-2">
      <h3 className="font-semibold flex-1 min-w-0 break-words">{c.source}</h3>
      {c.needs.length > 1 && <Badge tone="pollen">Across {c.needs.length} needs</Badge>}
    </div>
    <ul className="space-y-2">
      {c.links.map((l, i) => (
        <li key={i} className="text-sm break-words">
          <span className="font-medium">{l.industry}</span> <span className="text-ink-2">({l.needName})</span>
          {l.mechanism && <> borrows {l.mechanism}{/[.!?]$/.test(l.mechanism) ? '' : '.'}</>}
          {l.twist && <span className="text-ink-2"> Twist: {l.twist}</span>}
        </li>
      ))}
    </ul>
  </article>
);

export const InsightsStep = ({ onBack }: { onBack: () => void }) => {
  const [state, retry] = useCall(loadInsights, 'insights');
  return (
    <StepFrame
      step={null}
      what="What repeats across the needs you have researched."
      why="A pattern that shows up in different needs is a strong, reusable idea. A source that inspired several industries is worth studying first."
      next={<Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" aria-hidden />} onClick={onBack}>Back to start</Button>}
    >
      {state.status === 'loading' ? <Loading label="Reading your saved research…" />
        : state.status === 'error' ? <Failed message={state.message} onRetry={retry} />
        : state.data.needCount < 2 ? <p data-testid="insights-empty" className="text-sm text-ink-2">Insights compare needs, so research at least two needs first. You have {state.data.needCount}.</p>
        : (
          <div className="space-y-6">
            <Section title="Patterns across needs" description="The same underlying mechanism showing up in industries of different needs.">
              <div data-testid="patterns" className="space-y-3">
                {state.data.patterns.map((p) => <Pattern key={p.name} p={p} />)}
                {!state.data.patterns.length && (
                  <p className="text-sm text-ink-2">
                    {state.data.understoodCount
                      ? 'No pattern is shared by two needs yet. Use “Understand this industry” on industries in more than one need.'
                      : 'Patterns come from “Understand this industry”. Run it on industries in at least two needs.'}
                  </p>
                )}
              </div>
            </Section>
            <Section title="Inspiration chain" description="Every idea borrowed from earlier solutions, with what was taken and how it was changed. Sources used by several needs come first.">
              <div data-testid="chains" className="space-y-3">
                {state.data.chains.map((c) => <Chain key={c.source.toLowerCase()} c={c} />)}
                {!state.data.chains.length && <p className="text-sm text-ink-2">No industry has recorded an inspiration yet.</p>}
              </div>
            </Section>
          </div>
        )}
    </StepFrame>
  );
};
