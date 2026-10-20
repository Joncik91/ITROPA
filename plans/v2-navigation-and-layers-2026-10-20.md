# ITROPA V2 round 2: saved research, clear navigation, layered depth

Status: ADOPTED after plan gate round 1 (section 8). Date: 2026-10-20. Repo: Joncik91/ITROPA, main. Builds on plans/lean-v2-2026-10-20.md (all five slices committed).

## 0. Ask and scope

Verbatim ask (Jounes, 2026-10-20):
> "I'm missing local storage and navigation to already researched needs. Further it's still not that user friendly in navigation and explanation."
Followed by a pasted list of mobile research-app ideas: progressive disclosure (summary, collapsible evidence, deep-dive drawer), tappable citations with credibility tags, branching navigation with breadcrumbs, voice and camera input, a pinboard with swipe-to-save, and background agent loops with a progress pill.

Assumptions (one line each):
1. "Local storage" means: he cannot see that research is saved. Everything is already stored on the device (IndexedDB, the same database as the old app), but V2 never lists it. The fix is a visible list, not new storage.
2. "Navigation" means: from any screen he can get Home and back to any earlier step in one tap, and Home lists every researched need (old-app ones too).
3. "Explanation" means: each screen should tell him in plain words where he is, what he is looking at and what to do next, without a wall of text.
4. The pasted list is a source of ideas; only the ones that fit this app's data are in scope.

Not doing, each with the reason:
- Citation badges and credibility tags: the prior art is the model's recall and carries no source documents. A badge would claim a verification that does not exist. (Already a stated non-guarantee in the first spec.)
- Highlight-to-branch, voice input, camera and file ingestion, push notifications: no data or backend in this app supports them; each is a separate product decision.
- A background agent loop: every call here takes 10 to 60 seconds, not minutes; a progress indicator is enough.
- Deleting or renaming a saved need: destructive on data he cares about; separate decision.
- Changing the old app or its stored data. New storage for pins lives in V2's own database ("ItropaV2DB").

## 1. Finish line

Commands: `npm run typecheck`, `npx vitest run`, `npx playwright test` (Chromium at 390 px; `PW_CHROMIUM` set to the installed binary), `npm run check`.
Type: O = outside (real run, or an expected value written here), S = suite (a test the builder writes).

