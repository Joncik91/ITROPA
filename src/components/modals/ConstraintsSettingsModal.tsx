/**
 * Modal content for configuring the user's Constraints Profile.
 * Allows users to set their skills, time, revenue goals, and preferences
 * for personalized industry analysis and app concept generation.
 */

import { useState } from "react";
import { Settings, RotateCcw, Save, Plus, X } from "lucide-react";
import type { Theme } from "../../config/theme";
import type { ConstraintsProfile } from "../../types";
import { DEFAULT_CONSTRAINTS } from "../../types";
import { ModalWrapper } from "../ModalWrapper";

interface ConstraintsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  profile: ConstraintsProfile;
  onSave: (profile: ConstraintsProfile) => void;
}

const TECH_STACK_OPTIONS = [
  "React", "TypeScript", "JavaScript", "Node.js", "Python", "Go", "Rust",
  "Vue", "Angular", "Svelte", "Next.js", "Express", "FastAPI", "Django",
  "PostgreSQL", "MongoDB", "Redis", "Firebase", "Supabase", "AWS", "GCP",
  "Docker", "Kubernetes", "GraphQL", "REST API"
];

const FORM_FACTOR_OPTIONS: Array<{ value: ConstraintsProfile['preferredFormFactors'][number]; label: string }> = [
  { value: 'saas', label: 'SaaS' },
  { value: 'tool', label: 'Tool' },
  { value: 'api', label: 'API' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'extension', label: 'Extension' },
  { value: 'mobile', label: 'Mobile' },
];

