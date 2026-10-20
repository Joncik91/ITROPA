import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { DBService } from '../services/db/db.service';
import { db } from '../services/db/db-client';
import type { IndustryExpression, Need } from '../types';
import { buildInsights, loadInsights } from './insights';

const ind = (id: string, name: string, inspirations: IndustryExpression['inspirations'] = [], children: IndustryExpression[] = []): IndustryExpression => ({
  id, type: 'future', name, mutation: 'm', insight: 'i', children, inspirations,
});
const need = (id: string, name: string, list: IndustryExpression[]): Need => ({
  id, name, icon: 'Users', description: 'd', eras: [{ name: 'Post-AI Era (2025+)', expressions: list }],
});
const mech = (id: string, needId: string, name: string, abstractPattern: string, coreMechanism: string) => ({
  id, needId, expressionName: name, createdAt: 1,
  details: [{ coreMechanism, abstractPattern }] as never,
});

const meetup = { source: 'Meetup', mechanism: 'local groups', twist: 'AI hosts' };
const NEEDS = [
  need('n1', 'Belonging', [ind('a', 'Care circles', [meetup], [ind('a2', 'Night circles', [{ source: 'Lodges', mechanism: 'rituals', twist: 'remote' }])])]),
  need('n2', 'Sleep', [ind('b', 'Sleep clubs', [{ source: ' meetup ', mechanism: 'shared schedule', twist: 'wearables' }])]),
];

describe('buildInsights', () => {
  it('shows a pattern only when industries of two different needs share it', () => {
    const r = buildInsights(NEEDS, [
      mech('a', 'n1', 'Care circles', 'Synchrony creates bonds', 'Shared action builds trust'),
      mech('b', 'n2', 'Sleep clubs', 'Synchrony creating bonds', 'Shared rhythm lowers stress'),
      mech('a2', 'n1', 'Night circles', 'Scarcity pricing', 'Limited seats'),
    ]);
    expect(r.patterns).toHaveLength(1);
    expect(r.patterns[0].needs.sort()).toEqual(['Belonging', 'Sleep']);
    expect(r.patterns[0].members.map((m) => m.mechanism).sort()).toEqual(['Shared action builds trust', 'Shared rhythm lowers stress']);
  });

  it('does not call a pattern repeated inside one need a cross-need pattern', () => {
    const r = buildInsights(NEEDS, [
      mech('a', 'n1', 'Care circles', 'Synchrony creates bonds', 'x'),
      mech('a2', 'n1', 'Night circles', 'Synchrony creates bonds', 'y'),
    ]);
    expect(r.patterns).toEqual([]);
  });

  it('ignores mechanisms whose need was deleted', () => {
    const r = buildInsights(NEEDS, [
      mech('a', 'n1', 'Care circles', 'Synchrony creates bonds', 'x'),
      mech('z', 'gone', 'Ghost', 'Synchrony creates bonds', 'y'),
    ]);
    expect(r.patterns).toEqual([]);
    expect(r.understoodCount).toBe(1);
  });

  it('reads old single-object mechanism records', () => {
    const old = { ...mech('a', 'n1', 'Care circles', '', ''), details: { coreMechanism: 'x', abstractPattern: 'Synchrony creates bonds' } as never };
    const r = buildInsights(NEEDS, [old, mech('b', 'n2', 'Sleep clubs', 'Synchrony creates bonds', 'y')]);
    expect(r.patterns).toHaveLength(1);
  });

  it('groups borrowed ideas by source across needs, nested industries included, and keeps source, mechanism and twist', () => {
    const r = buildInsights(NEEDS, []);
    expect(r.chains.map((c) => c.source.toLowerCase())).toEqual(['meetup', 'lodges']);
    expect([...r.chains[0].needs].sort()).toEqual(['Belonging', 'Sleep']);
    expect(r.chains[0].links.slice().sort((a, b) => a.needName.localeCompare(b.needName))).toEqual([
      { needName: 'Belonging', industry: 'Care circles', source: 'Meetup', mechanism: 'local groups', twist: 'AI hosts' },
      { needName: 'Sleep', industry: 'Sleep clubs', source: 'meetup', mechanism: 'shared schedule', twist: 'wearables' },
    ]);
    expect(r.chains[1].links[0].industry).toBe('Night circles');
  });

  it('survives industries with no inspirations and blank sources', () => {
    const r = buildInsights([need('n1', 'A', [ind('a', 'X', [{ source: '  ', mechanism: 'm', twist: 't' }])])], []);
    expect(r.chains).toEqual([]);
  });
});

describe('buildInsights, further cases', () => {
  it('describes an industry by the framework entry that matches the pattern, not the first entry', () => {
    const multi = { ...mech('a', 'n1', 'Care circles', '', ''), details: [
      { coreMechanism: 'Unrelated pricing idea', abstractPattern: 'Scarcity pricing' },
      { coreMechanism: 'Shared action builds trust', abstractPattern: 'Synchrony creates bonds' },
    ] as never };
    const r = buildInsights(NEEDS, [multi, mech('b', 'n2', 'Sleep clubs', 'Synchrony creates bonds', 'Shared rhythm')]);
    expect(r.patterns[0].members.find((m) => m.industry === 'Care circles')?.mechanism).toBe('Shared action builds trust');
  });

  it('counts two different needs that share a name as two needs', () => {
    const twins = [need('n1', 'Belonging', [ind('a', 'X', [meetup])]), need('n9', 'Belonging', [ind('b', 'Y', [meetup])])];
    const r = buildInsights(twins, [
      mech('a', 'n1', 'X', 'Synchrony creates bonds', 'x'),
      mech('b', 'n9', 'Y', 'Synchrony creates bonds', 'y'),
    ]);
    expect(r.patterns).toHaveLength(1);
    expect(r.chains[0].needs).toHaveLength(2);
  });
});

describe('loadInsights', () => {
  beforeEach(async () => { await db.needs.clear(); await db.mechanisms.clear(); });

  it('reads saved needs and mechanisms from the database', async () => {
    for (const n of NEEDS) await DBService.saveNeed(n);
    await DBService.saveMechanism('a', 'Care circles', 'n1', [{ coreMechanism: 'x', abstractPattern: 'Synchrony creates bonds' }] as never);
    await DBService.saveMechanism('b', 'Sleep clubs', 'n2', [{ coreMechanism: 'y', abstractPattern: 'Synchrony creates bonds' }] as never);
    const r = await loadInsights();
    expect(r.needCount).toBe(2);
    expect(r.patterns).toHaveLength(1);
    expect(r.chains[0].source.toLowerCase()).toBe('meetup');
  });
});