| # | Given | When | Then | Type |
|---|---|---|---|---|
| 1 | Three saved needs (seeded straight into IndexedDB, one without industries) | `/v2/` opens | A "Your research" list shows one row per need: name, number of future industries, how many industries have been understood, how many have saved app concepts, whether the field read exists, and the last-updated date. The newest is first. A line says the research is saved on this device. Counting rules: industries = every node in the future era's tree including sub-industries (the same count the Industries screen shows); understood = industries of that need that have both a mechanism row and a deep-dive row; with concepts = industries of that need that have a saved app-concept row with at least one concept. | O: e2e with the seeded values written in the test |
| 2 | The list | A row is tapped | The need opens at Industries when it has future industries (even with no field read), otherwise at Field. Opening at Industries makes 0 AI calls. A row that opens at Field says "will research this" first, because the Field step fetches what is missing, as it does today. | O: e2e counts API requests = 0 for a need with industries and no field read |
| 3 | A need saved by the old app (no field read, no V2 data) | Listed and opened | It appears with "field read: not yet" and opens with no migration and no loss. | S: uses the existing V1-need fixture |
| 4 | No saved needs | `/v2/` opens | No list is shown; the form is shown with a plain "How this works" of the steps (one line each). | S |
| 5 | Any screen other than Home | Rendered at 390 px | A path bar shows Home, the need, and the current place (for example Home > Belonging > Care circles > Build). Every earlier part of the path is a link that goes there in one tap. The bar scrolls sideways inside itself; the page does not scroll sideways. | O: e2e clicks each crumb on Dig in and Build |
| 6 | Any step screen | The step bar is shown | Steps already reached are links; steps not yet reachable (for example Build with no industry chosen) are plain text. The current step is marked. | S |
| 7 | A need with field read and 16 prior-art items | Field step opens | A short summary is first. Each of the four prior-art groups is a collapsible block headed by its title and item count; only the first is open. Opening a block shows every item in full (name, mechanism, limitation or lesson), so nothing is hidden, only folded. | O: e2e expands each group and finds all 16 items' text |
| 8 | A need with 7 industries | Industries step opens | Each industry is a card showing the name, the "Combined" badge if any, and one line of its insight, folded. Its "Dig in" button is visible without unfolding. Unfolding shows the enabler, the full insight, "Inspired by" and sub-industries. Names appear once. | O: e2e |
| 9 | An industry or an app concept | Its star is tapped | It is saved to a Pinboard and the star shows saved. Tapping again removes it. The state survives a reload. A unit test first creates V2's database at version 1 with a field-read row, then opens it through the new code (version 2) and finds the row intact and the pins table usable. | S |
| 10 | Two pins in two different needs | "Pins" opens from Home | Both are listed with their need name and a short text; tapping one opens its place (industry at Dig in, concept at Build). A pin whose need was deleted from the old app is not listed and does not crash. | O: e2e |
| 11 | The Industries step loading | The calls it needs run | The loading line says which step of how many it is on, where the total is the number of calls actually needed: prior art missing and industries missing gives "Step 1 of 2: reading the field" then "Step 2 of 2: imagining industries"; prior art present gives "Step 1 of 1: imagining industries". | S: both cases |
| 12 | Any screen | A call fails | The error and its Retry button still appear and save nothing (unchanged behaviour). | S: existing tests stay green |
| 13 | Every changed screen | Rendered at 390 px | No horizontal page scroll; the main action is reachable without scrolling to the end of a long list (a bottom bar holds it). | O: e2e noSideScroll on each screen |
| 14 | The whole change | `npm run check` | Typecheck, unit tests and build pass; all earlier browser tests pass, with the two earlier tests that expected everything unfolded changed on purpose to unfold first (checks 7 and 8 here). | O |

Edge cases: (a) a need name 136 characters long on the list, path bar and pins (check 13); (b) two saved needs with the same name: V2 identifies a need by its name (as today), so they show as one row describing the record that opens (findNeedByName returns the lowest id); (c) a record in the needs table with no `updatedAt` (listed last, date shown as "unknown", no crash).

Each check fails on a named mutant: 1 list only the newest need; 2 call the API when opening; 3 require V2 data; 4 always show the list header; 5 make crumbs plain text; 6 make every step a link; 7 render all groups unfolded or render none; 8 hide Dig in inside the fold; 9 keep the star in memory only; 10 list pins of missing needs; 11 keep one fixed loading label; 12 swallow the error; 13 add a fixed-width bar; 14 break an import.

## 2. Failure classes

| # | Could go wrong | Covered by |
|---|---|---|
| F1 | Folded content is never opened and looks missing again (the original complaint) | 7, 8 |
| F2 | The list shows stale or wrong progress counts | 1, 3 |
| F3 | Opening a saved need silently triggers paid AI calls | 2 |
| F4 | A crumb or link goes to a place whose data is gone | 5, 10 |
| F5 | Pins break when the old app deletes a need | 10 |
| F6 | The new pins table breaks the V2 database upgrade | 9 |
| F7 | Longer text in the path bar or list overflows a phone | 5, 13 |
| F8 | A change to folding breaks earlier verified behaviour (full text visible, Retry, per-call saving) | 12, 14 |

## 3. Non-guarantees and rejected alternatives

- Progress counts come from what is stored; they say nothing about the quality of that research.
- "Last updated" is the need's own stored timestamp, not the time of the newest sub-record.
- Pins hold a copy of a short text; if the industry is later edited, the pin text is not refreshed.
- The progress line shows steps, not a percentage; the AI call has no measurable progress.
- Rejected: moving pins into the old app's database. It would change a stored schema the old app owns.
- Rejected: a full chat thread or a node map. The path bar is enough for a four-level journey; a map is a larger change.
- Rejected: bottom-sheet drawers for detail. Folding in place keeps the page position and needs no new component.
- Reviewers are told not to raise these.

