/**
 * Modal content for displaying deep dive business analysis.
 * Shows market opportunity, key enablers, challenges, timeline, and risks.
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

export const DeepDiveModalContent = ({
  deepDive,
  theme,
  aiSuggestions,
  onAIAssist,
  aiLoading,
  onExecuteAction
}: DeepDiveModalContentProps) => (
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
    <div className={`p-3 rounded-lg ${theme.itemBg}`}>
      <p className={`text-xs ${theme.muted} mb-1`}>Market Opportunity</p>
      <p>{deepDive.details?.marketOpportunity}</p>
    </div>

    {deepDive.details?.keyEnablers && deepDive.details.keyEnablers.length > 0 && (
      <div>
        <p className={`text-xs font-medium ${theme.muted} mb-2`}>Key Enablers</p>
        {deepDive.details.keyEnablers.map((e: string, i: number) => (
          <div key={i} className={`mb-1 p-2 rounded ${theme.itemBgAlt} text-xs`}>{e}</div>
        ))}
      </div>
    )}

    {deepDive.details?.challenges && deepDive.details.challenges.length > 0 && (
      <div>
        <p className={`text-xs font-medium ${theme.muted} mb-2`}>Challenges & Solutions</p>
        {deepDive.details.challenges.map((c: any, i: number) => (
          <div key={i} className={`mb-2 p-2 rounded ${theme.itemBgAlt}`}>
            <p className="font-medium text-xs">{c.challenge}</p>
            <p className={`text-xs ${theme.muted} mt-1`}>→ {c.potentialSolution}</p>
          </div>
        ))}
      </div>
    )}

    {deepDive.details?.timeline && (
      <div className={`p-3 rounded-lg ${theme.itemBg}`}>
        <p className={`text-xs font-medium ${theme.muted} mb-1`}>Timeline to Market</p>
        <p className="text-xs">{deepDive.details.timeline}</p>
      </div>
    )}

    {deepDive.details?.firstMoverAdvantage && (
      <div className={`p-3 rounded-lg ${theme.itemBg}`}>
        <p className={`text-xs font-medium ${theme.muted} mb-1`}>First Mover Strategy</p>
        <p className="text-xs">{deepDive.details.firstMoverAdvantage}</p>
      </div>
    )}

    {deepDive.details?.priorArtLeverage && (
      <div className={`p-3 rounded-lg ${theme.itemBg}`}>
        <p className={`text-xs font-medium ${theme.muted} mb-1`}>Prior Art Advantage</p>
        <p className="text-xs">{deepDive.details.priorArtLeverage}</p>
      </div>
    )}

    {deepDive.details?.keyPlayers && deepDive.details.keyPlayers.length > 0 && (
      <div>
        <p className={`text-xs font-medium ${theme.muted} mb-2`}>Potential Key Players</p>
        <div className="flex flex-wrap gap-2">
          {deepDive.details.keyPlayers.map((player: string, i: number) => (
            <span key={i} className={`text-xs px-2 py-1 rounded-lg ${theme.itemBgAlt}`}>
              {player}
            </span>
          ))}
        </div>
      </div>
    )}

    {deepDive.details?.risks && deepDive.details.risks.length > 0 && (
      <div>
        <p className={`text-xs font-medium ${theme.muted} mb-2`}>Risk Factors</p>
        <div className="space-y-1">
          {deepDive.details.risks.map((risk: string, i: number) => (
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
