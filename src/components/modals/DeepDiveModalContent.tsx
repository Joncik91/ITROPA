/**
 * Modal content for displaying deep dive business analysis.
 * Shows market opportunity, key enablers, challenges, timeline, risks,
 * and enhanced opportunity scoring for solo developers.
 */

import type { AIActionSuggestion } from "../../types";
import type { Theme } from "../../config/theme";
import { AIAssistant, AIAssistButton } from "../AIAssistant";

export interface DeepDiveModalContentProps {
  deepDive: any;
  theme: Theme;
  aiSuggestions?: { suggestions: AIActionSuggestion[]; reasoning: string } | null;
  onAIAssist?: () => void;
  aiLoading?: boolean;
  onExecuteAction?: (suggestion: AIActionSuggestion) => Promise<void>;
}

/** Score bar component for opportunity scores */
const ScoreBar = ({ label, score, theme }: { label: string; score: number; theme: Theme }) => {
  const getScoreColor = (s: number) => {
    if (s >= 70) return 'bg-green-500';
    if (s >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center gap-2 mb-2">
      <span className={`text-xs ${theme.muted} w-32 truncate`}>{label}</span>
      <div className={`flex-1 h-2 rounded-full ${theme.itemBgAlt}`}>
        <div
          className={`h-2 rounded-full ${getScoreColor(score)} transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-medium w-8 text-right">{score}</span>
    </div>
  );
};

/** Build recommendation banner */
const BuildRecommendationBanner = ({ recommendation, theme }: { recommendation: any; theme: Theme }) => {
  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case 'build': return 'bg-green-500/20 border-green-500 text-green-400';
      case 'explore': return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      case 'skip': return 'bg-red-500/20 border-red-500 text-red-400';
      default: return `${theme.itemBg} border-gray-500`;
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'build': return '🚀';
      case 'explore': return '🔍';
      case 'skip': return '⏭️';
      default: return '❓';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getVerdictStyle(recommendation.verdict)}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{getVerdictIcon(recommendation.verdict)}</span>
        <span className="font-bold text-lg uppercase">{recommendation.verdict}</span>
        <span className={`text-xs ${theme.muted} ml-auto`}>
          {recommendation.confidence}% confidence
        </span>
      </div>
      <p className="text-sm mb-2">{recommendation.reasoning}</p>
      <div className={`text-xs ${theme.muted} flex items-center gap-1`}>
        <span>→</span>
        <span className="font-medium">Next step:</span>
        <span>{recommendation.nextStep}</span>
      </div>
    </div>
  );
};

/** Difficulty badge */
const DifficultyBadge = ({ difficulty, theme }: { difficulty: string; theme: Theme }) => {
  const getColor = (d: string) => {
    switch (d) {
      case 'easy': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'hard': return 'bg-red-500/20 text-red-400';
      default: return theme.itemBgAlt;
    }
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded ${getColor(difficulty)}`}>
      {difficulty}
    </span>
  );
};

/** Feasibility badge */
const FeasibilityBadge = ({ feasibility }: { feasibility: string }) => {
  const getStyle = (f: string) => {
    switch (f) {
      case 'high': return 'bg-green-500/20 text-green-400 border-green-500';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      case 'low': return 'bg-red-500/20 text-red-400 border-red-500';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };
  return (
    <span className={`text-xs px-2 py-1 rounded border ${getStyle(feasibility)}`}>
      {feasibility} feasibility
    </span>
  );
};

export const DeepDiveModalContent = ({
  deepDive,
  theme,
  aiSuggestions,
  onAIAssist,
  aiLoading,
  onExecuteAction
}: DeepDiveModalContentProps) => {
  // Handle both formats:
  // 1. deepDive is the data directly (from API or cache)
  // 2. deepDive.details contains the data (legacy format)
  const data = deepDive?.details || deepDive || {};

  return (
  <div className="space-y-4 text-sm">
    {/* AI Assistant */}
    {onAIAssist && (
      <div className="mb-4">
        <AIAssistButton onClick={onAIAssist} loading={!!aiLoading} theme={theme} />
      </div>
    )}
    {aiSuggestions && onExecuteAction && (
      <div className="mb-4">
        <AIAssistant
          suggestions={aiSuggestions.suggestions}
          reasoning={aiSuggestions.reasoning}
          theme={theme}
          onExecuteAction={onExecuteAction}
        />
      </div>
    )}

    {/* Build Recommendation Banner - Show first if available */}
    {data.buildRecommendation && (
      <BuildRecommendationBanner
        recommendation={data.buildRecommendation}
        theme={theme}
      />
    )}

    {/* Opportunity Scores */}
    {data.opportunityScore && (
      <div className={`p-3 rounded-lg ${theme.itemBg}`}>
        <p className={`text-xs font-medium ${theme.muted} mb-3`}>Opportunity Scorecard</p>
        <ScoreBar label="Market Timing" score={data.opportunityScore.marketTiming} theme={theme} />
        <ScoreBar label="Technical Fit" score={data.opportunityScore.technicalFit} theme={theme} />
        <ScoreBar label="Effort (ease)" score={data.opportunityScore.effortEstimate} theme={theme} />
        <ScoreBar label="Monetization" score={data.opportunityScore.monetizationClarity} theme={theme} />
        <ScoreBar label="Blue Ocean" score={data.opportunityScore.competitionDensity} theme={theme} />
        <div className="border-t border-gray-600 mt-3 pt-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Overall Score</span>
            <span className={`text-lg font-bold ${
              data.opportunityScore.overallScore >= 70 ? 'text-green-400' :
              data.opportunityScore.overallScore >= 40 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {data.opportunityScore.overallScore}/100
            </span>
          </div>
        </div>
      </div>
    )}

    {/* Solo Dev Assessment */}
    {data.soloDevAssessment && (
      <div className={`p-3 rounded-lg ${theme.itemBg}`}>
        <div className="flex items-center justify-between mb-3">
          <p className={`text-xs font-medium ${theme.muted}`}>Solo Dev Assessment</p>
          <FeasibilityBadge feasibility={data.soloDevAssessment.feasibility} />
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className={theme.muted}>Time to MVP:</span>
            <p className="font-medium">{data.soloDevAssessment.timeToMVP}</p>
          </div>
          <div>
            <span className={theme.muted}>Tech Stack:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {data.soloDevAssessment.techStack?.map((tech: string, i: number) => (
                <span key={i} className={`px-1.5 py-0.5 rounded ${theme.itemBgAlt}`}>{tech}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3 space-y-2 text-xs">
          <div>
            <span className={`${theme.muted}`}>Biggest Challenge:</span>
            <p>{data.soloDevAssessment.biggestChallenge}</p>
          </div>
          <div>
            <span className={`${theme.muted}`}>Your Unfair Advantage:</span>
            <p className="text-green-400">{data.soloDevAssessment.unfairAdvantage}</p>
          </div>
        </div>
      </div>
    )}

    {/* Monetization Models */}
    {data.monetizationModels && data.monetizationModels.length > 0 && (
      <div>
        <p className={`text-xs font-medium ${theme.muted} mb-2`}>Monetization Models</p>
        <div className="space-y-2">
          {data.monetizationModels.map((model: any, i: number) => (
            <div key={i} className={`p-3 rounded-lg ${theme.itemBgAlt}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-xs">{model.model}</span>
                <DifficultyBadge difficulty={model.difficulty} theme={theme} />
              </div>
              <p className={`text-xs ${theme.muted} mb-1`}>{model.description}</p>
              <p className="text-xs text-green-400 font-medium">{model.revenueRange}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Original Deep Dive Content */}
    <div className={`p-3 rounded-lg ${theme.itemBg}`}>
      <p className={`text-xs ${theme.muted} mb-1`}>Market Opportunity</p>
      <p>{data.marketOpportunity || 'No market opportunity data available.'}</p>
    </div>

    {data.keyEnablers && data.keyEnablers.length > 0 && (
      <div>
        <p className={`text-xs font-medium ${theme.muted} mb-2`}>Key Enablers</p>
        {data.keyEnablers.map((e: string, i: number) => (
          <div key={i} className={`mb-1 p-2 rounded ${theme.itemBgAlt} text-xs`}>{e}</div>
        ))}
      </div>
    )}

    {data.challenges && data.challenges.length > 0 && (
      <div>
        <p className={`text-xs font-medium ${theme.muted} mb-2`}>Challenges & Solutions</p>
        {data.challenges.map((c: any, i: number) => (
          <div key={i} className={`mb-2 p-2 rounded ${theme.itemBgAlt}`}>
            <p className="font-medium text-xs">{c.challenge}</p>
            <p className={`text-xs ${theme.muted} mt-1`}>→ {c.potentialSolution}</p>
          </div>
        ))}
      </div>
    )}

    {data.timeline && (
      <div className={`p-3 rounded-lg ${theme.itemBg}`}>
        <p className={`text-xs font-medium ${theme.muted} mb-1`}>Timeline to Market</p>
        <p className="text-xs">{data.timeline}</p>
      </div>
    )}

    {data.firstMoverAdvantage && (
      <div className={`p-3 rounded-lg ${theme.itemBg}`}>
        <p className={`text-xs font-medium ${theme.muted} mb-1`}>First Mover Strategy</p>
        <p className="text-xs">{data.firstMoverAdvantage}</p>
      </div>
    )}

    {data.priorArtLeverage && (
      <div className={`p-3 rounded-lg ${theme.itemBg}`}>
        <p className={`text-xs font-medium ${theme.muted} mb-1`}>Prior Art Advantage</p>
        <p className="text-xs">{data.priorArtLeverage}</p>
      </div>
    )}

    {data.keyPlayers && data.keyPlayers.length > 0 && (
      <div>
        <p className={`text-xs font-medium ${theme.muted} mb-2`}>Potential Key Players</p>
        <div className="flex flex-wrap gap-2">
          {data.keyPlayers.map((player: string, i: number) => (
            <span key={i} className={`text-xs px-2 py-1 rounded-lg ${theme.itemBgAlt}`}>
              {player}
            </span>
          ))}
        </div>
      </div>
    )}

    {data.risks && data.risks.length > 0 && (
      <div>
        <p className={`text-xs font-medium ${theme.muted} mb-2`}>Risk Factors</p>
        <div className="space-y-1">
          {data.risks.map((risk: string, i: number) => (
            <div key={i} className={`text-xs p-2 rounded ${theme.itemBgAlt} flex items-start gap-2`}>
              <span className="text-red-400">⚠</span>
              <span className="flex-1">{risk}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
  );
};
