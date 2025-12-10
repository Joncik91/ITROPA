import { JSON_ARRAY_ONLY } from './common';
import type { IndustryExpression } from '../../../types';

/**
 * Generate prompt for cross-pollinating two industries
 */
export function buildCrossPollinatePrompt(a: IndustryExpression, b: IndustryExpression): string {
  return `You are an innovation strategist using systematic combination methods. Analyze and combine "${a.name}" and "${b.name}" using multiple strategies.

INPUT ANALYSIS:
Industry A: ${a.name}
- Mutation/Enabler: ${a.mutation}
- Core Value: ${a.insight}
- Mechanisms: ${a.inspirations?.map(i => i.mechanism).join(', ') || 'None specified'}

Industry B: ${b.name}
- Mutation/Enabler: ${b.mutation}
- Core Value: ${b.insight}
- Mechanisms: ${b.inspirations?.map(i => i.mechanism).join(', ') || 'None specified'}

COMBINATION STRATEGIES:
Generate exactly 5 novel industries using these distinct strategies:

1. ADDITIVE INTEGRATION: Both work side-by-side, complementing each other (like Uber + Eats = UberEats)
2. SUBSTITUTION: Replace a core component of A with B's strength (like TV + Internet = Streaming)
3. COMPLEMENTARY: One fills critical gaps of the other (like Hardware + Software ecosystems)
4. SEQUENTIAL ENABLEMENT: A creates conditions that enable B (like Smartphone enabling Mobile Apps)
5. CONTRADICTION SYNTHESIS: Resolve apparent conflicts to create new category (like Expensive + Cheap = Affordable Luxury)

For each combination, provide:
- A clear name that captures the hybrid nature
- The specific combination strategy used
- Synergy score (0-100): How well components amplify each other
- Novelty score (0-100): How unique and non-obvious this is
- Market fit: Who benefits and why
- Key challenges: 2-3 major obstacles to overcome

${JSON_ARRAY_ONLY}

[
  {
    "id": "cross-1",
    "type": "future",
    "name": "Clear hybrid name",
    "mutation": "What specifically enables this combination (technology, market shift, etc)",
    "insight": "Why this combination creates exponentially more value than either alone",
    "combinationType": "Additive Integration",
    "synergyScore": 85,
    "noveltyFactor": 75,
    "marketFit": "Specific target audience and use case",
    "challenges": ["Challenge 1", "Challenge 2", "Challenge 3"],
    "inspirations": [
      {"source": "${a.name}", "mechanism": "Specific element from A", "twist": "How it transforms in combination"},
      {"source": "${b.name}", "mechanism": "Specific element from B", "twist": "How it transforms in combination"}
    ],
    "children": []
  },
  {
    "id": "cross-2",
    "type": "future",
    "name": "Different hybrid using Substitution strategy",
    "mutation": "What enables this",
    "insight": "Why valuable",
    "combinationType": "Substitution",
    "synergyScore": 78,
    "noveltyFactor": 82,
    "marketFit": "Target audience",
    "challenges": ["Challenge 1", "Challenge 2"],
    "inspirations": [{"source": "${a.name}", "mechanism": "Element from A", "twist": "Transform"}, {"source": "${b.name}", "mechanism": "Element from B", "twist": "Transform"}],
    "children": []
  },
  {
    "id": "cross-3",
    "type": "future",
    "name": "Complementary combination",
    "mutation": "Enabler",
    "insight": "Value",
    "combinationType": "Complementary",
    "synergyScore": 88,
    "noveltyFactor": 70,
    "marketFit": "Target",
    "challenges": ["Challenge 1", "Challenge 2"],
    "inspirations": [{"source": "${a.name}", "mechanism": "Element A", "twist": "Transform"}, {"source": "${b.name}", "mechanism": "Element B", "twist": "Transform"}],
    "children": []
  },
  {
    "id": "cross-4",
    "type": "future",
    "name": "Sequential enablement combination",
    "mutation": "Enabler",
    "insight": "Value",
    "combinationType": "Sequential Enablement",
    "synergyScore": 80,
    "noveltyFactor": 85,
    "marketFit": "Target",
    "challenges": ["Challenge 1", "Challenge 2"],
    "inspirations": [{"source": "${a.name}", "mechanism": "Element A", "twist": "Transform"}, {"source": "${b.name}", "mechanism": "Element B", "twist": "Transform"}],
    "children": []
  },
  {
    "id": "cross-5",
    "type": "future",
    "name": "Contradiction synthesis combination",
    "mutation": "Enabler",
    "insight": "Value",
    "combinationType": "Contradiction Synthesis",
    "synergyScore": 92,
    "noveltyFactor": 90,
    "marketFit": "Target",
    "challenges": ["Challenge 1", "Challenge 2"],
    "inspirations": [{"source": "${a.name}", "mechanism": "Element A", "twist": "Transform"}, {"source": "${b.name}", "mechanism": "Element B", "twist": "Transform"}],
    "children": []
  }
]`;
}
