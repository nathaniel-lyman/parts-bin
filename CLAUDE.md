# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Ledger" — a runnable Vite + React + TS dashboard that doubles as a **clone-and-customize theme starter**. The entire design system is isolated in `src/theme/` so the whole app can be re-skinned by editing one folder. `demo.html` (a standalone vanilla prototype) is the behavior reference; `THEME-SPEC.md` is the canonical design reference. The design spec and implementation plan live in `docs/superpowers/`.

## Commands

```bash
npm run dev            # Vite dev server at http://localhost:5173 (HMR; CSS token edits hot-reload)
npm run build          # tsc -b && vite build  (use this for the real type-check, not just tsc)
npm test               # Vitest, single run (jsdom)
npm run test:watch     # Vitest watch mode
npm run lint           # ESLint
npm run lint:theme     # boundary guard — fails if raw colors appear outside src/theme/

# run one test file / one test
npx vitest run src/selectors/metrics.test.ts
npx vitest run -t "totalMrr excludes Churned"
```

Tests are colocated as `*.test.ts(x)` next to source. The browser tools can't open `file://`; serve any static HTML over HTTP (e.g. `python3 -m http.server`) before navigating.

## The swappable-theme boundary (the core constraint)

This is the defining rule of the codebase, enforced by `npm run lint:theme` (`scripts/lint-theme.mjs`):

- **No raw colors (`#hex`, `rgb()`, `hsl()`) may appear in any file outside `src/theme/`.** Components style exclusively with token-backed Tailwind utilities (`bg-surface`, `text-ink`, `border-line`, `text-accent`, `text-pos/neg/warn`, `bg-accent-soft`, …) and the `.num` / `.micro` / `.display` helper classes.
- `var(--token)` references are allowed anywhere (they're tokens, not literal colors) — this is how charts and the `Sparkline` get themed color (`stroke="var(--accent)"`).
- Changing a value in `src/theme/tokens.css` must re-skin the whole app with **zero** component edits. Before adding any color in a component, add/derive a token instead.

Note: `lint:theme` only catches `#hex`/`rgb()`/`hsl()` text. Named Tailwind color utilities (e.g. the modal scrim `bg-black/40`) slip past it — avoid introducing new ones.

## Theme layer internals (`src/theme/`)

- `tokens.css` — the single source of truth: every color/radius/font value, `:root` (light) + `.dark` (dark). Also defines shadcn-compatible aliases so shadcn/ui could be bolted on later.
- `theme.css` — Tailwind v4 entry. **Order matters**: all `@import` statements (fonts, `tailwindcss`, tokens, base) come first (CSS spec), then `@custom-variant dark`, then `@theme inline`. Use `@theme inline` (not plain `@theme`) so utilities resolve `var(--…)` at use-site — that's what makes `.dark` overrides actually apply.
- `base.css` — `.num`/`.micro`/`.display` and `.shadow-modal`/`.shadow-dropdown` live in `@layer components` on purpose, so Tailwind utilities (later `utilities` layer) can override them (e.g. `text-pos` beating `.micro`'s muted color on a badge).
- `chart-theme.ts` — the **only** place chart colors are defined. Exports `SERIES` (categorical palette), `semantic` (accent/pos/neg/cyan/muted), `axisProps`, `gridProps`, `tooltipProps`, `legendProps`. `SERIES[0]` is `var(--accent)` so the first chart series re-skins with the accent token. Categorical `SERIES[1..]` are fixed hex (Recharts can't cleanly resolve many CSS vars for categorical fills) — documented and intentional.
- `RETHEME.md` — the user-facing re-skin guide.

## Data flow

`useAccounts` (`src/hooks/`) is the single CRUD source of truth (seeded from `src/data/accounts.ts`). KPIs and charts **derive** from its list, so any create/edit/delete live-updates everything:

```
data/accounts.ts ──> useAccounts ──> selectors/metrics ──> KpiCard ×4 + MrrShareDonut
                          │                                  DataTable (sort/filter/columns)
                          └── create/edit/delete from AccountFormModal + ConfirmDialog
```

- `selectors/metrics.ts` — pure derive functions. **Churned-handling is deliberate and pinned** (see spec §10): `totalMrr`/`avgGrowth`/`segmentShares` exclude `Churned`; `activeCount` counts only `Active`; `atRiskCount` counts non-`Active`. One intentional demo-parity quirk: `avgGrowth` matches the demo — verify against `demo.html` before "fixing" any metric.
- Persistence: each hook is the sole writer of its `localStorage` key — `useTheme` → `ledger.theme`, `useColumnVisibility` → `ledger.cols`. Don't read/write these keys elsewhere.
- `DataTable/` uses TanStack Table (headless). Global filter matches account name **and** owner. The Account column has id `account` and maps from `visibility.name` (visible by default); `arr`/`since` are hidden by default.

## Gotchas

- **Node 25 + jsdom localStorage**: Node 25 ships an experimental global `localStorage` that shadows jsdom's and lacks working methods. `src/test-setup.ts` installs an in-memory `Storage` polyfill (cleared in `beforeEach`). LocalStorage-backed hook tests depend on this; don't remove it.
- `tsconfig` has `noUnusedLocals`, so `tsc -b` (and thus `npm run build`) fails on unused imports — Vitest does not type-check, so green tests don't guarantee a green build. Run `npm run build` before claiming done.
- Recharts is v3: `Tooltip`'s `formatter` value is typed `ValueType | undefined`, so coerce (`(v) => fmt(Number(v))`).

## When changing behavior

`demo.html` is the parity target and `THEME-SPEC.md` §6 the visual spec — consult both before altering KPIs, the table, charts, or component styling. Keep new visual constants in `src/theme/` and run `npm run lint:theme` + `npm run build` + `npm test`.
