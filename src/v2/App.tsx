import { useEffect, useState } from 'react';
import { BuildStep } from './BuildStep';
import { DigStep } from './DigStep';
import { FieldStep } from './FieldStep';
import { IndustriesStep } from './IndustriesStep';
import { InsightsStep } from './InsightsStep';
import { NavContext, type Place } from './nav';
import { NeedStep } from './NeedStep';
import { PinsStep } from './PinsStep';


function readPlace(): Place {
  const q = new URLSearchParams(window.location.search);
  const step = q.get('step');
  const industry = q.get('industry')?.slice(0, 100) || undefined;
  if (q.get('view') === 'insights') return { step: 'field', insights: true };
  if (q.get('view') === 'pins') return { step: 'field', pins: true };
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
    const q = next.insights ? '?view=insights' : next.pins ? '?view=pins' : next.need ? `?need=${encodeURIComponent(next.need)}${next.step === 'industries' ? '&step=industries' : next.step === 'dig' || next.step === 'build' ? `&step=${next.step}&industry=${encodeURIComponent(next.industry ?? '')}` : ''}` : '';
    window.history.pushState(null, '', window.location.pathname + q);
    // Arriving at Field from anywhere else drops the typed description: with one, the saved prior art is skipped and paid for again.
    if (next.need && next.step === 'field') setTyped(next.need !== place.need && desc ? { need: next.need, text: desc } : undefined);
    setPlace(next);
  };

  const screen = (): JSX.Element => {
    if (place.insights) return <InsightsStep onBack={() => go({ step: 'field' })} />;
    if (place.pins) return <PinsStep onBack={() => go({ step: 'field' })} />;
    if (!place.need) return <NeedStep onStart={(name, desc) => go({ need: name, step: 'field' }, desc)} onOpen={(name, step) => go({ need: name, step })} onInsights={() => go({ step: 'field', insights: true })} onPins={() => go({ step: 'field', pins: true })} />;
    const need = place.need;
    if (place.step === 'build' && place.industry) return <BuildStep needName={need} industryId={place.industry} onBack={() => go({ need, step: 'dig', industry: place.industry })} />;
    if (place.step === 'dig' && place.industry) return <DigStep needName={need} industryId={place.industry} onBack={() => go({ need, step: 'industries' })} onBuild={() => go({ need, step: 'build', industry: place.industry })} />;
    return place.step === 'industries'
      ? <IndustriesStep needName={need} description={description} onBack={() => go({ need, step: 'field' })} onDig={(industry) => go({ need, step: 'dig', industry })} />
      : <FieldStep needName={need} description={description} onBack={() => go({ step: 'field' })} onNext={() => go({ need, step: 'industries' })} />;
  };

  return <NavContext.Provider value={{ place, go }}>{screen()}</NavContext.Provider>;
}
