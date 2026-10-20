import { useEffect, useState } from 'react';
import { BuildStep } from './BuildStep';
import { DigStep } from './DigStep';
import { FieldStep } from './FieldStep';
import { IndustriesStep } from './IndustriesStep';
import { NeedStep } from './NeedStep';

type Step = 'field' | 'industries' | 'dig' | 'build';
type Place = { need?: string; step: Step; industry?: string };

function readPlace(): Place {
  const q = new URLSearchParams(window.location.search);
  const step = q.get('step');
  const industry = q.get('industry')?.slice(0, 100) || undefined;
  return { need: q.get('need')?.trim().slice(0, 200) || undefined, step: (step === 'dig' || step === 'build') && industry ? step : step === 'industries' ? 'industries' : 'field', industry };
}

/** The need and step live in the URL, so a reload or a shared link resumes where you were. */
export default function App() {
  const [place, setPlace] = useState<Place>(readPlace);
  // The description belongs to the need it was typed for, so Back or a different need never inherits it.
  const [typed, setTyped] = useState<{ need: string; text: string } | undefined>();
  const description = typed && typed.need === place.need ? typed.text : undefined;

  useEffect(() => {
    const onPop = () => setPlace(readPlace());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const go = (next: Place, desc?: string) => {
    const q = next.need ? `?need=${encodeURIComponent(next.need)}${next.step === 'industries' ? '&step=industries' : next.step === 'dig' || next.step === 'build' ? `&step=${next.step}&industry=${encodeURIComponent(next.industry ?? '')}` : ''}` : '';
    window.history.pushState(null, '', window.location.pathname + q);
    if (next.need && next.step === 'field' && next.need !== place.need) setTyped(desc ? { need: next.need, text: desc } : undefined);
    setPlace(next);
  };

  if (!place.need) return <NeedStep onStart={(name, desc) => go({ need: name, step: 'field' }, desc)} />;
  const need = place.need;
  if (place.step === 'build' && place.industry) return <BuildStep needName={need} industryId={place.industry} onBack={() => go({ need, step: 'dig', industry: place.industry })} />;
  if (place.step === 'dig' && place.industry) return <DigStep needName={need} industryId={place.industry} onBack={() => go({ need, step: 'industries' })} onBuild={() => go({ need, step: 'build', industry: place.industry })} />;
  return place.step === 'industries'
    ? <IndustriesStep needName={need} description={description} onBack={() => go({ need, step: 'field' })} onDig={(industry) => go({ need, step: 'dig', industry })} />
    : <FieldStep needName={need} description={description} onBack={() => go({ step: 'field' })} onNext={() => go({ need, step: 'industries' })} />;
}
