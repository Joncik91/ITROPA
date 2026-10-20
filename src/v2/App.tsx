import { useEffect, useState } from 'react';
import { FieldStep } from './FieldStep';
import { NeedStep } from './NeedStep';

const readNeed = () => new URLSearchParams(window.location.search).get('need')?.trim().slice(0, 200) || undefined;

/** The need lives in the URL, so a reload or a shared link resumes at the Field step. */
export default function App() {
  const [need, setNeed] = useState<string | undefined>(readNeed);
  const [description, setDescription] = useState<string | undefined>();

  useEffect(() => {
    const onPop = () => setNeed(readNeed());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const go = (name: string | undefined, desc?: string) => {
    const url = name ? `${window.location.pathname}?need=${encodeURIComponent(name)}` : window.location.pathname;
    window.history.pushState(null, '', url);
    setDescription(desc);
    setNeed(name);
  };

  return need
    ? <FieldStep needName={need} description={description} onBack={() => go(undefined)} />
    : <NeedStep onStart={(name, desc) => go(name, desc)} />;
}
