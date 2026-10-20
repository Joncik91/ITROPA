import { useEffect, useState } from 'react';
import { FieldStep } from './FieldStep';
import { IndustriesStep } from './IndustriesStep';
import { NeedStep } from './NeedStep';

type Step = 'field' | 'industries';
type Place = { need?: string; step: Step };

function readPlace(): Place {
  const q = new URLSearchParams(window.location.search);
  return { need: q.get('need')?.trim().slice(0, 200) || undefined, step: q.get('step') === 'industries' ? 'industries' : 'field' };
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
    const q = next.need ? `?need=${encodeURIComponent(next.need)}${next.step === 'industries' ? '&step=industries' : ''}` : '';
    window.history.pushState(null, '', window.location.pathname + q);
    if (next.need && next.step === 'field' && next.need !== place.need) setTyped(desc ? { need: next.need, text: desc } : undefined);
    setPlace(next);
  };

  if (!place.need) return <NeedStep onStart={(name, desc) => go({ need: name, step: 'field' }, desc)} />;
  const need = place.need;
  return place.step === 'industries'
    ? <IndustriesStep needName={need} description={description} onBack={() => go({ need, step: 'field' })} />
    : <FieldStep needName={need} description={description} onBack={() => go({ step: 'field' })} onNext={() => go({ need, step: 'industries' })} />;
}
