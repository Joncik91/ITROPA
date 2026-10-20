import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button, Section } from '../components/ui';
import type { PriorArt, PriorArtItem } from '../types';
import { loadFieldRead, loadPriorArt } from './journey';
import type { FieldRead } from './field-read';
import { StepFrame } from './StepFrame';
import { Failed, Loading } from './status';
import { useCall, type CallState } from './useCall';

const GROUPS: { key: keyof PriorArt; title: string; hint: string; tail: (i: PriorArtItem) => [string, string | undefined][] }[] = [
  { key: 'currentLeaders', title: 'Who serves this today', hint: 'Solutions people use now.', tail: (i) => [['Falls short', i.limitation]] },
  { key: 'historicalPrecedents', title: 'How people solved it before', hint: 'Older answers and what they teach.', tail: (i) => [['Lesson', i.lesson]] },
  { key: 'adjacentDomains', title: 'Ideas from other fields', hint: 'Solutions borrowed from elsewhere.', tail: (i) => [['Could transfer as', i.transferPotential]] },
  { key: 'natureSolutions', title: 'What nature does', hint: 'Biology solved this first.', tail: (i) => [['Could apply as', i.biomimicryPotential]] },
];

const Card = ({ title, sub, rows }: { title: string; sub?: string; rows: [string, string | undefined][] }) => (
  <article className="p-3 rounded-card bg-sheet border border-line space-y-1.5 min-w-0">
    <h4 className="font-semibold break-words">{title}</h4>
    {sub && <p className="text-xs text-ink-2 break-words">{sub}</p>}
    {rows.filter(([, v]) => v).map(([label, v]) => (
      <p key={label} className="text-sm break-words">{label && <span className="font-medium">{label}: </span>}{v}</p>
    ))}
  </article>
);

const FieldReadView = ({ f }: { f: FieldRead }) => (
  <div className="space-y-5">
    {f.summary && <p className="break-words">{f.summary}</p>}
    {!!f.leaders.length && (
      <Section title="Who leads">
        {f.leaders.map((l) => <Card key={l.name} title={l.name} rows={[['Wins on', l.strength], ['Weak spot', l.weakness]]} />)}
      </Section>
    )}
    <Section title="Gaps" description="Needs nobody meets well yet.">
      {f.gaps.map((g) => <Card key={g.title} title={g.title} rows={[['', g.detail]]} />)}
    </Section>
    <Section title="White space" description="Areas with little or no competition.">
      {f.whiteSpace.map((g) => <Card key={g.title} title={g.title} rows={[['', g.detail]]} />)}
    </Section>
    {f.evolution && <Section title="Where it is heading"><p className="text-sm break-words">{f.evolution}</p></Section>}
    {!!f.entryMoves.length && (
      <Section title="Ways to enter">
        {f.entryMoves.map((g) => <Card key={g.title} title={g.title} rows={[['', g.detail]]} />)}
      </Section>
    )}
  </div>
);

const Slot = <T,>({ state, retry, label, children }: { state: CallState<T>; retry: () => void; label: string; children: (d: T) => React.ReactNode }) =>
  state.status === 'loading' ? <Loading label={label} />
    : state.status === 'error' ? <Failed message={state.message} onRetry={retry} />
    : <>{children(state.data)}</>;

/** Mounted only once prior art exists, so its call never runs (or fails) before its input is there. */
const FieldReadSection = ({ needName, priorArt }: { needName: string; priorArt: PriorArt }) => {
  const [field, retry] = useCall(() => loadFieldRead(needName, priorArt), `field:${needName}`);
  return (
    <div data-testid="field-read" className="space-y-3 pt-2 border-t border-line">
      <h2 className="text-lg font-bold">The field at a glance</h2>
      <Slot state={field} retry={retry} label="Reading the field…">{(f) => <FieldReadView f={f} />}</Slot>
    </div>
  );
};

export const FieldStep = ({ needName, description, onBack, onNext }: { needName: string; description?: string; onBack: () => void; onNext: () => void }) => {
  const [prior, retryPrior] = useCall(() => loadPriorArt(needName, description), `prior:${needName}:${description ?? ''}`);
  const priorArt = prior.status === 'done' ? prior.data : undefined;

  return (
    <StepFrame
      step={1}
      what={`What already exists for “${needName}”, and where it falls short.`}
      why="New industries grow in the gaps of old ones. Seeing who serves the need, and how, shows where a newcomer can win."
      next={(
        <div className="space-y-2">
          <Button variant="primary" block icon={<ArrowRight className="w-4 h-4" aria-hidden />} onClick={onNext} disabled={!priorArt}>See future industries</Button>
          <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" aria-hidden />} onClick={onBack}>Pick a different need</Button>
        </div>
      )}
    >
      <Slot state={prior} retry={retryPrior} label="Researching prior art…">
        {(pa) => (
          <div className="space-y-5" data-testid="prior-art">
            {GROUPS.map((g) => {
              const items = pa[g.key] ?? [];
              return items.length ? (
                <Section key={g.key} title={g.title} description={g.hint}>
                  {items.map((i) => <Card key={i.name} title={i.name} sub={i.domain ?? i.era ?? i.originalDomain} rows={[['How it works', i.mechanism], ...g.tail(i)]} />)}
                </Section>
              ) : null;
            })}
          </div>
        )}
      </Slot>
      {priorArt && <FieldReadSection needName={needName} priorArt={priorArt} />}
    </StepFrame>
  );
};
