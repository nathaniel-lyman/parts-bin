---
name: add-component
description: Use when adding or substantially modifying any UI component in this repo — before writing the first line of JSX.
---

# Add a Component

## Overview

This repo has ~99 cataloged components; the most common failure is building
one that already exists or styling it outside the theme boundary. The
workflow is catalog-first, token-only, catalog-registered.

## Checklist

1. **Search before you build: read `src/components/catalog.ts`.** It's the
   machine-readable index — import path, `purpose`, `use_when`,
   `prefer_over` (which near-twin to pick and why), real props, and a
   snippet. `/docs` renders it live in the running app. If a near-twin
   exists, extend it instead of adding a sibling.
2. **Style with tokens only.** Token-backed Tailwind utilities
   (`bg-surface`, `text-ink`, `border-line`, `text-accent`,
   `text-pos/neg/warn`, `bg-accent-soft`, …) and the `.num` / `.micro` /
   `.display` helper classes. `var(--token)` references are fine — that's
   how `Sparkline` and the charts get color. Never raw colors
   (`npm run lint:theme` blocks them) and never named Tailwind colors like
   `bg-black/40` (the linter misses those, but they break re-skinning).
   Need a new color? Add/derive a token in `src/theme/tokens.css` first.
3. **Export from the right barrel** (`ui`, `shell`, `charts`, `DataGrid`, or
   the `src/components` aggregate) — consumers import from barrels, not deep
   paths.
4. **Register it in `CATALOG`** (`src/components/catalog.ts`) via the
   `defineComponent` factory — the `props` array is compile-checked against
   the component's real props, so `npm run build` fails on typos. Fill
   `purpose`, `use_when`, a copy-paste `snippet`, and `prefer_over` if it
   has near-twins. Helper components not meant for direct use go in the
   `INTERNAL` map instead (name → one-line reason).
   `src/components/catalog.test.ts` fails if any export is neither
   cataloged nor `INTERNAL`, if an `INTERNAL` entry goes stale, or if
   `prefer_over`/`related` reference uncataloged names.
5. **Colocate a test** as `ComponentName.test.tsx` next to the source.
6. **Verify the smallest affected surface:** run the component's colocated
   test first. If you changed exports, catalog metadata, or public props, also
   run `npx vitest run src/components/catalog.test.ts src/components/barrels.test.ts`
   and `npm run build` because the catalog `props` check only runs in the build
   gate, not in Vitest. If you only changed internal rendering or styling, do
   not run the full repo gauntlet unless the change is cross-cutting or the
   user asks for it.

## Common mistakes

| Mistake | Fix |
|---|---|
| Built a twin of an existing component | Check `use_when`/`prefer_over` in the catalog first |
| Hardcoded a hex "temporarily" | Add a token; lint:theme fails the build regardless |
| `bg-white`, `bg-black/40`, `text-gray-500` | Invisible to lint:theme but wrong — use `bg-surface`, `text-muted`, … |
| Skipped the CATALOG entry | `catalog.test.ts` fails; intentional helpers go in `INTERNAL` |
| Internal component test passed, but public props changed | `defineComponent` props are checked by `tsc`, so run `npm run build` |
