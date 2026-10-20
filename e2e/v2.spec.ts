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
