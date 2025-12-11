/**
 * Modal content for displaying generated app concepts.
 * Shows concept cards with name, tagline, form factor, target user,
 * monetization, effort, and viability score.
 */

import { useState } from 'react';
import type { AppConcept } from '../../types';
import type { Theme } from '../../config/theme';

export interface AppConceptModalContentProps {
  concepts: AppConcept[];
  industryName: string;
  theme: Theme;
  dark: boolean;
}

/** Form factor badge */
const FormFactorBadge = ({ formFactor }: { formFactor: string }) => {
  const getStyle = (ff: string) => {
    switch (ff) {
      case 'saas': return 'bg-blue-500/20 text-blue-400 border-blue-500';
      case 'tool': return 'bg-purple-500/20 text-purple-400 border-purple-500';
      case 'api': return 'bg-green-500/20 text-green-400 border-green-500';
      case 'marketplace': return 'bg-orange-500/20 text-orange-400 border-orange-500';
      case 'extension': return 'bg-pink-500/20 text-pink-400 border-pink-500';
      case 'mobile': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded border ${getStyle(formFactor)}`}>
      {formFactor}
    </span>
  );
};

/** Effort badge */
const EffortBadge = ({ effort }: { effort: string }) => {
  const getStyle = (e: string) => {
    switch (e) {
      case 'weekend': return 'bg-green-500/20 text-green-400';
      case '1-2 weeks': return 'bg-green-500/20 text-green-400';
      case '2-4 weeks': return 'bg-yellow-500/20 text-yellow-400';
      case '1-2 months': return 'bg-orange-500/20 text-orange-400';
      case '3+ months': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded ${getStyle(effort)}`}>
      {effort}
    </span>
  );
};