## 4. Design (each line cites its checks)

Home (the `/v2/` URL with no need): a "Your research" list above the new-research form. It reads all saved needs (the `needs` table; industries live in each need's future era) from the old database plus V2's field-read table and the old `mechanisms`, `deepDives` and `appConcepts` tables, in one function that returns plain rows (`src/v2/library.ts`). The row's progress is counts only. [1, 3, 4, F2]
A row links to `?need=X&step=industries` when the need has future industries, else `?need=X`; opening a saved need uses the data path that already loads without a call when the need is stored. [2, F3]
A path bar replaces nothing but sits above the step bar on every non-Home screen (`src/v2/PathBar.tsx`). It is built from the current place (need, step, industry name) and is an overflow-x container. Industry names come from the loaded need. [5, 13, F4, F7]
The step bar entries are links when the place they point to exists: Need always, Field and Industries once a need is chosen, Build only with an industry chosen. [6]
Folding uses the native `<details>` element in a small `Fold` component so it works with no script and keeps the browser's own focus and keyboard behaviour. Field step: summary first, one `Fold` per prior-art group (count in the heading, first open). Industries: one `Fold` per card with the name and one-line insight in the summary row, the Dig in button outside the fold. [7, 8, F1]
Pins: a V2 database version 2 adds a `pins` table keyed by kind and id (`industry` by industry id, `concept` by industry id plus concept name). A star toggle component writes and removes it. The Pins list reads the table, joins to saved needs and drops pins whose need is gone. [9, 10, F5, F6]
The Industries loading state takes a step label from the two calls it makes (prior art if missing, then industries). [11]
A sticky bottom bar (`position: sticky; bottom: 0`) holds each screen's one main action, replacing the footer. [13]
Every call keeps its existing per-call save and Retry; no call or save path is touched. [12, F8]

## 5. Slices (about 200 lines each, build order)

- S6 (riskiest assumption: a list built from five stores shows correct counts for old-app data): `library.ts` (reads the needs, fieldReads, mechanisms, deepDives and appConcepts stores), Home list, row opening, empty state, "saved on this device" line. Checks 1, 2, 3, 4, edge (b) and (c).
- S7: path bar, linked step bar, sticky bottom action bar, loading step labels. Checks 5, 6, 11, 13, edge (a).
- S8: `Fold` component; Field and Industries folding; update the two earlier tests on purpose. Checks 7, 8, 14.
- S9: pins table, star, Pins screen. Checks 9, 10 and F6.
If S6's check 3 fails, return to this spec before S7.

## 6. Escalate if

Stop and ask if: a stored field of the old app must change; a new dependency is needed; the V2 database upgrade fails on an existing browser profile (check 9).
Ask first: new dependencies, any change to the old app's Dexie schema, Vite or CI config changes.
Never: touch old-app files other than imports; delete or weaken a test except the two named in check 14; commit `.env`.
House style to copy: `src/v2/IndustriesStep.tsx` and `src/components/ui/*`.

## 7. Attack on this spec

Easiest break: folding hides content again, so the original "barely anything shown" complaint returns in a new form. Mitigation: checks 7 and 8 open every fold and assert all text, and the group headings carry counts so the amount is visible before opening.

## 8. Gate record (plan gate, round 1, 20 Oct 2026)

- Legs: Luna (gpt-6-luna) and GLM (glm-5.3), both on the same prompt. Luna 0 BLOCKING + 2 NOTE; GLM 0 BLOCKING + 6 NOTE. No tiebreak needed.
- Folded in: counting rules for the list (check 1); where industries live and which tables the list reads (section 4, S6); loading total equals the calls actually needed (check 11); opening a need with industries and no field read makes 0 calls, and a row that opens at Field says it will research (check 2); the version 1 to 2 database upgrade is tested on a seeded version-1 database (check 9); same-name needs show as one row because V2 identifies a need by name (edge b); explanation lines asserted on Home and Pins too (check 13).
- These fixes added checks and sentences and did not change the design, so no round 2.
