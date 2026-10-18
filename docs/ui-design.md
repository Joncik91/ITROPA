# UI design system

ITROPA maps the lineage of a human need: past solutions (prior art) on a stem, future
industries branching off it. The visual idea is the **cyanotype**: the blueprint and the
botanical sun-print, the two ways people have recorded inventions and living lineages.
Dark mode is the print (ink-blue paper, pale lines); light mode is its positive (cool paper,
Prussian-blue ink).

## Tokens

Colors are CSS variables (`src/index.css`) exposed as Tailwind colors, so one class works in
both themes. Never use Tailwind's stock palette (`gray-*`, `emerald-*`, …) in components.

| Token    | Dark      | Light     | Use                                         |
|----------|-----------|-----------|---------------------------------------------|
| `paper`  | `#0E1C2B` | `#F2F5F7` | page background                             |
| `sheet`  | `#14273A` | `#FFFFFF` | panels, cards, sheets                        |
| `well`   | `#0A1622` | `#E7EDF1` | inputs, inset areas, chips                   |
| `line`   | `#24405A` | `#C8D4DE` | borders, the lineage stem                    |
| `ink`    | `#E4EDF4` | `#0F2740` | body text                                    |
| `ink-2`  | `#93A8BC` | `#4C6275` | secondary text, hints                        |
| `accent` | `#7CC6EA` | `#1A5C8C` | interactive: focus, selection, primary       |
| `pollen` | `#F0C04A` | `#9A6400` | cross-pollination and the future era only    |
| `ok`     | `#6FD09A` | `#1C7A4B` | good / high match                            |
| `warn`   | `#EAA545` | `#9E5600` | caution / medium                             |
| `bad`    | `#F2766B` | `#B3261E` | errors, destructive, low match               |

Tints use opacity: `bg-accent/15`, `border-pollen/50`. `on-accent` is the text color on a
solid `bg-accent` button.

## Type

One family: **Schibsted Grotesk** (400/500/600/800). Scale (px): 12 · 13 · 15 · 17 · 22 · 30.
Body 15 on mobile, line-height 1.5. Headings sentence case, never all caps, no tracked
eyebrows. The need name is the one display moment: 30/800, tight tracking.

## Layout

Mobile first (base styles target 360–430 px; `md` 768, `lg` 1024).

```
mobile                               desktop (lg+)
┌────────────────────────────┐       ┌──────────────────────────────────────────────┐
│ ITROPA            ◐  ?      │       │ ITROPA   Explore Library Patterns   ◐ ? ⚙   │
│ [Sleep ×][Food ×] [+ New]   │       ├─────────┬────────────────────────┬───────────┤
├────────────────────────────┤       │ research│ Sleep                  │ assistant │
│ Sleep                       │       │ form    │ [Tree|Time|Prior|Chain]│ history   │
│ [Tree|Timeline|Prior|Chains]│       │ open    │ ● stem ─ cards         │           │
│ ⓘ what this view shows      │       │ needs   │                        │           │
│ ● Ancient ── chips          │       │ tools   │                        │           │
│ ● Future ── cards           │       │ map     │                        │           │
├────────────────────────────┤       └─────────┴────────────────────────┴───────────┘
│ Explore Library Patterns ⚙ │  bottom nav, safe-area padded
└────────────────────────────┘
```

- Side panels are static columns at `lg`; below that they open as bottom sheets.
- Every dialog is a bottom sheet on mobile and a centered dialog from `md`.
- Touch targets ≥ 44 px below `md`.
- Text left-aligned. Line length ≤ 75 ch.

## Information at every input and selection

The rule: **a control says what it does before you commit, and confirms what happened
after.**

- `Field` (label + always-visible hint + error) wraps every text input, textarea and select.
- `Select` and `Segmented` take per-option `description`s; the selected option's description
  renders under the control and updates live (`aria-live="polite"`).
- `Toggle` and `Checkbox` carry a hint describing the on state.
- Industry actions come from one table (`src/config/actions.ts`) with a label, a one-line
  description, and whether it calls the AI. On mobile, "Actions" opens an `ActionSheet`
  listing each with its description and status ("saved: opens instantly" vs. "AI, ~20 s").
  On desktop the same descriptions are the buttons' tooltips and `aria-description`.
- After an action, the toast names the result and where to find it.

## Principles

1. Lines over shadows. Borders and the stem carry structure; only sheets get a shadow.
2. Radius has hierarchy: sheets 16, cards 12, controls 10, chips full.
3. One accent for interaction. `pollen` is reserved for cross-pollination and the future.
4. Motion only in response to an action (sheet open, branch expand). Reduced motion is
   respected globally.
5. Copy is plain and specific: buttons say what happens ("Generate branches", not "Submit").

## Primitives (`src/components/ui`)

`Button`, `IconButton`, `Field`, `TextInput`, `TextArea`, `Select`, `Segmented`, `Toggle`,
`Chip`, `Badge`, `Hint`, `Sheet` (responsive dialog), `ActionSheet`, `Section`.
