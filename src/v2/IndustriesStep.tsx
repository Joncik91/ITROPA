import { ArrowLeft, Shuffle } from 'lucide-react';
import { Badge, Button, Section } from '../components/ui';
import { getFutureExpressions, isFutureEra } from '../utils/need-model';
import type { IndustryExpression, Need } from '../types';
import { loadNeed } from './need-load';
import { StepFrame } from './StepFrame';
import { Failed, Loading } from './status';
import { useCall } from './useCall';

const Industry = ({ e, depth = 0 }: { e: IndustryExpression; depth?: number }) => (
  <article className={`p-3 rounded-card bg-sheet border border-line space-y-2 min-w-0 ${depth ? 'ml-4' : ''}`}>
    <div className="flex flex-wrap items-start gap-2">
      <h3 className="font-semibold flex-1 min-w-0 break-words">{e.name}</h3>
      {e.crossPollinated && <Badge tone="pollen"><Shuffle className="w-3 h-3" aria-hidden />Combined</Badge>}
    </div>
    {e.mutation && <p className="text-sm break-words"><span className="font-medium">What makes it possible: </span>{e.mutation}</p>}
    {e.insight && <p className="text-sm break-words">{e.insight}</p>}
    {!!e.inspirations.length && (
      <div className="pt-2 border-t border-line">
        <p className="text-sm font-medium mb-1">Inspired by</p>
        <ul className="space-y-1">
          {e.inspirations.map((i, n) => (
            <li key={n} className="text-sm break-words">
              <span className="font-medium">{i.source}</span>
              {i.mechanism && <> borrows {i.mechanism}</>}
              {i.twist && <span className="text-ink-2"> Twist: {i.twist}</span>}
            </li>
          ))}
        </ul>
      </div>
    )}
    {e.children?.map((c) => <Industry key={c.id} e={c} depth={depth + 1} />)}
  </article>
);

/** Past eras as one collapsed strip: context, not a second copy of the industries. */
const History = ({ need }: { need: Need }) => {
  const past = need.eras.filter((era) => !isFutureEra(era));
  if (!past.length) return null;
  return (
    <details data-testid="history" className="rounded-card border border-line bg-sheet p-3">
      <summary className="cursor-pointer text-sm font-medium">How this need was met in past eras</summary>
      <ol className="mt-3 space-y-2">
        {past.map((era) => (
          <li key={era.name} className="text-sm break-words">
            <span className="font-medium">{era.name}: </span>{(era.expressions as string[]).join(', ')}
          </li>
        ))}
      </ol>
    </details>
  );
};

export const IndustriesStep = ({ needName, description, onBack }: { needName: string; description?: string; onBack: () => void }) => {
  const [state, retry] = useCall(() => loadNeed(needName, description), `need:${needName}`);
  return (
    <StepFrame
      step={2}
      what={`Industries that could grow out of “${needName}”.`}
      why="Each one recombines how the need was met before with what is newly possible. These are the openings you can pick from."
      next={<Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" aria-hidden />} onClick={onBack}>Back to the field</Button>}
    >
      {state.status === 'loading' ? <Loading label="Imagining future industries…" />
        : state.status === 'error' ? <Failed message={state.message} onRetry={retry} />
        : (
          <div className="space-y-5">
            {state.data.description && <p className="break-words">{state.data.description}</p>}
            <History need={state.data} />
            <Section title="Future industries" description="Each shows what makes it possible and which earlier solutions it borrows from.">
              <div data-testid="industries-list" className="space-y-3">
                {getFutureExpressions(state.data).map((e) => <Industry key={e.id} e={e} />)}
                {!getFutureExpressions(state.data).length && <p className="text-sm text-ink-2">This saved need has no future industries yet.</p>}
              </div>
            </Section>
          </div>
        )}
    </StepFrame>
  );
};
