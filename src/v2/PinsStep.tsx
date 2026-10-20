import { ArrowLeft } from 'lucide-react';
import { Badge, Button } from '../components/ui';
import { PinStar } from './PinStar';
import { useNav } from './nav';
import { loadPins, type PinRecord } from './pins';
import { StepFrame } from './StepFrame';
import { Failed, Loading } from './status';
import { useCall } from './useCall';

const Pin = ({ p, onChange }: { p: PinRecord; onChange: () => void }) => {
  const nav = useNav();
  return (
    <article data-testid="pin" className="p-3 rounded-card bg-sheet border border-line space-y-2 min-w-0">
      <div className="flex flex-wrap items-start gap-2">
        <h3 className="font-semibold flex-1 min-w-0 break-words">{p.label}</h3>
        <Badge tone={p.kind === 'concept' ? 'ok' : 'pollen'}>{p.kind === 'concept' ? 'App idea' : 'Industry'}</Badge>
      </div>
      <p className="text-xs text-ink-2 break-words">From “{p.needName}”</p>
      {p.text && <p className="text-sm break-words">{p.text}</p>}
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" aria-label={`Open ${p.label}`} onClick={() => nav?.go({ need: p.needName, step: p.kind === 'concept' ? 'build' : 'dig', industry: p.industryId })}>Open</Button>
        <PinStar pin={{ kind: p.kind, needName: p.needName, industryId: p.industryId, label: p.label, text: p.text, conceptName: p.kind === 'concept' ? p.label : undefined }} onChange={onChange} />
      </div>
    </article>
  );
};

export const PinsStep = ({ onBack }: { onBack: () => void }) => {
  const [state, reload] = useCall(loadPins, 'pins');
  return (
    <StepFrame
      step={null}
      what="Industries and app ideas you starred, from every need you researched."
      why="Research branches fast. Pins keep the few ideas worth coming back to in one place."
      next={<Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" aria-hidden />} onClick={onBack}>Back to start</Button>}
    >
      {state.status === 'loading' ? <Loading label="Reading your pins…" />
        : state.status === 'error' ? <Failed message={state.message} onRetry={reload} />
        : state.data.length === 0 ? <p data-testid="pins-empty" className="text-sm text-ink-2">Nothing pinned yet. Tap the star on an industry or an app idea to keep it here.</p>
        : <div data-testid="pins" className="space-y-3">{state.data.map((p) => <Pin key={p.key} p={p} onChange={reload} />)}</div>}
    </StepFrame>
  );
};
