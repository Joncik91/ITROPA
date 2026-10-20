import { useState, type FormEvent } from 'react';
import { ChevronRight, Lightbulb, Search, Star } from 'lucide-react';
import { SUGGESTED_NEEDS } from '../config/constants';
import { Button, Chip, Field, Section, TextArea, TextInput } from '../components/ui';
import { loadLibrary, type LibraryRow } from './library';
import { loadPins } from './pins';
import { StepFrame } from './StepFrame';
import { Failed } from './status';
import { useCall } from './useCall';

const HOW_IT_WORKS = [
  'Need: pick the human need you care about.',
  'Field: see who already serves it and where the gaps are.',
  'Industries: see industries that could grow out of it.',
  'Dig in and Build: understand one industry and get app ideas that fit you.',
];

const Row = ({ r, onOpen }: { r: LibraryRow; onOpen: (name: string, step: 'industries' | 'field') => void }) => (
  <li>
    <button
      type="button"
      aria-label={`Open ${r.name}`}
      aria-describedby={`lib-${r.id}`}
      onClick={() => onOpen(r.name, r.opensAt)}
      className="w-full text-left p-3 rounded-card bg-sheet border border-line flex items-center gap-3 min-w-0"
    >
      <span className="flex-1 min-w-0 space-y-1">
        <span className="block font-semibold break-words">{r.name}</span>
        <span id={`lib-${r.id}`} className="block text-sm text-ink-2 break-words">
          {r.industries
            ? `${r.industries} industries · ${r.understood} understood · ${r.withConcepts} with app ideas · field read ${r.hasFieldRead ? 'done' : 'not yet'}`
            : 'Not finished yet. Opening it will research it.'}
        </span>
        <span className="block text-xs text-ink-2">{r.updatedAt ? `Updated ${new Date(r.updatedAt).toLocaleDateString()}` : 'Updated: unknown'}</span>
      </span>
      <ChevronRight className="w-5 h-5 text-ink-2 shrink-0" aria-hidden />
    </button>
  </li>
);

export const NeedStep = ({ onStart, onOpen, onInsights, onPins }: {
  onStart: (name: string, description?: string) => void;
  onOpen: (name: string, step: 'industries' | 'field') => void;
  onInsights: () => void;
  onPins: () => void;
}) => {
  const [library, retryLibrary] = useCall(loadLibrary, 'library');
  const rows = library.status === 'done' ? library.data : [];
  const [pinList] = useCall(loadPins, 'pins-count');
  const pinCount = pinList.status === 'done' ? pinList.data.length : 0;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [touched, setTouched] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (name.trim()) onStart(name.trim(), description.trim() || undefined);
  };

  return (
    <StepFrame
      step={0}
      what={rows.length ? 'Your saved research, and a place to start new research.' : 'Pick the human need you want to build around, such as belonging or sleep.'}
      why="Every industry and app idea starts from a need. A clear need gives sharper ideas."
    >
      {rows.length > 0 && (
        <Section title="Your research" description="Saved on this device. Tap one to continue where you left off.">
          <ul data-testid="library" className="space-y-2">
            {rows.map((r) => <Row key={r.id} r={r} onOpen={onOpen} />)}
          </ul>
          {rows.length >= 2 && (
            <Button variant="secondary" block icon={<Lightbulb className="w-4 h-4" aria-hidden />} onClick={onInsights}>Insights across your needs</Button>
          )}
        </Section>
      )}
      {pinCount > 0 && (
        <Button variant="secondary" block icon={<Star className="w-4 h-4" aria-hidden />} onClick={onPins}>Pins ({pinCount})</Button>
      )}
      {library.status === 'error' && <Failed message={`Could not read your saved research. ${library.message}`} onRetry={retryLibrary} />}
      {library.status === 'done' && rows.length === 0 && (
        <section data-testid="how-it-works" className="p-3 rounded-card border border-line bg-sheet space-y-2">
          <h2 className="font-semibold">How this works</h2>
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            {HOW_IT_WORKS.map((line) => <li key={line} className="break-words">{line}</li>)}
          </ol>
          <p className="text-sm text-ink-2">Everything you research is saved on this device.</p>
        </section>
      )}
      <form onSubmit={submit} className="space-y-4" noValidate>
        <h2 className="text-lg font-bold">{rows.length ? 'Research something new' : 'Start'}</h2>
        <div className="flex flex-wrap gap-2" aria-label="Common needs">
          {SUGGESTED_NEEDS.map((s) => (
            <Chip key={s.name} onClick={() => onStart(s.name)}>{s.name}</Chip>
          ))}
        </div>
        <Field
          label="Or type your own"
          hint="A need or a group of people, like “sleep” or “vibe coders”."
          error={touched && !name.trim() ? 'Type a need to research.' : null}
        >
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. sleep" maxLength={200} enterKeyHint="search" />
        </Field>
        <Field label="What you mean by it" optional hint="Narrows the research to your meaning. Runs fresh research instead of opening a saved one.">
          <TextArea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={1000} placeholder="e.g. people without coding skills who build software with AI" />
        </Field>
        <Button type="submit" variant="primary" block icon={<Search className="w-4 h-4" aria-hidden />}>Research this need</Button>
      </form>
    </StepFrame>
  );
};
