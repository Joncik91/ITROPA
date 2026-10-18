/**
 * Mechanism analysis: how an industry works, seen through several frameworks.
 */

import type { AIActionSuggestion } from "../../types";
import { AIAssistant, AIAssistButton } from "../AIAssistant";
import { Badge } from "../ui";
import { ratingTone } from "../../utils/badge-styles";
import { getFrameworkLabel, MECHANISM_FRAMEWORKS } from "../../config/analysis-frameworks";
import { Block, Item, Line, Meter, Disclosure, asArray } from "./parts";

export interface MechanismModalContentProps {
  mechanism: any;
  aiSuggestions?: { suggestions: AIActionSuggestion[]; reasoning: string } | null;
  onAIAssist?: () => void;
  aiLoading?: boolean;
  onExecuteAction?: (suggestion: AIActionSuggestion) => Promise<boolean>;
}

const RATINGS: Array<[key: string, label: string]> = [
  ["abstractionLevel", "Abstraction"],
  ["complexityRating", "Complexity"],
  ["universality", "Universality"],
  ["disruptionPotential", "Disruption"],
];

const frameworkDescription = (type?: string) =>
  type && type in MECHANISM_FRAMEWORKS ? MECHANISM_FRAMEWORKS[type as keyof typeof MECHANISM_FRAMEWORKS].description : undefined;