export const ConstraintsSettingsModal = ({
  isOpen,
  onClose,
  theme,
  profile,
  onSave,
}: ConstraintsSettingsModalProps) => {
  const [localProfile, setLocalProfile] = useState<ConstraintsProfile>(profile);
  const [newTech, setNewTech] = useState("");
  const [newAvoidCategory, setNewAvoidCategory] = useState("");

  const handleSave = () => {
    onSave(localProfile);
    onClose();
  };

  const handleReset = () => {
    setLocalProfile({ ...DEFAULT_CONSTRAINTS, lastUpdated: Date.now() });
  };

  const addTechStack = (tech: string) => {
    if (tech && !localProfile.techStack.includes(tech)) {
      setLocalProfile({
        ...localProfile,
        techStack: [...localProfile.techStack, tech],
      });
    }
    setNewTech("");
  };

  const removeTechStack = (tech: string) => {
    setLocalProfile({
      ...localProfile,
      techStack: localProfile.techStack.filter(t => t !== tech),
    });
  };

  const toggleFormFactor = (ff: ConstraintsProfile['preferredFormFactors'][number]) => {
    const exists = localProfile.preferredFormFactors.includes(ff);
    setLocalProfile({
      ...localProfile,
      preferredFormFactors: exists
        ? localProfile.preferredFormFactors.filter(f => f !== ff)
        : [...localProfile.preferredFormFactors, ff],
    });
  };

  const addAvoidCategory = () => {
    if (newAvoidCategory && !localProfile.avoidCategories.includes(newAvoidCategory)) {
      setLocalProfile({
        ...localProfile,
        avoidCategories: [...localProfile.avoidCategories, newAvoidCategory],
      });
    }
    setNewAvoidCategory("");
  };

  const removeAvoidCategory = (cat: string) => {
    setLocalProfile({
      ...localProfile,
      avoidCategories: localProfile.avoidCategories.filter(c => c !== cat),
    });
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Builder Profile"
      icon={<Settings className="w-5 h-5 text-blue-400" />}
      theme={theme}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Skills Section */}
        <section>
          <h4 className={`text-sm font-semibold uppercase tracking-wider ${theme.muted} mb-3`}>
            Skills & Experience
          </h4>

          {/* Tech Stack */}
          <div className="mb-4">
            <label className="text-sm mb-2 block">Tech Stack</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {localProfile.techStack.map(tech => (
                <span
                  key={tech}
                  className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${theme.itemBg}`}
                >
                  {tech}
                  <button onClick={() => removeTechStack(tech)} className="hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <select
                value={newTech}
                onChange={e => setNewTech(e.target.value)}
                className={`flex-1 px-3 py-2 rounded-lg ${theme.inputBg} border ${theme.border} text-sm`}
              >
                <option value="">Add technology...</option>
                {TECH_STACK_OPTIONS.filter(t => !localProfile.techStack.includes(t)).map(tech => (
                  <option key={tech} value={tech}>{tech}</option>
                ))}
              </select>
              <button
                onClick={() => addTechStack(newTech)}
                disabled={!newTech}
                className={`px-3 py-2 rounded-lg ${theme.accent} ${!newTech ? 'opacity-50' : ''}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Experience Level */}
          <div className="mb-4">
            <label className="text-sm mb-2 block">Experience Level</label>
            <div className="flex gap-2">
              {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setLocalProfile({ ...localProfile, experienceLevel: level })}
                  className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                    localProfile.experienceLevel === level
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                      : `${theme.itemBg} ${theme.hover}`
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* AI Access */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localProfile.hasAIAccess}
                onChange={e => setLocalProfile({ ...localProfile, hasAIAccess: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm">Has access to AI APIs (Gemini, Claude, OpenAI)</span>
            </label>
          </div>
        </section>

        {/* Time Section */}
        <section>
          <h4 className={`text-sm font-semibold uppercase tracking-wider ${theme.muted} mb-3`}>
            Time & Commitment
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm mb-2 block">Available Time</label>
              <select
                value={localProfile.availableTime}
                onChange={e => setLocalProfile({ ...localProfile, availableTime: e.target.value as ConstraintsProfile['availableTime'] })}
                className={`w-full px-3 py-2 rounded-lg ${theme.inputBg} border ${theme.border} text-sm`}
              >
                <option value="weekend">Weekend project</option>
                <option value="1-2 weeks">1-2 weeks</option>
                <option value="2-4 weeks">2-4 weeks</option>
                <option value="1-2 months">1-2 months</option>
                <option value="unlimited">Unlimited</option>
              </select>
            </div>

            <div>
              <label className="text-sm mb-2 block">Work Style</label>
              <select
                value={localProfile.workStyle}
                onChange={e => setLocalProfile({ ...localProfile, workStyle: e.target.value as ConstraintsProfile['workStyle'] })}
                className={`w-full px-3 py-2 rounded-lg ${theme.inputBg} border ${theme.border} text-sm`}
              >
                <option value="side-project">Side project</option>
                <option value="full-time">Full-time</option>
                <option value="exploring">Just exploring</option>
              </select>
            </div>
          </div>
        </section>

        {/* Revenue Section */}
        <section>
          <h4 className={`text-sm font-semibold uppercase tracking-wider ${theme.muted} mb-3`}>
            Revenue Goals
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm mb-2 block">Goal</label>
              <select
                value={localProfile.revenueGoal}
                onChange={e => setLocalProfile({ ...localProfile, revenueGoal: e.target.value as ConstraintsProfile['revenueGoal'] })}
                className={`w-full px-3 py-2 rounded-lg ${theme.inputBg} border ${theme.border} text-sm`}
              >
                <option value="learning">Learning / Portfolio</option>
                <option value="side-income">Side income ($1-5k MRR)</option>
                <option value="replace-salary">Replace salary ($5-15k MRR)</option>
                <option value="build-business">Build a business ($15k+ MRR)</option>
              </select>
            </div>

            <div>
              <label className="text-sm mb-2 block">Target MRR (optional)</label>
              <input
                type="text"
                value={localProfile.targetMRR || ''}
                onChange={e => setLocalProfile({ ...localProfile, targetMRR: e.target.value || undefined })}
                placeholder="e.g., $2-5k"
                className={`w-full px-3 py-2 rounded-lg ${theme.inputBg} border ${theme.border} text-sm`}
              />
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section>
          <h4 className={`text-sm font-semibold uppercase tracking-wider ${theme.muted} mb-3`}>
            Product Preferences
          </h4>

          {/* Form Factors */}
          <div className="mb-4">
            <label className="text-sm mb-2 block">Preferred Form Factors</label>
            <div className="flex flex-wrap gap-2">
              {FORM_FACTOR_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => toggleFormFactor(value)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    localProfile.preferredFormFactors.includes(value)
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                      : `${theme.itemBg} ${theme.hover}`
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Market */}
          <div className="mb-4">
            <label className="text-sm mb-2 block">Target Market</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localProfile.preferB2B}
                  onChange={e => setLocalProfile({ ...localProfile, preferB2B: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">B2B</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localProfile.preferB2C}
                  onChange={e => setLocalProfile({ ...localProfile, preferB2C: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">B2C</span>
              </label>
            </div>
          </div>

          {/* Risk Tolerance */}
          <div className="mb-4">
            <label className="text-sm mb-2 block">Risk Tolerance</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setLocalProfile({ ...localProfile, riskTolerance: level })}
                  className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                    localProfile.riskTolerance === level
                      ? level === 'low' ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                        : level === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                        : 'bg-red-500/20 text-red-300 border border-red-500/50'
                      : `${theme.itemBg} ${theme.hover}`
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className={`text-xs ${theme.muted} mt-1`}>
              Low = proven markets, High = blue ocean / experimental
            </p>
          </div>

          {/* Avoid Categories */}
          <div>
            <label className="text-sm mb-2 block">Categories to Avoid</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {localProfile.avoidCategories.map(cat => (
                <span
                  key={cat}
                  className="px-2 py-1 rounded-full text-xs flex items-center gap-1 bg-red-500/20 text-red-300"
                >
                  {cat}
                  <button onClick={() => removeAvoidCategory(cat)} className="hover:text-red-200">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAvoidCategory}
                onChange={e => setNewAvoidCategory(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addAvoidCategory()}
                placeholder="e.g., crypto, gambling"
                className={`flex-1 px-3 py-2 rounded-lg ${theme.inputBg} border ${theme.border} text-sm`}
              />
              <button
                onClick={addAvoidCategory}
                disabled={!newAvoidCategory}
                className={`px-3 py-2 rounded-lg bg-red-500/20 text-red-300 ${!newAvoidCategory ? 'opacity-50' : ''}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-gray-700">
          <button
            onClick={handleReset}
            className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${theme.hover}`}
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-sm flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Save className="w-4 h-4" />
            Save Profile
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
