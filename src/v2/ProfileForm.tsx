import { useState } from 'react';
import { Button, Chip, Field, Select, TextInput } from '../components/ui';
import type { ConstraintsProfile } from '../types';
import { saveProfile } from './profile';

const TIMES = ['weekend', '1-2 weeks', '2-4 weeks', '1-2 months', 'unlimited'] as const;
const FORMS = ['saas', 'tool', 'api', 'marketplace', 'extension', 'mobile'] as const;
const list = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

/** The four things the fit score looks at. Everything else in the profile is kept as it was. */
export const ProfileForm = ({ profile, onSaved, onCancel }: { profile: ConstraintsProfile; onSaved: (p: ConstraintsProfile) => void; onCancel: () => void }) => {
  const [tech, setTech] = useState(profile.techStack.join(', '));
  const [time, setTime] = useState(profile.availableTime);
  const [forms, setForms] = useState(profile.preferredFormFactors);
  const [avoid, setAvoid] = useState(profile.avoidCategories.join(', '));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: ConstraintsProfile = { ...profile, techStack: list(tech), availableTime: time, preferredFormFactors: forms, avoidCategories: list(avoid) };
    saveProfile(next);
    onSaved(next);
  };

  return (
    <form onSubmit={submit} aria-label="Edit profile" className="space-y-4 p-3 rounded-card border border-line bg-sheet">
      <Field label="Technologies you build with" hint="Separate with commas. A concept that uses none of them loses 25 points.">
        <TextInput value={tech} onChange={(e) => setTech(e.target.value)} placeholder="React, TypeScript, Node.js" />
      </Field>
      <Field label="Time you have" hint="A concept that takes longer loses 25 points.">
        <Select value={time} onChange={setTime} options={TIMES.map((t) => ({ value: t, label: t }))} />
      </Field>
      <div className="space-y-1.5">
        <p className="text-sm font-medium">Product types you prefer</p>
        <div className="flex flex-wrap gap-2">
          {FORMS.map((f) => (
            <Chip key={f} selected={forms.includes(f)} onClick={() => setForms(forms.includes(f) ? forms.filter((x) => x !== f) : [...forms, f])}>{f}</Chip>
          ))}
        </div>
        <p className="text-sm text-ink-2">Any other type loses 25 points.</p>
      </div>
      <Field label="Categories to avoid" optional hint="Separate with commas. A concept that mentions one loses 25 points.">
        <TextInput value={avoid} onChange={(e) => setAvoid(e.target.value)} placeholder="crypto, gambling" />
      </Field>
      <div className="flex gap-2">
        <Button type="submit" variant="primary">Save profile</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
};
