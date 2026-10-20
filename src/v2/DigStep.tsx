import { useState } from 'react';
import { ArrowLeft, GitBranch, Lightbulb, Shuffle } from 'lucide-react';
import { Badge, Button, Section, Select } from '../components/ui';
import { DBService } from '../services/db/db.service';
import { getFutureExpressions, locateInExpressionTree } from '../utils/need-model';
import type { IndustryExpression, Need } from '../types';
import { branch, combine, getSavedUnderstanding, understand, type Understanding } from './dig';
import { StepFrame } from './StepFrame';
import { Failed, Loading } from './status';
import { useAction } from './useAction';
import { useCall } from './useCall';

const Text = ({ label, children }: { label: string; children?: string }) =>
  children ? <p className="text-sm break-words"><span className="font-medium">{label}: </span>{children}</p> : null;

const UnderstandingView = ({ u }: { u: Understanding }) => (
  <div data-testid="understanding" className="space-y-3">
    <Text label="How it works">{u.mechanism.coreMechanism}</Text>
    <Text label="The pattern behind it">{u.mechanism.abstractPattern}</Text>
    {!!u.mechanism.keyPrinciples?.length && (
      <ul className="space-y-1 text-sm">
        {u.mechanism.keyPrinciples.map((p) => <li key={p.principle} className="break-words"><span className="font-medium">{p.principle}</span> {p.function} {p.criticality}</li>)}
      </ul>
    )}
    {!!u.mechanism.untappedDomains?.length && (
      <div>
        <p className="text-sm font-medium">Fields that could borrow it</p>
        <ul className="space-y-1 text-sm">
          {u.mechanism.untappedDomains.map((d) => <li key={d.domain} className="break-words"><span className="font-medium">{d.domain}:</span> {d.opportunity}</li>)}
        </ul>
      </div>
    )}
    <Text label="Market opportunity">{u.deepDive.marketOpportunity}</Text>
    {!!u.deepDive.keyEnablers.length && <Text label="What makes it possible">{u.deepDive.keyEnablers.join('; ')}</Text>}
    {!!u.deepDive.challenges.length && (
      <div>
        <p className="text-sm font-medium">Challenges</p>
        <ul className="space-y-1 text-sm">
          {u.deepDive.challenges.map((c) => <li key={c.challenge} className="break-words"><span className="font-medium">{c.challenge}:</span> {c.potentialSolution}</li>)}
        </ul>
      </div>
    )}
    <Text label="Timeline">{u.deepDive.timeline}</Text>
    {!!u.deepDive.risks?.length && <Text label="Risks">{u.deepDive.risks.join('; ')}</Text>}
    {!!u.mechanism.combinationPotential?.length && <Text label="Pairs well with">{u.mechanism.combinationPotential.join('; ')}</Text>}
  </div>
);

const Sub = ({ e, depth = 0 }: { e: IndustryExpression; depth?: number }) => (
  <li className={depth ? 'ml-4' : ''}>
    <p className="text-sm break-words"><span className="font-medium">{e.name}</span> {e.insight}</p>
    {!!e.children?.length && <ul className="space-y-1 mt-1">{e.children.map((c) => <Sub key={c.id} e={c} depth={depth + 1} />)}</ul>}
  </li>
);