export const MechanismModalContent = ({ mechanism, aiSuggestions, onAIAssist, aiLoading, onExecuteAction }: MechanismModalContentProps) => {
  // Accept the analyses array directly, or the legacy { details } shape.
  const raw = Array.isArray(mechanism)
    ? mechanism
    : Array.isArray(mechanism?.details)
      ? mechanism.details
      : mechanism?.details
        ? [mechanism.details]
        : [];
  const analyses = asArray<any>(raw);

  return (
    <div className="space-y-4">
      {onAIAssist && <AIAssistButton onClick={onAIAssist} loading={!!aiLoading} />}
      {aiSuggestions && onExecuteAction && (
        <AIAssistant suggestions={aiSuggestions.suggestions} reasoning={aiSuggestions.reasoning} onExecuteAction={onExecuteAction} />
      )}

      {analyses.length === 0 ? (
        <p className="p-4 rounded-card border border-line text-sm text-ink-2">
          No mechanism analysis was saved for this industry. Close this and run Mechanism again.
        </p>
      ) : (
        <p className="text-sm text-ink-2">
          {analyses.length} {analyses.length === 1 ? "framework" : "frameworks"}. Tap one to open it.
        </p>
      )}

      {analyses.map((a: any, idx: number) => {
        const desc = frameworkDescription(a.analysisType);
        const ratings = RATINGS.filter(([k]) => a[k]);
        const causal = a.causalChain;
        const scale = a.scaleContextInsights;
        return (
          <Disclosure key={idx} defaultOpen={idx === 0} title={getFrameworkLabel(a.analysisType)}>
            {desc && <p className="text-sm text-ink-2">{desc}.</p>}

            {a.coreMechanism && (
              <div className="p-3 rounded-control border-l-2 border-accent bg-accent/5">
                <p className="text-xs text-ink-2 mb-0.5">Core mechanism</p>
                <p className="font-medium">{a.coreMechanism}</p>
              </div>
            )}

            {a.abstractPattern && (
              <Block title="Abstract pattern">
                <p className="text-sm">{a.abstractPattern}</p>
              </Block>
            )}

            {(a.transferPotential !== undefined || a.maturityScore !== undefined) && (
              <div className="grid gap-2 sm:grid-cols-2">
                {a.transferPotential !== undefined && (
                  <Meter label="Transfer potential" value={a.transferPotential} hint="How easily this mechanism moves to other domains." />
                )}
                {a.maturityScore !== undefined && (
                  <Meter label="Maturity" value={a.maturityScore} hint="How established and proven it already is." />
                )}
              </div>
            )}

            {ratings.length > 0 && (
              <dl className="flex flex-wrap gap-x-4 gap-y-2">
                {ratings.map(([k, label]) => (
                  <div key={k} className="flex items-center gap-1.5">
                    <dt className="text-sm text-ink-2">{label}</dt>
                    <dd><Badge tone={ratingTone(a[k])}>{a[k]}</Badge></dd>
                  </div>
                ))}
              </dl>
            )}

            {asArray<any>(a.keyPrinciples).length > 0 && (
              <Block title="Key principles">
                {asArray<any>(a.keyPrinciples).map((p, i) => (
                  <Item key={i}>
                    <p className="font-medium">{p.principle}</p>
                    {p.function && <p>{p.function}</p>}
                    <Line label="Why it's critical" muted>{p.criticality}</Line>
                  </Item>
                ))}
              </Block>
            )}

            {asArray<any>(a.structuralElements).length > 0 && (
              <Block title="Structural elements">
                {asArray<any>(a.structuralElements).map((e, i) => (
                  <Item key={i}>
                    <p className="font-medium">{e.element}</p>
                    <Line label="Role">{e.role}</Line>
                    <Line label="Interacts with" muted>{e.interactions}</Line>
                  </Item>
                ))}
              </Block>
            )}

            {causal && (
              <Block title="Cause and effect">
                <Item className="space-y-2">
                  <Line label="Trigger">{causal.trigger}</Line>
                  {asArray<string>(causal.sequence).length > 0 && (
                    <ol className="list-decimal pl-5 space-y-1">
                      {asArray<string>(causal.sequence).map((step, i) => <li key={i}>{step}</li>)}
                    </ol>
                  )}
                  <Line label="Outcome">{causal.outcome}</Line>
                  {asArray<string>(causal.interventionPoints).length > 0 && (
                    <div>
                      <p className="font-medium">Where to intervene</p>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        {asArray<string>(causal.interventionPoints).map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                  )}
                </Item>
              </Block>
            )}

            {asArray<any>(a.constraintOpportunities).length > 0 && (
              <Block title="Constraints that open opportunities">
                {asArray<any>(a.constraintOpportunities).map((co, i) => (
                  <Item key={i}>
                    <Line label="Constraint">{co.constraint}</Line>
                    <Line label="Opportunity">{co.opportunity}</Line>
                    <Line label="Application" muted>{co.application}</Line>
                  </Item>
                ))}
              </Block>
            )}

            {scale && (
              <Block title="At different scales">
                <Item className="space-y-1.5">
                  <Line label="Individual">{scale.microScale}</Line>
                  <Line label="Organisation">{scale.mesoScale}</Line>
                  <Line label="Society">{scale.macroScale}</Line>
                  {asArray<string>(scale.contextVariations).length > 0 && (
                    <ul className="list-disc pl-5 space-y-1">
                      {asArray<string>(scale.contextVariations).map((v, i) => <li key={i}>{v}</li>)}
                    </ul>
                  )}
                </Item>
              </Block>
            )}

            {asArray<any>(a.historicalApplications).length > 0 && (
              <Block title="Where it has worked before">
                {asArray<any>(a.historicalApplications).map((h, i) => (
                  <Item key={i}>
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-medium">{h.domain}</p>
                      {h.era && <span className="text-xs text-ink-2 shrink-0">{h.era}</span>}
                    </div>
                    {h.example && <p>{h.example}</p>}
                    <Line label="Why it worked">{h.successFactors}</Line>
                    <Line label="Limits" muted>{h.limitations}</Line>
                    <Line label="How it evolved">{h.evolutionPath}</Line>
                  </Item>
                ))}
              </Block>
            )}

            {asArray<any>(a.untappedDomains).length > 0 && (
              <Block title="Untapped domains">
                {asArray<any>(a.untappedDomains).map((u, i) => (
                  <Item key={i} className="border-pollen/40">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{u.domain}</p>
                      {u.impactPotential && <Badge tone={ratingTone(u.impactPotential)}>{u.impactPotential} impact</Badge>}
                    </div>
                    <Line label="Opportunity">{u.opportunity}</Line>
                    <Line label="What's new">{u.novelty}</Line>
                    <Line label="Barriers" muted>{u.transferBarriers}</Line>
                    <Line label="Needed changes">{u.requiredAdaptations}</Line>
                  </Item>
                ))}
              </Block>
            )}

            {asArray<string>(a.combinationPotential).length > 0 && (
              <Block title="Combines well with">
                <div className="flex flex-wrap gap-1.5">
                  {asArray<string>(a.combinationPotential).map((c, i) => <Badge key={i}>{c}</Badge>)}
                </div>
              </Block>
            )}
          </Disclosure>
        );
      })}
    </div>
  );
};
