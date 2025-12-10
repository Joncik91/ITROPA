import { JSON_ARRAY_ONLY } from './common';
import type { IndustryExpression } from '../../../types';

/**
 * Generate prompt for branching an industry into sub-industries
 */
export function buildBranchIndustryPrompt(parent: IndustryExpression): string {
  return `Generate 3 sub-industries that branch from "${parent.name}" (${parent.mutation}).

${JSON_ARRAY_ONLY}

[
  {"id": "${parent.id}-1", "type": "future", "name": "Sub-industry 1", "mutation": "What enables it", "insight": "Why it branches from parent", "inspirations": [{"source": "${parent.name}", "mechanism": "What is borrowed", "twist": "New application"}], "children": []},
  {"id": "${parent.id}-2", "type": "future", "name": "Sub-industry 2", "mutation": "What enables it", "insight": "Why it branches from parent", "inspirations": [{"source": "${parent.name}", "mechanism": "What is borrowed", "twist": "New application"}], "children": []},
  {"id": "${parent.id}-3", "type": "future", "name": "Sub-industry 3", "mutation": "What enables it", "insight": "Why it branches from parent", "inspirations": [{"source": "${parent.name}", "mechanism": "What is borrowed", "twist": "New application"}], "children": []}
]`;
}