/** Score indicator */
const ScoreIndicator = ({ score }: { score: number }) => {
  const getColor = (s: number) => {
    if (s >= 70) return 'text-green-400';
    if (s >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };
  return (
    <div className="flex items-center gap-1">
      <span className={`text-lg font-bold ${getColor(score)}`}>{score}</span>
      <span className="text-xs text-gray-500">/100</span>
    </div>
  );
};

/** Individual concept card */
const ConceptCard = ({
  concept,
  theme,
  dark,
  expanded,
  onToggle
}: {
  concept: AppConcept;
  theme: Theme;
  dark: boolean;
  expanded: boolean;
  onToggle: () => void;
}) => {
  return (
    <div
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        dark ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
      onClick={onToggle}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">{concept.name}</h3>
            <FormFactorBadge formFactor={concept.formFactor} />
          </div>
          <p className={`text-sm ${theme.muted}`}>{concept.tagline}</p>
        </div>
        <ScoreIndicator score={concept.score} />
      </div>

      {/* Quick info row */}
      <div className="flex items-center gap-3 mb-3 text-xs">
        <EffortBadge effort={concept.effortEstimate} />
        <span className={theme.muted}>{concept.targetUser}</span>
      </div>

      {/* Core feature */}
      <div className={`p-2 rounded ${theme.itemBgAlt} mb-3`}>
        <p className={`text-xs ${theme.muted} mb-1`}>Core Feature</p>
        <p className="text-sm">{concept.coreFeature}</p>
      </div>

      {/* Monetization preview */}
      <div className="flex items-center justify-between text-sm mb-2">
        <span className={theme.muted}>{concept.monetization.model}</span>
        <span className="text-green-400 font-medium">{concept.monetization.revenueEstimate}</span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-600 space-y-3">
          {/* Problem & Solution */}
          <div>
            <p className={`text-xs ${theme.muted} mb-1`}>Problem Solved</p>
            <p className="text-sm">{concept.problemSolved}</p>
          </div>

          {/* MVP Scope */}
          <div>
            <p className={`text-xs ${theme.muted} mb-1`}>MVP Scope</p>
            <p className="text-sm">{concept.mvpScope}</p>
          </div>

          {/* Tech Stack */}
          <div>
            <p className={`text-xs ${theme.muted} mb-1`}>Tech Stack</p>
            <div className="flex flex-wrap gap-1">
              {concept.techStack.map((tech, i) => (
                <span key={i} className={`text-xs px-2 py-0.5 rounded ${theme.itemBgAlt}`}>
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Monetization details */}
          <div className={`p-3 rounded ${theme.itemBg}`}>
            <p className={`text-xs ${theme.muted} mb-2`}>Monetization Details</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className={theme.muted}>Model:</span>
                <p>{concept.monetization.model}</p>
              </div>
              <div>
                <span className={theme.muted}>Pricing:</span>
                <p>{concept.monetization.pricing}</p>
              </div>
            </div>
          </div>

          {/* Competitive Edge */}
          <div>
            <p className={`text-xs ${theme.muted} mb-1`}>Competitive Edge</p>
            <p className="text-sm text-green-400">{concept.competitiveEdge}</p>
          </div>

          {/* Risks */}
          {concept.risks && concept.risks.length > 0 && (
            <div>
              <p className={`text-xs ${theme.muted} mb-1`}>Risks</p>
              <ul className="space-y-1">
                {concept.risks.map((risk, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-red-400">!</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Expand hint */}
      <div className={`text-center text-xs ${theme.muted} mt-2`}>
        {expanded ? 'Click to collapse' : 'Click to expand'}
      </div>
    </div>
  );
};

export const AppConceptModalContent = ({
  concepts,
  industryName,
  theme,
  dark
}: AppConceptModalContentProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'effort'>('score');

  // Sort concepts
  const sortedConcepts = [...concepts].sort((a, b) => {
    if (sortBy === 'score') {
      return b.score - a.score;
    }
    // Sort by effort (quickest first)
    const effortOrder = ['weekend', '1-2 weeks', '2-4 weeks', '1-2 months', '3+ months'];
    return effortOrder.indexOf(a.effortEstimate) - effortOrder.indexOf(b.effortEstimate);
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs ${theme.muted}`}>
            {concepts.length} concepts generated for
          </p>
          <p className="font-medium">{industryName}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${theme.muted}`}>Sort by:</span>
          <button
            onClick={() => setSortBy('score')}
            className={`text-xs px-2 py-1 rounded ${
              sortBy === 'score' ? 'bg-blue-500/20 text-blue-400' : theme.itemBgAlt
            }`}
          >
            Score
          </button>
          <button
            onClick={() => setSortBy('effort')}
            className={`text-xs px-2 py-1 rounded ${
              sortBy === 'effort' ? 'bg-blue-500/20 text-blue-400' : theme.itemBgAlt
            }`}
          >
            Effort
          </button>
        </div>
      </div>

      {/* Concept cards - grid on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sortedConcepts.map((concept) => (
          <ConceptCard
            key={concept.id}
            concept={concept}
            theme={theme}
            dark={dark}
            expanded={expandedId === concept.id}
            onToggle={() => setExpandedId(expandedId === concept.id ? null : concept.id)}
          />
        ))}
      </div>

      {/* Summary stats */}
      <div className={`p-3 rounded-lg ${theme.itemBg} mt-4`}>
        <p className={`text-xs ${theme.muted} mb-2`}>Quick Stats</p>
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="font-bold text-green-400">
              {concepts.filter(c => c.score >= 70).length}
            </p>
            <p className={`text-xs ${theme.muted}`}>High Score</p>
          </div>
          <div>
            <p className="font-bold text-blue-400">
              {concepts.filter(c => ['weekend', '1-2 weeks'].includes(c.effortEstimate)).length}
            </p>
            <p className={`text-xs ${theme.muted}`}>Quick Wins</p>
          </div>
          <div>
            <p className="font-bold text-purple-400">
              {new Set(concepts.map(c => c.formFactor)).size}
            </p>
            <p className={`text-xs ${theme.muted}`}>Form Factors</p>
          </div>
        </div>
      </div>
    </div>
  );
};
