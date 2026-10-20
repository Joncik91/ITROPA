import { useEffect, useState, type FormEvent } from 'react';
import { Lightbulb, Search } from 'lucide-react';
import { DBService } from '../services/db/db.service';
import { SUGGESTED_NEEDS } from '../config/constants';
import { Button, Chip, Field, TextArea, TextInput } from '../components/ui';
import { StepFrame } from './StepFrame';

export const NeedStep = ({ onStart, onInsights }: { onStart: (name: string, description?: string) => void; onInsights: () => void }) => {
  const [saved, setSaved] = useState(0);
  useEffect(() => {
    let current = true;
    DBService.getAllNeeds().then((n) => current && setSaved(n.length), () => {});
    return () => { current = false; };
  }, []);
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
      what="Pick the human need you want to build around, such as belonging or sleep."
      why="Every industry and app idea starts from a need. A clear need gives sharper ideas."
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
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
      {saved >= 2 && (
        <div className="pt-2 border-t border-line space-y-2">
          <p className="text-sm text-ink-2">You have researched {saved} needs. See what repeats across them.</p>
          <Button variant="secondary" block icon={<Lightbulb className="w-4 h-4" aria-hidden />} onClick={onInsights}>Insights across your needs</Button>
        </div>
      )}
    </StepFrame>
  );
};
