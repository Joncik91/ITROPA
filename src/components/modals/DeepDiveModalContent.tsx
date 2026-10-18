/**
 * Deep dive: market, timing, competition and a solo-builder assessment for one industry.
 */

import { Rocket, Search, SkipForward, HelpCircle, AlertTriangle } from "lucide-react";
import type { AIActionSuggestion } from "../../types";
import { AIAssistant, AIAssistButton } from "../AIAssistant";
import { Badge, cx, type Tone } from "../ui";
import { Block, Item, Meter, asArray } from "./parts";

export interface DeepDiveModalContentProps {
  deepDive: any;
  aiSuggestions?: { suggestions: AIActionSuggestion[]; reasoning: string } | null;
  onAIAssist?: () => void;
  aiLoading?: boolean;
  onExecuteAction?: (suggestion: AIActionSuggestion) => Promise<boolean>;
}

const VERDICTS: Record<string, { label: string; tone: string; icon: typeof Rocket; meaning: string }> = {
  build: { label: "Build it", tone: "border-ok/50 bg-ok/10 text-ok", icon: Rocket, meaning: "Worth starting on as a solo builder." },
  explore: { label: "Explore further", tone: "border-warn/50 bg-warn/10 text-warn", icon: Search, meaning: "Promising, but validate before you build." },
  skip: { label: "Skip", tone: "border-bad/50 bg-bad/10 text-bad", icon: SkipForward, meaning: "Poor fit for a solo builder right now." },
};

const levelTone = (v?: string): Tone => {
  switch (v?.toLowerCase()) {
    case "easy":
    case "high":
      return "ok";
    case "medium":
      return "warn";
    case "hard":
    case "low":
      return "bad";
    default:
      return "neutral";
  }
};

const SCORES: Array<[key: string, label: string, hint: string]> = [
  ["marketTiming", "Market timing", "Is now the right moment? High means demand is arriving."],
  ["technicalFit", "Technical fit", "How buildable it is with today's tools."],
  ["effortEstimate", "Ease", "High means less effort to reach a first version."],
  ["monetizationClarity", "Monetization", "How obvious it is who pays, and for what."],
  ["competitionDensity", "Open market", "High means few competitors (blue ocean); low means crowded."],
];

const TextBlock = ({ title, text }: { title: string; text?: string }) =>
  text ? (
    <Block title={title}>
      <p className="text-sm">{text}</p>
    </Block>
  ) : null;

