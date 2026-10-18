/**
 * Builder profile editor. The whole profile is included in deep-dive and app-idea prompts
 * (utils/constraints-storage.ts serializeConstraintsForPrompt); part of it also scores deep-dived
 * industries for fit (utils/match-score.ts), which drives the tree's fit filter. Stored in this browser.
 */

import { useEffect, useState } from "react";
import { Settings, RotateCcw, Save, Plus, X } from "lucide-react";
import type { ConstraintsProfile } from "../../types";
import { DEFAULT_CONSTRAINTS } from "../../types";
import { Sheet, Button, Field, Hint, TextInput, Select, Segmented, Toggle, Chip, Section, type Option } from "../ui";

interface ConstraintsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ConstraintsProfile;
  onSave: (profile: ConstraintsProfile) => void;
}

const TECH_STACK_OPTIONS = [
  "React", "TypeScript", "JavaScript", "Node.js", "Python", "Go", "Rust",
  "Vue", "Angular", "Svelte", "Next.js", "Express", "FastAPI", "Django",
  "PostgreSQL", "MongoDB", "Redis", "Firebase", "Supabase", "AWS", "GCP",
  "Docker", "Kubernetes", "GraphQL", "REST API",
];

type FormFactor = ConstraintsProfile["preferredFormFactors"][number];

const FORM_FACTOR_OPTIONS: Array<{ value: FormFactor; label: string }> = [
  { value: "saas", label: "SaaS" },
  { value: "tool", label: "Tool" },
  { value: "api", label: "API" },
  { value: "marketplace", label: "Marketplace" },
  { value: "extension", label: "Extension" },
  { value: "mobile", label: "Mobile" },
];

const EXPERIENCE_OPTIONS: ReadonlyArray<Option<ConstraintsProfile["experienceLevel"]>> = [
  { value: "beginner", label: "Beginner", description: "You're still learning the basics of shipping software." },
  { value: "intermediate", label: "Intermediate", description: "You've shipped a few projects and can work independently." },
  { value: "advanced", label: "Advanced", description: "You're comfortable with architecture, infrastructure and scaling." },
];

const TIME_OPTIONS: ReadonlyArray<Option<ConstraintsProfile["availableTime"]>> = [
  { value: "weekend", label: "A weekend", description: "Only industries whose MVP takes a few days score well on time." },
  { value: "1-2 weeks", label: "1–2 weeks", description: "MVPs estimated at up to two weeks score well on time." },
  { value: "2-4 weeks", label: "2–4 weeks", description: "MVPs estimated at up to a month score well on time." },
  { value: "1-2 months", label: "1–2 months", description: "MVPs estimated at up to two months score well on time." },
  { value: "unlimited", label: "No limit", description: "Time never lowers the score." },
];

const WORK_STYLE_OPTIONS: ReadonlyArray<Option<ConstraintsProfile["workStyle"]>> = [
  { value: "side-project", label: "Side project", description: "Evenings and weekends next to other work." },
  { value: "full-time", label: "Full-time", description: "This is your main focus." },
  { value: "exploring", label: "Just exploring", description: "No commitment yet; you're looking around." },
];

const REVENUE_OPTIONS: ReadonlyArray<Option<ConstraintsProfile["revenueGoal"]>> = [
  { value: "learning", label: "Learning or portfolio", description: "Revenue doesn't matter; the experience does." },
  { value: "side-income", label: "Side income ($1–5k MRR)", description: "Enough to matter, not enough to quit." },
  { value: "replace-salary", label: "Replace salary ($5–15k MRR)", description: "A product that can pay your living costs." },
  { value: "build-business", label: "Build a business ($15k+ MRR)", description: "A company with room to hire." },
];

const RISK_OPTIONS: ReadonlyArray<Option<ConstraintsProfile["riskTolerance"]>> = [
  { value: "low", label: "Low", description: "Crowded, proven markets score higher; untested ones score lower." },
  { value: "medium", label: "Medium", description: "Competition level barely moves the score." },
  { value: "high", label: "High", description: "Untested, low-competition markets score higher; crowded ones lower." },
];

