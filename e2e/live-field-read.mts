// Check 3: one real run against the live API. Saves the fixtures the e2e tests replay.
// Usage: API_BASE=http://100.108.36.107:5173 npx tsx e2e/live-field-read.mts
import { writeFileSync } from 'node:fs';
import { buildFetchPriorArtPrompt } from '../src/services/gemini/prompts/need-prompts';
import { extractJSON } from '../src/utils/json-parser';
import { normalizePriorArt } from '../src/utils/need-model';
import { PRIOR_ART_TOKENS } from '../src/v2/prior-art';
import { buildFieldReadPrompt, normalizeFieldRead } from '../src/v2/field-read';

const base = process.env.API_BASE ?? 'http://127.0.0.1:5173';
const NEED = 'Belonging';

async function call(prompt: string, maxTokens: number): Promise<unknown> {
  const res = await fetch(`${base}/api/gemini`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: base },
    body: JSON.stringify({ prompt, maxTokens }),
  });
  const body = (await res.json()) as { text?: string; truncated?: boolean; error?: string };
  if (!res.ok || !body.text) throw new Error(`API ${res.status}: ${body.error ?? 'no text'}`);
  if (body.truncated) throw new Error('answer was truncated');
  return extractJSON(body.text);
}

const priorArt = normalizePriorArt(await call(buildFetchPriorArtPrompt(NEED), PRIOR_ART_TOKENS));
const items = Object.values(priorArt).flat().length;
const field = normalizeFieldRead(await call(buildFieldReadPrompt(NEED, priorArt), 3500));

const long = (xs: { detail: string }[]) => xs.filter((x) => x.detail.length > 40).length;
console.log(`prior art items: ${items}`);
console.log(`gaps: ${field.gaps.length} (${long(field.gaps)} over 40 chars)`);
console.log(`white space: ${field.whiteSpace.length} (${long(field.whiteSpace)} over 40 chars)`);
console.log(`leaders: ${field.leaders.length}, entry moves: ${field.entryMoves.length}`);

const failures: string[] = [];
if (long(field.gaps) < 3) failures.push('fewer than 3 gaps with text over 40 chars');
if (long(field.whiteSpace) < 3) failures.push('fewer than 3 white-space items with text over 40 chars');
if (items < 12) failures.push('fewer than 12 prior-art items');
if (failures.length) { console.error('FAIL: ' + failures.join('; ')); process.exit(1); }

writeFileSync(new URL('./fixtures/belonging-prior-art.json', import.meta.url), JSON.stringify(priorArt, null, 2));
writeFileSync(new URL('./fixtures/belonging-field-read.json', import.meta.url), JSON.stringify(field, null, 2));
console.log('PASS, fixtures written');
