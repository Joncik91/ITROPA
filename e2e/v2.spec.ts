import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), 'utf8');
const PRIOR_ART = fixture('belonging-prior-art');
const FIELD_READ = fixture('belonging-field-read');
const NEED = fixture('belonging-need');

type Mode = 'ok' | 'fieldFails' | 'priorFails';

/** Replays the saved live answers; the field-read prompt is told apart by its opening line. */
async function mockApi(page: Page, mode: Mode = 'ok') {
  const calls = { prior: 0, field: 0 };
  await page.route('**/api/gemini', async (route) => {
    const prompt = (route.request().postDataJSON() as { prompt: string }).prompt;
    const isField = prompt.includes('reading the competitive field');
    const isNeed = prompt.includes('Generate future industries');
    if (!isNeed) calls[isField ? 'field' : 'prior']++;
    const fail = (isField && mode === 'fieldFails') || (!isField && !isNeed && mode === 'priorFails');
    if (fail) return route.fulfill({ status: 200, json: { text: '{"broken": [', truncated: true } });
    await route.fulfill({ json: { text: isField ? FIELD_READ : isNeed ? NEED : PRIOR_ART, truncated: false } });
  });
  return calls;
}

const noSideScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test('Need step explains itself and fits a phone', async ({ page }) => {
  await page.goto('/v2/');
  await expect(page.getByText('What this is:')).toBeVisible();
  await expect(page.getByText('Why it matters:')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Research this need' })).toBeVisible();
  expect(await noSideScroll(page)).toBe(true);
});

test('Field step shows every prior-art item in full, with a way forward (checks 1 and 4)', async ({ page }) => {
  await mockApi(page);
  await page.goto('/v2/');
  await page.getByRole('button', { name: 'Belonging' }).click();

  const prior = page.getByTestId('prior-art');
  await expect(prior).toBeVisible();
  const items = Object.values(JSON.parse(PRIOR_ART) as Record<string, { name: string; mechanism: string; limitation?: string; lesson?: string; transferPotential?: string; biomimicryPotential?: string }[]>).flat();
  expect(items.length).toBeGreaterThanOrEqual(12);
  for (const item of items) {
    await expect(prior).toContainText(item.name);
    await expect(prior).toContainText(item.mechanism.slice(0, 60));
    const tail = item.limitation ?? item.lesson ?? item.transferPotential ?? item.biomimicryPotential;
    if (tail) await expect(prior).toContainText(tail.slice(0, 60));
  }

  const field = page.getByTestId('field-read');
  const fr = JSON.parse(FIELD_READ) as { gaps: { title: string; detail: string }[]; whiteSpace: { title: string; detail: string }[] };
  for (const g of [...fr.gaps, ...fr.whiteSpace]) await expect(field).toContainText(g.detail.slice(0, 60));

  await expect(page.getByText('What this is:')).toBeVisible();
  await expect(page.getByText('Why it matters:')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pick a different need' })).toBeVisible();
  expect(await noSideScroll(page)).toBe(true);
});

test('a failed field read keeps prior art and retries only itself (check 7)', async ({ page }) => {
  let mode: Mode = 'fieldFails';
  const calls = { prior: 0, field: 0 };
  await page.route('**/api/gemini', async (route) => {
    const prompt = (route.request().postDataJSON() as { prompt: string }).prompt;
    const isField = prompt.includes('reading the competitive field');
    calls[isField ? 'field' : 'prior']++;
    if (isField && mode === 'fieldFails') return route.fulfill({ json: { text: '{"broken": [', truncated: true } });
    await route.fulfill({ json: { text: isField ? FIELD_READ : PRIOR_ART, truncated: false } });
  });

  await page.goto('/v2/?need=Belonging');
  await expect(page.getByTestId('prior-art')).toBeVisible();
  await expect(page.getByTestId('field-read').getByRole('alert')).toBeVisible();

  mode = 'ok';
  await page.getByTestId('field-read').getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByTestId('field-read')).toContainText('Gaps');
  expect(calls.prior).toBe(1);
  expect(calls.field).toBeGreaterThanOrEqual(2);

  // Reload: both records were saved, so no model call is made at all.
  const before = { ...calls };
  await page.reload();
  await expect(page.getByTestId('field-read')).toContainText('Gaps');
  expect(calls).toEqual(before);
});

test('a failed prior-art call shows the error with Retry and saves nothing (check 7)', async ({ page }) => {
  const calls = await mockApi(page, 'priorFails');
  await page.goto('/v2/?need=Belonging');
  await expect(page.getByRole('alert').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  await expect(page.getByTestId('field-read')).toHaveCount(0);
  expect(calls.field).toBe(0);
});

test('no false error flashes while prior art loads, and gap text has no stray colon', async ({ page }) => {
  await page.route('**/api/gemini', async (route) => {
    const prompt = (route.request().postDataJSON() as { prompt: string }).prompt;
    const isField = prompt.includes('reading the competitive field');
    await new Promise((r) => setTimeout(r, isField ? 0 : 300));
    await route.fulfill({ json: { text: isField ? FIELD_READ : PRIOR_ART, truncated: false } });
  });
  const alerts: string[] = [];
  await page.exposeFunction('seenAlert', (t: string) => alerts.push(t));
  await page.addInitScript(() => {
    new MutationObserver(() => {
      document.querySelectorAll('[role="alert"]').forEach((el) => (window as unknown as { seenAlert: (t: string) => void }).seenAlert(el.textContent ?? ''));
    }).observe(document, { childList: true, subtree: true });
  });
  await page.goto('/v2/?need=Belonging');
  await expect(page.getByTestId('field-read')).toContainText('Gaps');
  expect(alerts).toEqual([]);
  const gapCard = page.getByTestId('field-read').locator('article').filter({ hasText: (JSON.parse(FIELD_READ) as { gaps: { title: string }[] }).gaps[0].title }).first();
  expect((await gapCard.innerText()).includes(': ')).toBe(false);
});

test('a very long unbroken need does not widen the page (check 4, edge b)', async ({ page }) => {
  await mockApi(page);
  await page.goto('/v2/?need=' + 'x'.repeat(200));
  await expect(page.getByTestId('prior-art')).toBeVisible();
  expect(await noSideScroll(page)).toBe(true);
});

test('Industries step: one list with lineage, history collapsed, fits a phone (checks 2 and 4)', async ({ page }) => {
  await mockApi(page);
  await page.goto('/v2/?need=Belonging');
  await expect(page.getByTestId('field-read')).toContainText('Gaps');
  await page.getByRole('button', { name: 'See future industries' }).click();

  const list = page.getByTestId('industries-list');
  await expect(list).toBeVisible();
  const need = JSON.parse(NEED) as { eras: { name: string; expressions: unknown[] }[] };
  const future = need.eras.flatMap((e) => e.expressions).filter((e): e is { name: string; mutation: string; inspirations: { source: string; mechanism: string }[] } => typeof e === 'object' && e !== null);
  expect(future.length).toBeGreaterThanOrEqual(5);
  for (const ind of future) {
    await expect(list.getByRole('heading', { name: ind.name, exact: true })).toHaveCount(1);
    await expect(list).toContainText(ind.mutation.slice(0, 50));
    for (const insp of ind.inspirations) await expect(list).toContainText(insp.source);
  }
  // History is one collapsed strip, not a second copy of the industries.
  const history = page.getByTestId('history');
  await expect(history).toBeVisible();
  expect(await history.evaluate((el) => (el as HTMLDetailsElement).open)).toBe(false);
  for (const ind of future) await expect(history).not.toContainText(ind.name);

  await expect(page.getByText('What this is:')).toBeVisible();
  await expect(page.getByText('Why it matters:')).toBeVisible();
  expect(await noSideScroll(page)).toBe(true);
});

test('a failed industries call shows Retry and recovers (check 7)', async ({ page }) => {
  let failNeed = true;
  await page.route('**/api/gemini', async (route) => {
    const prompt = (route.request().postDataJSON() as { prompt: string }).prompt;
    const isField = prompt.includes('reading the competitive field');
    const isNeed = prompt.includes('Generate future industries');
    if (isNeed && failNeed) return route.fulfill({ json: { text: '{"eras": []}', truncated: false } });
    await route.fulfill({ json: { text: isField ? FIELD_READ : isNeed ? NEED : PRIOR_ART, truncated: false } });
  });
  await page.goto('/v2/?need=Belonging&step=industries');
  await expect(page.getByRole('alert')).toBeVisible();
  failNeed = false;
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByTestId('industries-list')).toBeVisible();
});

test('going Back after a described need does not leak that description into the next need', async ({ page }) => {
  const prompts: string[] = [];
  await page.route('**/api/gemini', async (route) => {
    const prompt = (route.request().postDataJSON() as { prompt: string }).prompt;
    prompts.push(prompt);
    const isField = prompt.includes('reading the competitive field');
    await route.fulfill({ json: { text: isField ? FIELD_READ : PRIOR_ART, truncated: false } });
  });
  await page.goto('/v2/');
  await page.getByPlaceholder('e.g. people without coding skills who build software with AI').fill('people without coding skills who build software with AI');
  await page.getByPlaceholder('e.g. sleep').fill('Vibe coders');
  await page.getByRole('button', { name: 'Research this need' }).click();
  await expect(page.getByTestId('prior-art')).toBeVisible();
  await page.goBack();
  await page.getByRole('button', { name: 'Status', exact: true }).click();
  await expect(page.getByTestId('prior-art')).toBeVisible();
  const statusPrompts = prompts.filter((p) => p.includes('Status'));
  expect(statusPrompts.length).toBeGreaterThan(0);
  for (const p of statusPrompts) expect(p).not.toContain('people without coding skills');
});

test('picking the same need again without a description opens the saved research, not a new one', async ({ page }) => {
  let priorCalls = 0;
  await page.route('**/api/gemini', async (route) => {
    const prompt = (route.request().postDataJSON() as { prompt: string }).prompt;
    const isField = prompt.includes('reading the competitive field');
    if (!isField) priorCalls++;
    await route.fulfill({ json: { text: isField ? FIELD_READ : PRIOR_ART, truncated: false } });
  });
  await page.goto('/v2/');
  await page.getByPlaceholder('e.g. people without coding skills who build software with AI').fill('a narrower meaning');
  await page.getByPlaceholder('e.g. sleep').fill('Belonging');
  await page.getByRole('button', { name: 'Research this need' }).click();
  await expect(page.getByTestId('prior-art')).toBeVisible();
  await page.goBack();
  await page.getByRole('button', { name: 'Belonging', exact: true }).click();
  await expect(page.getByTestId('prior-art')).toBeVisible();
  expect(priorCalls).toBe(1);
});

const UNDERSTAND = JSON.stringify({
  mechanism: { coreMechanism: 'Repeated shared action builds trust between strangers', abstractPattern: 'Synchrony creates bonds', keyPrinciples: [{ principle: 'Ritual', function: 'makes belonging visible', criticality: 'without it groups fade' }], untappedDomains: [{ domain: 'Remote teams', opportunity: 'daily shared rhythm', novelty: 'async rituals' }], combinationPotential: ['reputation'] },
  deepDive: { marketOpportunity: 'A large and growing community market', keyEnablers: ['AI matching', 'cheap video'], challenges: [{ challenge: 'Cold start', potentialSolution: 'seed with local hosts' }], timeline: 'Early adopters in 2 years', risks: ['Churn'] },
});
const SUBS = JSON.stringify([1, 2, 3].map((n) => ({ name: `Sub industry ${n}`, mutation: 'm', insight: `Sub insight ${n}`, inspirations: [], children: [] })));
const HYBRIDS = JSON.stringify([{ name: 'Weaker hybrid', mutation: 'm', insight: 'i', synergyScore: 30, inspirations: [], children: [] }, { name: 'Ritual care hybrid', mutation: 'm', insight: 'i', synergyScore: 90, inspirations: [], children: [] }]);

async function digMock(page: Page, fail: { understand?: boolean } = {}) {
  await page.route('**/api/gemini', async (route) => {
    const prompt = (route.request().postDataJSON() as { prompt: string }).prompt;
    const body = prompt.includes('reading the competitive field') ? FIELD_READ
      : prompt.includes('Generate future industries') ? NEED
      : prompt.includes('Analyse the emerging industry') ? (fail.understand ? '{"mechanism": {}}' : UNDERSTAND)
      : prompt.includes('sub-industries that branch') ? SUBS
      : prompt.includes('systematic combination methods') ? HYBRIDS
      : PRIOR_ART;
    await route.fulfill({ json: { text: body, truncated: false } });
  });
}

const openFirstIndustry = async (page: Page) => {
  await page.goto('/v2/?need=Belonging&step=industries');
  await expect(page.getByTestId('industries-list')).toBeVisible();
  await page.getByRole('button', { name: /^Dig in:/ }).first().click();
  await expect(page.getByRole('button', { name: 'Understand this industry' })).toBeVisible();
};

test('Dig in: Understand shows mechanism, pattern and business text and is saved (check 6b)', async ({ page }) => {
  await digMock(page);
  await openFirstIndustry(page);
  await page.getByRole('button', { name: 'Understand this industry' }).click();
  const u = page.getByTestId('understanding');
  await expect(u).toContainText('Repeated shared action builds trust');
  await expect(u).toContainText('Synchrony creates bonds');
  await expect(u).toContainText('A large and growing community market');
  await expect(u).toContainText('Cold start');
  await expect(u).toContainText('AI matching');
  await expect(u).toContainText('Churn');
  expect(await noSideScroll(page)).toBe(true);
  await page.reload();
  await expect(page.getByTestId('understanding')).toContainText('Synchrony creates bonds');
});

test('Dig in: a bad Understand answer shows Retry and saves nothing (check 7)', async ({ page }) => {
  await digMock(page, { understand: true });
  await openFirstIndustry(page);
  await page.getByRole('button', { name: 'Understand this industry' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Understand this industry' })).toBeVisible();
});

test('Dig in: Branch adds 3 sub-industries with name and insight visible (check 6b)', async ({ page }) => {
  await digMock(page);
  await openFirstIndustry(page);
  await page.getByRole('button', { name: 'Branch into sub-industries' }).click();
  const branches = page.getByTestId('branches');
  for (const n of [1, 2, 3]) {
    await expect(branches).toContainText(`Sub industry ${n}`);
    await expect(branches).toContainText(`Sub insight ${n}`);
  }
  await expect(page.getByRole('button', { name: 'Branch into sub-industries' })).toHaveCount(0);
});

test('Dig in: Combine adds one flagged hybrid with both sources to the industries list (check 6)', async ({ page }) => {
  await digMock(page);
  await openFirstIndustry(page);
  await expect(page.getByRole('button', { name: 'Combine', exact: true })).toBeDisabled();
  await page.getByLabel('Combine with').selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Combine', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'now in your industries list' })).toBeVisible();
  await page.getByRole('button', { name: 'Back to the industries' }).click();
  const list = page.getByTestId('industries-list');
  await expect(list.getByRole('heading', { name: 'Ritual care hybrid', exact: true })).toHaveCount(1);
  await expect(list).not.toContainText('Weaker hybrid');
  const hybrid = list.locator('article').filter({ hasText: 'Ritual care hybrid' });
  await expect(hybrid).toContainText('Combined');
  const names = (JSON.parse(NEED) as { eras: { expressions: unknown[] }[] }).eras.flatMap((e) => e.expressions).filter((e): e is { name: string } => typeof e === 'object' && e !== null).map((e) => e.name);
  await expect(hybrid.locator('p').filter({ hasText: /^Combines:/ })).toContainText(names[0]);
  await expect(hybrid.locator('p').filter({ hasText: /^Combines:/ })).toContainText(names[1]);
});

const concept = (name: string, over: Record<string, unknown>) => ({
  name, tagline: `${name} tagline`, formFactor: 'saas', targetUser: 'Remote teams', problemSolved: 'Loneliness', coreFeature: 'Rituals',
  monetization: { model: 'Freemium', pricing: '$9/mo', revenueEstimate: '$1k MRR' }, techStack: ['React'], mvpScope: 'A single page',
  effortEstimate: '1-2 weeks', competitiveEdge: 'Simple', risks: ['Churn'], score: 70, ...over,
});
const CONCEPTS = JSON.stringify({ concepts: [
  concept('Alpha', {}),
  concept('Beta', { formFactor: 'mobile', techStack: ['Swift'], score: 60 }),
  concept('Gamma', { effortEstimate: '3+ months' }),
  concept('Delta', { formFactor: 'tool', techStack: ['Rust'], effortEstimate: '1-2 months', score: 40 }),
  concept('Eps', { formFactor: 'api', techStack: ['Node.js'], effortEstimate: 'weekend' }),
] });

async function buildMock(page: Page, opts: { conceptsFail?: boolean } = {}) {
  let failing = !!opts.conceptsFail;
  await page.route('**/api/gemini', async (route) => {
    const prompt = (route.request().postDataJSON() as { prompt: string }).prompt;
    if (prompt.includes('diverse app/product concepts')) {
      return route.fulfill({ json: { text: failing ? '{"concepts": []}' : CONCEPTS, truncated: false } });
    }
    await route.fulfill({ json: { text: prompt.includes('reading the competitive field') ? FIELD_READ : prompt.includes('Generate future industries') ? NEED : PRIOR_ART, truncated: false } });
  });
  return { stopFailing: () => { failing = false; } };
}

const openBuild = async (page: Page) => {
  await page.goto('/v2/?need=Belonging&step=industries');
  await expect(page.getByTestId('industries-list')).toBeVisible();
  await page.getByRole('button', { name: /^Dig in:/ }).first().click();
  await page.getByRole('button', { name: 'Build an app from this' }).click();
};

const fitOf = (page: Page, name: string) => page.getByTestId('concept').filter({ has: page.getByRole('heading', { name, exact: true }) }).getByTestId('fit');

test('Build: 2 to 4 concepts with the AI effort estimate and a fit score, default profile named (checks 5, 5b, 4)', async ({ page }) => {
  await buildMock(page);
  await openBuild(page);
  const cards = page.getByTestId('concept');
  await expect(cards).toHaveCount(4);
  await expect(cards.first()).toContainText("Effort (AI's estimate): 1-2 weeks");
  await expect(fitOf(page, 'Alpha')).toHaveText('100');
  await expect(fitOf(page, 'Eps')).toHaveText('100');
  await expect(fitOf(page, 'Gamma')).toHaveText('75');
  await expect(fitOf(page, 'Beta')).toHaveText('50');
  await expect(page.getByRole('heading', { name: 'Delta', exact: true })).toHaveCount(0);
  await expect(page.getByTestId('concept').filter({ hasText: 'Gamma' })).toContainText('longer than the 2-4 weeks');
  await expect(page.getByTestId('profile-line')).toContainText('No profile saved yet');
  await expect(page.getByRole('button', { name: 'Edit profile' })).toBeVisible();
  await expect(page.getByText('What this is:')).toBeVisible();
  await expect(page.getByText('Why it matters:')).toBeVisible();
  expect(await noSideScroll(page)).toBe(true);
});

test('Build: editing the profile saves it and recomputes the scores on the same screen (check 5c)', async ({ page }) => {
  await buildMock(page);
  await openBuild(page);
  await expect(fitOf(page, 'Alpha')).toHaveText('100');
  await page.getByRole('button', { name: 'Edit profile' }).click();
  await page.getByLabel('Time you have').selectOption('weekend');
  await page.getByLabel('Technologies you build with').fill('Swift');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.getByTestId('profile-line')).toContainText('saved profile');
  await expect(page.getByTestId('profile-line')).toContainText('weekend');
  await expect(fitOf(page, 'Alpha')).toHaveText('50'); // effort 1-2 weeks > weekend, no React/Swift overlap
  await expect(fitOf(page, 'Beta')).toHaveText('50'); // Swift matches, but mobile is not preferred and 1-2 weeks > weekend
  await page.reload();
  await expect(page.getByTestId('profile-line')).toContainText('saved profile');
  await expect(fitOf(page, 'Alpha')).toHaveText('50');
});

test('Build: a failed concepts call shows Retry and saves nothing (check 7)', async ({ page }) => {
  const m = await buildMock(page, { conceptsFail: true });
  await openBuild(page);
  await expect(page.getByRole('alert')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('alert')).toBeVisible();
  m.stopFailing();
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByTestId('concept')).toHaveCount(4);
});

/** Writes saved research straight into V1's database, the way earlier visits would have left it. */
async function seedResearch(page: Page, needs: unknown[], mechanisms: unknown[], extra: { deepDives?: unknown[]; appConcepts?: unknown[]; fieldReads?: unknown[] } = {}) {
  await page.goto('/v2/');
  await page.getByTestId('how-it-works').or(page.getByTestId('library')).waitFor(); // the library read has finished, so both databases exist
  await page.evaluate(async ({ needs, mechanisms, extra }) => {
    const put = async (dbName: string, stores: Record<string, unknown[]>) => {
      const db = await new Promise<IDBDatabase>((res, rej) => {
        const r = indexedDB.open(dbName);
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
      await new Promise<void>((res, rej) => {
        const tx = db.transaction(Object.keys(stores), 'readwrite');
        for (const [store, rows] of Object.entries(stores)) rows.forEach((row) => tx.objectStore(store).put(row));
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
      db.close();
    };
    await put('IndustryFamilyTreeDB', { needs, mechanisms, deepDives: extra.deepDives ?? [], appConcepts: extra.appConcepts ?? [] });
    if (extra.fieldReads?.length) await put('ItropaV2DB', { fieldReads: extra.fieldReads });
  }, { needs, mechanisms, extra });
  await page.reload();
}

const seedInd = (id: string, name: string, source: string, children: unknown[] = []) => ({
  id, type: 'future', name, mutation: 'm', insight: 'i', children,
  inspirations: [{ source, mechanism: `${source} mechanism`, twist: `${source} twist` }],
});
const seedNeed = (id: string, name: string, list: unknown[]) => ({
  id, name, icon: 'Users', description: 'd', createdAt: 1, updatedAt: 1,
  eras: [{ name: 'Post-AI Era (2025+)', expressions: list }],
});
const seedMech = (id: string, needId: string, name: string, pattern: string, core: string) => ({
  id, needId, expressionName: name, createdAt: 1, details: [{ coreMechanism: core, abstractPattern: pattern }],
});

test('Insights: hidden with one saved need, shown with two, and lists patterns and the chain in full (check 9)', async ({ page }) => {
  await seedResearch(page, [seedNeed('n1', 'Belonging', [seedInd('a', 'Care circles', 'Meetup')])], []);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(400); // the saved-need count loads after first paint
  await expect(page.getByRole('button', { name: 'Insights across your needs' })).toHaveCount(0);

  await seedResearch(page, [
    seedNeed('n1', 'Belonging', [seedInd('a', 'Care circles', 'Meetup', [seedInd('a2', 'Night circles', 'Lodges')])]),
    seedNeed('n2', 'Sleep', [seedInd('b', 'Sleep clubs', 'Meetup')]),
  ], [
    seedMech('a', 'n1', 'Care circles', 'Synchrony creates bonds', 'Shared action builds trust'),
    seedMech('b', 'n2', 'Sleep clubs', 'Synchrony creating bonds', 'Shared rhythm lowers stress'),
  ]);
  await page.getByRole('button', { name: 'Insights across your needs' }).click();
  await expect(page).toHaveURL(/view=insights/);
  await expect(page.getByText('What this is:')).toBeVisible();
  await expect(page.getByText('Why it matters:')).toBeVisible();

  const pattern = page.getByTestId('pattern');
  await expect(pattern).toHaveCount(1);
  await expect(pattern).toContainText('Seen in:');
  await expect(pattern).toContainText('Belonging');
  await expect(pattern).toContainText('Sleep');
  await expect(pattern).toContainText('Shared action builds trust');
  await expect(pattern).toContainText('Shared rhythm lowers stress');

  const chains = page.getByTestId('chain');
  await expect(chains).toHaveCount(2);
  await expect(chains.first()).toContainText('Across 2 needs');
  await expect(chains.first()).toContainText('Care circles');
  await expect(chains.first()).toContainText('Sleep clubs');
  await expect(chains.first()).toContainText('Meetup mechanism');
  await expect(chains.first()).toContainText('Meetup twist');
  await expect(chains.nth(1)).toContainText('Night circles');
  expect(await noSideScroll(page)).toBe(true);

  await page.reload();
  await expect(page.getByTestId('pattern')).toHaveCount(1);
  await page.getByRole('button', { name: 'Back to start' }).click();
  await expect(page.getByRole('button', { name: 'Research this need' })).toBeVisible();
});

test('Insights: a very long need name does not push the page sideways', async ({ page }) => {
  const long = 'Supercalifragilisticexpialidocious'.repeat(4);
  await seedResearch(page, [
    seedNeed('n1', long, [seedInd('a', 'Care circles', 'Meetup')]),
    seedNeed('n2', 'Sleep', [seedInd('b', 'Sleep clubs', 'Meetup')]),
  ], [
    seedMech('a', 'n1', 'Care circles', 'Synchrony creates bonds', 'x'),
    seedMech('b', 'n2', 'Sleep clubs', 'Synchrony creates bonds', 'y'),
  ]);
  await page.getByRole('button', { name: 'Insights across your needs' }).click();
  await expect(page.getByTestId('pattern')).toContainText(long);
  expect(await noSideScroll(page)).toBe(true);
});

test('Insights: with no mechanisms it says how patterns appear, and still shows the chain', async ({ page }) => {
  await seedResearch(page, [
    seedNeed('n1', 'Belonging', [seedInd('a', 'Care circles', 'Meetup')]),
    seedNeed('n2', 'Sleep', [seedInd('b', 'Sleep clubs', 'Meetup')]),
  ], []);
  await page.getByRole('button', { name: 'Insights across your needs' }).click();
  await expect(page.getByTestId('patterns')).toContainText('Understand this industry');
  await expect(page.getByTestId('chain')).toHaveCount(1);
});

test('Home: lists saved research with progress, newest first, and opens a need with no AI call (checks 1, 2, 3)', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/gemini', (route) => { calls++; return route.abort(); });
  await seedResearch(page, [
    { ...seedNeed('n1', 'Belonging', [seedInd('a', 'Care circles', 'Meetup', [seedInd('a2', 'Night circles', 'Lodges')]), seedInd('b', 'Shared rituals', 'Guilds')]), updatedAt: 30 },
    { ...seedNeed('n2', 'Sleep', [seedInd('c', 'Sleep clubs', 'Meetup')]), updatedAt: 20 },
    { ...seedNeed('n3', 'Status', []), updatedAt: 10 },
    { ...seedNeed('n4', 'Undated', [seedInd('d', 'Dated nothing', 'Meetup')]), updatedAt: undefined },
  ], [
    seedMech('a', 'n1', 'Care circles', 'p', 'm'), seedMech('b', 'n1', 'Shared rituals', 'p', 'm'),
  ], {
    deepDives: [{ id: 'a', needId: 'n1', expressionName: 'Care circles', details: {}, createdAt: 1 }],
    appConcepts: [{ id: 'a', needId: 'n1', industryName: 'Care circles', concepts: [{ name: 'X' }], deepDiveAvailable: true, createdAt: 1 }],
    fieldReads: [{ key: 'belonging', needName: 'Belonging', fieldRead: { summary: 's', leaders: [], gaps: [], whiteSpace: [], evolution: '', entryMoves: [] }, createdAt: 1 }],
  });

  const rows = page.getByTestId('library').getByRole('button');
  await expect(rows).toHaveCount(4);
  await expect(rows.nth(0)).toContainText('Belonging');
  await expect(rows.nth(0)).toContainText('3 industries · 1 understood · 1 with app ideas · field read done');
  await expect(rows.nth(1)).toContainText('Sleep');
  await expect(rows.nth(1)).toContainText('1 industries · 0 understood · 0 with app ideas · field read not yet');
  await expect(rows.nth(0)).toContainText('Updated');
  await expect(rows.nth(2)).toContainText('Not finished yet. Opening it will research it.');
  await expect(rows.nth(3)).toContainText('Undated');
  await expect(rows.nth(3)).toContainText('Updated: unknown');
  await expect(page.getByText('Saved on this device')).toBeVisible();
  expect(await noSideScroll(page)).toBe(true);

  await page.getByRole('button', { name: 'Open Sleep' }).click(); // no field read stored, still opens at Industries
  await expect(page.getByTestId('industries-list')).toContainText('Sleep clubs');
  expect(calls).toBe(0);

  await page.goto('/v2/');
  await page.getByRole('button', { name: 'Open Status' }).click();
  await expect(page).toHaveURL(/need=Status/);
  expect(await page.getByTestId('industries-list').count()).toBe(0);
});

test('Home: with nothing saved there is no list, only how it works (check 4)', async ({ page }) => {
  await page.goto('/v2/');
  await expect(page.getByTestId('how-it-works')).toContainText('Industries');
  await expect(page.getByTestId('library')).toHaveCount(0);
  await expect(page.getByText('saved on this device')).toBeVisible();
  expect(await noSideScroll(page)).toBe(true);
});