export const ConstraintsSettingsModal = ({ isOpen, onClose, profile, onSave }: ConstraintsSettingsModalProps) => {
  const [local, setLocal] = useState<ConstraintsProfile>(profile);
  const [newTech, setNewTech] = useState("");
  const [newAvoid, setNewAvoid] = useState("");

  // Each opening edits a fresh copy of the saved profile; unsaved edits are discarded.
  useEffect(() => {
    if (isOpen) {
      setLocal(profile);
      setNewTech("");
      setNewAvoid("");
    }
  }, [isOpen, profile]);

  const update = (patch: Partial<ConstraintsProfile>) => setLocal((p) => ({ ...p, ...patch }));

  const addTech = (tech: string) => {
    const t = tech.trim();
    if (t && !local.techStack.some((x) => x.toLowerCase() === t.toLowerCase())) update({ techStack: [...local.techStack, t] });
    setNewTech("");
  };

  const toggleFormFactor = (ff: FormFactor) =>
    update({
      preferredFormFactors: local.preferredFormFactors.includes(ff)
        ? local.preferredFormFactors.filter((f) => f !== ff)
        : [...local.preferredFormFactors, ff],
    });

  const addAvoid = () => {
    const c = newAvoid.trim();
    if (c && !local.avoidCategories.includes(c)) update({ avoidCategories: [...local.avoidCategories, c] });
    setNewAvoid("");
  };

  const footer = (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        icon={<RotateCcw className="w-4 h-4" />}
        onClick={() => setLocal({ ...DEFAULT_CONSTRAINTS, lastUpdated: Date.now() })}
        title="Replace every field with the defaults. Nothing is saved until you press Save profile."
      >
        Reset to defaults
      </Button>
      <Button
        variant="primary"
        className="flex-1 md:flex-none md:ml-auto"
        icon={<Save className="w-4 h-4" />}
        onClick={() => {
          onSave({ ...local, lastUpdated: Date.now() });
          onClose();
        }}
      >
        Save profile
      </Button>
    </div>
  );

  const techSuggestions = TECH_STACK_OPTIONS.filter((t) => !local.techStack.includes(t));

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Builder profile"
      description="Tailors deep dives and app ideas: the whole profile is sent with those AI requests. It also scores deep-dived industries for fit, which powers the fit filter. Saved in this browser."
      icon={<Settings className="w-5 h-5" />}
      size="lg"
      footer={footer}
    >
      <div className="space-y-8">
        <Section title="Skills" description="Compared with the tech stack a deep dive recommends.">
          <div className="space-y-2">
            <p className="text-sm font-medium">Tech stack</p>
            {local.techStack.length > 0 ? (
              <ul className="flex flex-wrap gap-2" aria-label="Your tech stack">
                {local.techStack.map((tech) => (
                  <li key={tech}>
                    <Chip selected tone="accent" onClick={() => update({ techStack: local.techStack.filter((t) => t !== tech) })} aria-label={`Remove ${tech}`}>
                      {tech}
                      <X className="w-3.5 h-3.5" aria-hidden />
                    </Chip>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-2">No technologies yet. Every tech requirement will count as a gap.</p>
            )}
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <Select
                  aria-label="Add a technology"
                  value={newTech}
                  placeholder="Add a technology…"
                  options={techSuggestions.map((t) => ({ value: t, label: t }))}
                  onChange={(v) => addTech(v)}
                />
              </div>
            </div>
            <Hint>Tap a technology to remove it. The more of a deep dive's recommended stack you know, the higher its tech fit (25% of the score).</Hint>
          </div>

          <Toggle
            checked={local.hasAIAccess}
            onChange={(v) => update({ hasAIAccess: v })}
            label="I can use AI APIs (Gemini, Claude, OpenAI)"
            hint={local.hasAIAccess ? "Industries that need an AI API are scored normally." : "Industries whose stack needs an AI API get a low tech fit."}
          />

          <div className="space-y-1.5">
            <p className="text-sm font-medium">Experience</p>
            <Segmented label="Experience" value={local.experienceLevel} options={EXPERIENCE_OPTIONS} onChange={(v) => update({ experienceLevel: v })} />
            <Hint>Sent with deep dives and app ideas; not part of the fit score.</Hint>
          </div>
        </Section>

        <Section title="Time" description="Compared with the time-to-MVP a deep dive estimates.">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Time you can give a first version" hint="Time fit is 25% of the score.">
              <Select value={local.availableTime} options={TIME_OPTIONS} onChange={(v) => update({ availableTime: v })} />
            </Field>
            <Field label="Work style" hint="Sent with deep dives and app ideas; not part of the fit score.">
              <Select value={local.workStyle} options={WORK_STYLE_OPTIONS} onChange={(v) => update({ workStyle: v })} />
            </Field>
          </div>
        </Section>

        <Section title="Revenue">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Goal" hint="Sent with deep dives and app ideas; not part of the fit score.">
              <Select value={local.revenueGoal} options={REVENUE_OPTIONS} onChange={(v) => update({ revenueGoal: v })} />
            </Field>
            <Field label="Target MRR" optional hint="Free text, e.g. $2–5k. Sent with deep dives and app ideas; not part of the fit score.">
              <TextInput
                value={local.targetMRR ?? ""}
                onChange={(e) => update({ targetMRR: e.target.value || undefined })}
                placeholder="$2–5k"
                maxLength={40}
              />
            </Field>
          </div>
        </Section>

        <Section title="Product">
          <div className="space-y-2">
            <p className="text-sm font-medium" id="ff-label">Form factors you'd build</p>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="ff-label">
              {FORM_FACTOR_OPTIONS.map(({ value, label }) => (
                <Chip key={value} selected={local.preferredFormFactors.includes(value)} onClick={() => toggleFormFactor(value)}>
                  {label}
                </Chip>
              ))}
            </div>
            <Hint>Select any number. The industry's likely form factor is guessed from its name and insight; a match raises form fit (15% of the score).</Hint>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Markets</p>
            <Toggle
              checked={local.preferB2B}
              onChange={(v) => update({ preferB2B: v })}
              label="Businesses (B2B)"
              hint={local.preferB2B ? "Industries aimed at teams and companies score higher on market fit." : "Industries aimed at businesses get a lower market fit."}
            />
            <Toggle
              checked={local.preferB2C}
              onChange={(v) => update({ preferB2C: v })}
              label="Consumers (B2C)"
              hint={local.preferB2C ? "Industries aimed at individuals score higher on market fit." : "Industries aimed at consumers get a lower market fit."}
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium">Risk tolerance</p>
            <Segmented
              label="Risk tolerance"
              value={local.riskTolerance}
              options={RISK_OPTIONS}
              onChange={(v) => update({ riskTolerance: v })}
              tone={(v) => (v === "low" ? "text-ok" : v === "medium" ? "text-warn" : "text-bad")}
            />
            <Hint>Compared with the competition level a deep dive finds. Risk fit is 20% of the score.</Hint>
          </div>

          <div className="space-y-2">
            {local.avoidCategories.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Categories to avoid">
                {local.avoidCategories.map((cat) => (
                  <li key={cat}>
                    <Chip selected tone="bad" onClick={() => update({ avoidCategories: local.avoidCategories.filter((c) => c !== cat) })} aria-label={`Remove ${cat}`}>
                      {cat}
                      <X className="w-3.5 h-3.5" aria-hidden />
                    </Chip>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2 items-end">
              <Field className="flex-1" label="Categories to avoid" optional hint="Press Enter to add. The AI is told to avoid these in deep dives and app ideas; they don't change the fit score.">
                <TextInput
                  value={newAvoid}
                  onChange={(e) => setNewAvoid(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addAvoid();
                    }
                  }}
                  placeholder="crypto, gambling"
                  maxLength={60}
                />
              </Field>
            </div>
            <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={addAvoid} disabled={!newAvoid.trim()}>
              Add category
            </Button>
          </div>
        </Section>
      </div>
    </Sheet>
  );
};