export const DeepDiveModalContent = ({ deepDive, aiSuggestions, onAIAssist, aiLoading, onExecuteAction }: DeepDiveModalContentProps) => {
  // Accept the details directly, or the legacy { details } shape.
  const data = deepDive?.details || deepDive || {};
  const rec = data.buildRecommendation;
  const verdict = rec ? VERDICTS[rec.verdict] : undefined;
  const VerdictIcon = verdict?.icon ?? HelpCircle;
  const score = data.opportunityScore;
  const solo = data.soloDevAssessment;

  return (
    <div className="space-y-6">
      {onAIAssist && <AIAssistButton onClick={onAIAssist} loading={!!aiLoading} />}
      {aiSuggestions && onExecuteAction && (
        <AIAssistant suggestions={aiSuggestions.suggestions} reasoning={aiSuggestions.reasoning} onExecuteAction={onExecuteAction} />
      )}

      {rec && (
        <div className={cx("p-4 rounded-card border", verdict?.tone ?? "border-line bg-well")}>
          <div className="flex items-center gap-2">
            <VerdictIcon className="w-5 h-5 shrink-0" aria-hidden />
            <p className="text-lg font-semibold">{verdict?.label ?? rec.verdict}</p>
            {rec.confidence !== undefined && <span className="ml-auto text-sm">{rec.confidence}% confident</span>}
          </div>
          {verdict && <p className="text-sm mt-0.5">{verdict.meaning}</p>}
          {rec.reasoning && <p className="text-sm text-ink mt-3">{rec.reasoning}</p>}
          {rec.nextStep && (
            <p className="text-sm text-ink mt-2">
              <span className="font-medium">Next step: </span>
              {rec.nextStep}
            </p>
          )}
        </div>
      )}

      {score && (
        <Block title="Opportunity scorecard">
          <div className="flex items-baseline justify-between p-3 rounded-control border border-line">
            <span className="font-medium">Overall</span>
            <span className={cx("text-xl font-extrabold", score.overallScore >= 70 ? "text-ok" : score.overallScore >= 40 ? "text-warn" : "text-bad")}>
              {score.overallScore}
              <span className="text-sm font-normal text-ink-2"> / 100</span>
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {SCORES.filter(([k]) => score[k] !== undefined).map(([k, label, hint]) => (
              <Meter key={k} label={label} value={score[k]} hint={hint} good={70} fair={40} />
            ))}
          </div>
          <p className="text-xs text-ink-2">Time to first version, stack and competition from this deep dive feed this industry's fit score against your builder profile.</p>
        </Block>
      )}

      {solo && (
        <Block title="As a solo builder">
          <Item className="space-y-3">
            {solo.feasibility && (
              <div className="flex items-center gap-2">
                <span className="text-ink-2">Feasibility</span>
                <Badge tone={levelTone(solo.feasibility)}>{solo.feasibility}</Badge>
              </div>
            )}
            {solo.timeToMVP && (
              <p><span className="text-ink-2">Time to first version: </span><span className="font-medium">{solo.timeToMVP}</span></p>
            )}
            {asArray<string>(solo.techStack).length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-ink-2 mr-1">Stack</span>
                {asArray<string>(solo.techStack).map((t, i) => <Badge key={i}>{t}</Badge>)}
              </div>
            )}
            {solo.biggestChallenge && (
              <p><span className="text-ink-2">Biggest challenge: </span>{solo.biggestChallenge}</p>
            )}
            {solo.unfairAdvantage && (
              <p><span className="text-ink-2">Your edge: </span><span className="text-ok">{solo.unfairAdvantage}</span></p>
            )}
          </Item>
        </Block>
      )}

      {asArray<any>(data.monetizationModels).length > 0 && (
        <Block title="Ways to make money">
          {asArray<any>(data.monetizationModels).map((m, i) => (
            <Item key={i}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{m.model}</p>
                {m.difficulty && <Badge tone={levelTone(m.difficulty)}>{m.difficulty}</Badge>}
              </div>
              {m.description && <p className="text-ink-2">{m.description}</p>}
              {m.revenueRange && <p className="font-medium text-ok">{m.revenueRange}</p>}
            </Item>
          ))}
        </Block>
      )}

      <Block title="Market opportunity">
        <p className="text-sm">{data.marketOpportunity || "No market opportunity was returned for this industry."}</p>
      </Block>

      {asArray<string>(data.keyEnablers).length > 0 && (
        <Block title="What makes it possible">
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {asArray<string>(data.keyEnablers).map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </Block>
      )}

      {asArray<any>(data.challenges).length > 0 && (
        <Block title="Challenges and how to solve them">
          {asArray<any>(data.challenges).map((c, i) => (
            <Item key={i}>
              <p className="font-medium">{c.challenge}</p>
              {c.potentialSolution && <p className="text-ink-2">{c.potentialSolution}</p>}
            </Item>
          ))}
        </Block>
      )}

      <TextBlock title="Timeline to market" text={data.timeline} />
      <TextBlock title="How to move first" text={data.firstMoverAdvantage} />
      <TextBlock title="What prior art gives you" text={data.priorArtLeverage} />

      {asArray<string>(data.keyPlayers).length > 0 && (
        <Block title="Likely key players">
          <div className="flex flex-wrap gap-1.5">
            {asArray<string>(data.keyPlayers).map((p, i) => <Badge key={i}>{p}</Badge>)}
          </div>
        </Block>
      )}

      {asArray<string>(data.risks).length > 0 && (
        <Block title="Risks">
          <ul className="space-y-1.5">
            {asArray<string>(data.risks).map((r, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-warn shrink-0 mt-0.5" aria-hidden />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </Block>
      )}
    </div>
  );
};
