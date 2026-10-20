import { useState } from 'react';
import { ArrowLeft, UserCog } from 'lucide-react';
import { Badge, Button, Section } from '../components/ui';
import { DBService } from '../services/db/db.service';
import { getFutureExpressions, locateInExpressionTree } from '../utils/need-model';
import type { ConstraintsProfile } from '../types';
import { loadConcepts, rankConcepts, type ScoredConcept } from './build';
import { PinStar } from './PinStar';
import { ProfileForm } from './ProfileForm';
import { StepFrame } from './StepFrame';
import { Failed, Loading } from './status';
import { useCall } from './useCall';
import { hasSavedProfile, loadProfile } from './profile';

const Line = ({ label, children }: { label: string; children?: string }) =>
  children ? <p className="text-sm break-words"><span className="font-medium">{label}: </span>{children}</p> : null;

const Concept = ({ s, needName, industryId }: { s: ScoredConcept; needName: string; industryId: string }) => {
  const c = s.concept;
  return (
    <article data-testid="concept" className="p-3 rounded-card bg-sheet border border-line space-y-2 min-w-0">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold break-words">{c.name}</h3>
          <p className="text-sm text-ink-2 break-words">{c.tagline}</p>
        </div>
        <Badge tone={s.score >= 75 ? 'ok' : s.score >= 50 ? 'warn' : 'bad'}><span data-testid="fit">{s.score}</span>/100 fit</Badge>
      </div>
      {s.reasons.length ? (
        <ul className="text-sm space-y-0.5">{s.reasons.map((r) => <li key={r} className="break-words">• {r}</li>)}</ul>
      ) : <p className="text-sm">Fits your profile on all four counts.</p>}
      <Line label="Effort (AI's estimate)">{c.effortEstimate}</Line>
      <Line label="For">{c.targetUser}</Line>
      <Line label="Solves">{c.problemSolved}</Line>
      <Line label="Core feature">{c.coreFeature}</Line>
      <Line label="Makes money by">{[c.monetization.model, c.monetization.pricing].filter(Boolean).join(', ')}</Line>
      <Line label="Built with">{c.techStack.join(', ')}</Line>
      <Line label="Smallest first version">{c.mvpScope}</Line>
      <Line label="Why it wins">{c.competitiveEdge}</Line>
      <Line label="Risks">{c.risks.join('; ')}</Line>
      <PinStar pin={{ kind: 'concept', needName, industryId, label: c.name, text: c.tagline, conceptName: c.name }} />
    </article>
  );
};

export const BuildStep = ({ needName, industryId, onBack }: { needName: string; industryId: string; onBack: () => void }) => {
  const [loaded, retry] = useCall(async () => {
    const need = await DBService.findNeedByName(needName);
    const industry = need && locateInExpressionTree(getFutureExpressions(need), industryId)?.node;
    if (!need || !industry) throw new Error('This industry is no longer in the list.');
    return { industry, concepts: await loadConcepts(need.id, industry) };
  }, `build:${needName}:${industryId}`);
  const [profile, setProfile] = useState<ConstraintsProfile>(loadProfile);
  const [saved, setSaved] = useState(hasSavedProfile);
  const [editing, setEditing] = useState(false);

  return (
    <StepFrame
      step={3}
      what={loaded.status === 'done' ? `App ideas for “${loaded.data.industry.name}”, scored against your profile.` : 'App ideas for this industry, scored against your profile.'}
      why="An industry is only useful if you can build something in it. Each idea gets a fit score from your skills, time and preferences, so you can pick one you can actually ship."
      next={<Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" aria-hidden />} onClick={onBack}>Back to this industry</Button>}
    >
      <div className="space-y-5">
        <div className="p-3 rounded-card border border-line space-y-2">
          <p className="text-sm break-words" data-testid="profile-line">
            {saved ? 'Scored against your saved profile: ' : 'No profile saved yet, so these use a default: '}
            {profile.techStack.join(', ') || 'no technologies listed'}; {profile.availableTime}; prefers {profile.preferredFormFactors.join(', ') || 'no product type'}.
          </p>
          {!editing && <Button size="sm" icon={<UserCog className="w-4 h-4" aria-hidden />} onClick={() => setEditing(true)}>Edit profile</Button>}
        </div>
        {editing && <ProfileForm profile={profile} onCancel={() => setEditing(false)} onSaved={(p) => { setProfile(p); setSaved(true); setEditing(false); }} />}

        {loaded.status === 'loading' ? <Loading label="Thinking up app ideas…" />
          : loaded.status === 'error' ? <Failed message={loaded.message} onRetry={retry} />
          : (
            <Section title="App ideas" description="Best fit first.">
              <div data-testid="concepts" className="space-y-3">
                {rankConcepts(loaded.data.concepts, profile).map((s) => <Concept key={s.concept.id} s={s} needName={needName} industryId={industryId} />)}
              </div>
            </Section>
          )}
      </div>
    </StepFrame>
  );
};