export const DigStep = ({ needName, industryId, onBack }: { needName: string; industryId: string; onBack: () => void }) => {
  const [loaded] = useCall(async () => {
    const need = await DBService.findNeedByName(needName);
    if (!need) throw new Error('This need is not saved yet. Go back and open its industries first.');
    return { need, saved: await getSavedUnderstanding(industryId) };
  }, `dig:${needName}:${industryId}`);
  // Local edits (a branch, a combine, a fresh analysis) win over what was loaded at the start.
  const [edited, setNeed] = useState<Need | null>(null);
  const [fresh, setUnderstanding] = useState<Understanding | null>(null);
  const [other, setOther] = useState('');
  const need = edited ?? (loaded.status === 'done' ? loaded.data.need : null);
  const understanding = fresh ?? (loaded.status === 'done' ? loaded.data.saved : null);

  const understandCall = useAction(async (n: Need, ind: IndustryExpression) => setUnderstanding(await understand(n.id, ind)));
  const branchCall = useAction(async (n: Need, ind: IndustryExpression) => setNeed(await branch(n.id, ind)));
  const combineCall = useAction(async (n: Need, a: IndustryExpression, b: IndustryExpression) => { setNeed(await combine(n.id, a, b)); setOther(''); });

  const industry = need ? locateInExpressionTree(getFutureExpressions(need), industryId)?.node : undefined;
  const others = need ? getFutureExpressions(need).filter((e) => e.id !== industryId) : [];

  return (
    <StepFrame
      step={2}
      what={industry ? `Digging into “${industry.name}”.` : 'Digging into one industry.'}
      why="Understand shows how it works and whether the business holds up. Branch splits it into narrower industries. Combine merges it with another to find something new."
      next={<Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" aria-hidden />} onClick={onBack}>Back to the industries</Button>}
    >
      {loaded.status === 'loading' ? <Loading label="Opening…" />
        : loaded.status === 'error' ? <Failed message={loaded.message} onRetry={() => location.reload()} />
        : !need || !industry ? <p role="alert" className="text-sm">This industry is no longer in the list.</p>
        : (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-semibold break-words">{industry.name}</h2>
              <p className="text-sm break-words">{industry.insight}</p>
            </div>

            <Section title="Understand" description="How it works, the pattern behind it, and the business picture, in one pass.">
              {understanding ? <UnderstandingView u={understanding} />
                : understandCall.state.status === 'loading' ? <Loading label="Analysing…" />
                : (
                  <div className="space-y-2">
                    {understandCall.state.status === 'error' && <Failed message={understandCall.state.message} onRetry={() => understandCall.run(need, industry)} />}
                    {understandCall.state.status !== 'error' && <Button variant="primary" icon={<Lightbulb className="w-4 h-4" aria-hidden />} onClick={() => understandCall.run(need, industry)}>Understand this industry</Button>}
                  </div>
                )}
            </Section>

            <Section title="Branch" description="Narrower industries that grow out of this one.">
              {!!industry.children?.length && <ul data-testid="branches" className="space-y-2 mb-3">{industry.children.map((c) => <Sub key={c.id} e={c} />)}</ul>}
              {branchCall.state.status === 'loading' ? <Loading label="Branching…" />
                : (
                  <div className="space-y-2">
                    {branchCall.state.status === 'error' && <Failed message={branchCall.state.message} onRetry={() => branchCall.run(need, industry)} />}
                    {branchCall.state.status !== 'error' && !industry.children?.length && <Button icon={<GitBranch className="w-4 h-4" aria-hidden />} onClick={() => branchCall.run(need, industry)}>Branch into sub-industries</Button>}
                  </div>
                )}
            </Section>

            <Section title="Combine" description="Merge it with another industry. The best-scoring hybrid joins your list.">
              {others.length === 0 ? <p className="text-sm text-ink-2">Needs a second industry to combine with.</p> : (
                <div className="space-y-2">
                  <Select
                    aria-label="Combine with"
                    value={other}
                    onChange={setOther}
                    placeholder="Pick another industry"
                    options={others.map((o) => ({ value: o.id, label: o.name }))}
                  />
                  {combineCall.state.status === 'loading' ? <Loading label="Combining…" /> : (
                    <>
                      {combineCall.state.status === 'error' && <Failed message={combineCall.state.message} onRetry={() => { const b = others.find((o) => o.id === other); if (b) combineCall.run(need, industry, b); }} />}
                      {combineCall.state.status !== 'error' && <Button disabled={!other} icon={<Shuffle className="w-4 h-4" aria-hidden />} onClick={() => { const b = others.find((o) => o.id === other); if (b) combineCall.run(need, industry, b); }}>Combine</Button>}
                    </>
                  )}
                  {combineCall.state.status === 'done' && (
                    <p role="status" className="text-sm"><Badge tone="pollen">Added</Badge> The hybrid is now in your industries list.</p>
                  )}
                </div>
              )}
            </Section>
          </div>
        )}
    </StepFrame>
  );
};
