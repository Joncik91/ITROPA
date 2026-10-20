import { geminiClient } from '../services/gemini/gemini-client';
import { JSON_ONLY } from '../services/gemini/prompts/common';
import type { PriorArt } from '../types';

/** One merged read of the field, replacing the five separate prior-art framework calls. */
export interface FieldRead {
  summary: string;
  leaders: { name: string; strength: string; weakness: string }[];
  gaps: { title: string; detail: string }[];
  whiteSpace: { title: string; detail: string }[];
  evolution: string;
  entryMoves: { title: string; detail: string }[];
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const list = (v: unknown): Obj[] => (Array.isArray(v) ? v.filter(isObj) : []);

function titled(raw: unknown): { title: string; detail: string }[] {
  return list(raw).flatMap((r) => {
    const title = str(r.title) || str(r.name);
    const detail = str(r.detail) || str(r.description);
    return title && detail ? [{ title, detail }] : [];
  });
}

/** Keeps only complete entries, so a half-filled model answer never shows as a thin card. */
export function normalizeFieldRead(raw: unknown): FieldRead {
  const src = isObj(raw) ? raw : {};
  return {
    summary: str(src.summary),
    leaders: list(src.leaders).flatMap((r) => {
      const name = str(r.name);
      return name ? [{ name, strength: str(r.strength), weakness: str(r.weakness) }] : [];
    }),
    gaps: titled(src.gaps),
    whiteSpace: titled(src.whiteSpace),
    evolution: str(src.evolution),
    entryMoves: titled(src.entryMoves),
  };
}

export const isUsableFieldRead = (f: FieldRead): boolean => f.gaps.length > 0 && f.whiteSpace.length > 0;

export function buildFieldReadPrompt(needName: string, priorArt: PriorArt): string {
  return `You are reading the competitive field around the human need "${needName}" for someone deciding which new industry or app to build.

PRIOR ART:
${JSON.stringify(priorArt)}

${JSON_ONLY}

{
  "summary": "2-3 sentences: how well the need is served today and where it is not",
  "leaders": [{"name": "Who leads", "strength": "Why they win", "weakness": "Where they fall short"}],
  "gaps": [{"title": "Short name of an unmet need", "detail": "Who is hurt, how badly, and why current solutions miss it (2 sentences)"}],
  "whiteSpace": [{"title": "Area nobody serves well", "detail": "Why it is open and what makes it valuable (2 sentences)"}],
  "evolution": "3-4 sentences: how solutions to this need evolved and what comes next",
  "entryMoves": [{"title": "A way for a newcomer to enter", "detail": "Why it could work against the leaders (2 sentences)"}]
}

Give 3-4 leaders, 4-5 gaps, 4-5 white-space areas and 3 entry moves. Be specific to this need, not generic. Ensure all JSON is valid with no trailing commas.`;
}

export async function runFieldRead(needName: string, priorArt: PriorArt): Promise<FieldRead> {
  const field = normalizeFieldRead(await geminiClient.callAPI(buildFieldReadPrompt(needName, priorArt), 3500));
  if (!isUsableFieldRead(field)) throw new Error('The field read came back without gaps or white space. Try again.');
  return field;
}
