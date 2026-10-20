// Live check for Dig in: one real Understand, Branch and Combine call on a saved Belonging industry.
// Usage: API_BASE=http://100.108.36.107:5173 npx tsx e2e/live-dig.mts
import { readFileSync } from 'node:fs';
import { extractJSON } from '../src/utils/json-parser';
import { normalizeDeepDive } from '../src/utils/ai-normalizers';
import { getFutureExpressions, normalizeExpressions, normalizeNeed } from '../src/utils/need-model';
import { buildBranchIndustryPrompt } from '../src/services/gemini/prompts/branch-prompts';
import { buildCrossPollinatePrompt } from '../src/services/gemini/prompts/cross-pollinate-prompts';
import { UNDERSTAND_TOKENS } from '../src/v2/tokens';
import { buildUnderstandPrompt } from '../src/v2/dig-model';
import { buildAppConceptPrompt } from '../src/services/gemini/prompts/app-concept-prompts';
import { normalizeAppConcepts } from '../src/utils/ai-normalizers';
import { fitScore } from '../src/v2/fit';
import { DEFAULT_CONSTRAINTS } from '../src/types';

const base = process.env.API_BASE ?? 'http://127.0.0.1:5173';

async function call(prompt: string, maxTokens: number): Promise<unknown> {
  const res = await fetch(`${base}/api/gemini`, { method: 'POST', headers: { 'content-type': 'application/json', origin: base }, body: JSON.stringify({ prompt, maxTokens }) });
  const body = (await res.json()) as { text?: string; truncated?: boolean; error?: string };
  if (!res.ok || !body.text) throw new Error(`API ${res.status}: ${body.error ?? 'no text'}`);
  if (body.truncated) throw new Error('answer was truncated');
  return extractJSON(body.text);
}

const need = normalizeNeed(JSON.parse(readFileSync(new URL('./fixtures/belonging-need.json', import.meta.url), 'utf8')), 'Belonging', {});
const [a, b] = getFutureExpressions(need);

const u = (await call(buildUnderstandPrompt(a), UNDERSTAND_TOKENS)) as { mechanism?: Record<string, unknown>; deepDive?: unknown };
const dd = normalizeDeepDive(u.deepDive);
const subs = normalizeExpressions(await call(buildBranchIndustryPrompt(a), 2500));
const hybrids = normalizeExpressions(await call(buildCrossPollinatePrompt(a, b), 4000));

const concepts = normalizeAppConcepts(await call(buildAppConceptPrompt(a), 5000));
console.log(`build: ${concepts.length} concepts, fit scores ${concepts.map((c) => fitScore(c, DEFAULT_CONSTRAINTS).score).join(',')}, efforts ${concepts.map((c) => c.effortEstimate).join(',')}`);
console.log(`understand: mechanism ${String(u.mechanism?.coreMechanism ?? '').length} chars, pattern ${String(u.mechanism?.abstractPattern ?? '').length}, market ${dd.marketOpportunity.length}, enablers ${dd.keyEnablers.length}, challenges ${dd.challenges.length}`);
console.log(`branch: ${subs.length} sub-industries; combine: ${hybrids.length} hybrids, scores ${hybrids.map((h) => h.synergyScore).join(',')}`);
const fail: string[] = [];
if (String(u.mechanism?.coreMechanism ?? '').length < 40) fail.push('thin mechanism');
if (String(u.mechanism?.abstractPattern ?? '').length < 20) fail.push('thin pattern');
if (dd.marketOpportunity.length < 40 || dd.keyEnablers.length < 2 || dd.challenges.length < 2) fail.push('thin deep dive');
if (subs.length < 3) fail.push('fewer than 3 sub-industries');
if (concepts.length < 2 || concepts.some((c) => !c.name || !c.coreFeature || c.techStack.length === 0)) fail.push('thin app concepts');
if (hybrids.length < 1) fail.push('no hybrids');
if (fail.length) { console.error('FAIL: ' + fail.join('; ')); process.exit(1); }
console.log('PASS');
