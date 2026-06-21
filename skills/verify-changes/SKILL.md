---
name: verify-changes
description: Use before claiming any change to this repo is done, fixed, or passing — and when a build fails after tests passed, a color sneaks past lint, or a localStorage test misbehaves.
---

# Verify Changes

## Overview

Green tests alone do not prove a change is done in this repo. Vitest does not
type-check, and the theme boundary has blind spots. Verification should still
match the risk and blast radius of the change. Start with the smallest test that
can fail for the edited surface, then broaden only when the change crosses
component, theme, public API, package, or behavior boundaries.

## Choose the smallest meaningful gate

| Change type | Run |
|---|---|---|
| One component only | `npx vitest run path/to/Component.test.tsx` |
| Component export or catalog metadata changed | Affected component test + `npx vitest run src/components/catalog.test.ts src/components/barrels.test.ts`; add `npm run build` when public props/types changed |
| Styling or theme-token change | Affected component test + `npm run lint:theme`; add a focused browser check for visible changes |
| Shared hook/selector/helper | Directly affected test file(s), then broaden only if callers or contracts changed |
| DataGrid infrastructure, persistence, or package entrypoints | Directly affected DataGrid tests first; add `npm run build`, `npm run test:package`, or focused Playwright when that surface changed |
| Release, broad refactor, dependency/config change, or user asks for full verification | `npm run lint`, `npm run lint:theme`, `npm run build`, `npm test`; add `npm run test:e2e` for layout/visual behavior |

Notes that prevent wasted debugging:

- **Build is the real type-check.** Vitest does not type-check, and
  `tsconfig` sets `noUnusedLocals`, so a single unused import fails the build
  even when every test is green. Run `npm run build` when TypeScript contracts,
  exported props, barrels, package entrypoints, or public APIs changed.
- **`lint:theme` has a blind spot.** It only matches raw color text. Named Tailwind
  color utilities (e.g. `bg-black/40`) slip past it — do not introduce new
  ones; use token-backed utilities instead. Run it when styling or tokens
  changed.
- **Vitest depends on `src/test-setup.ts`.** It installs an in-memory
  localStorage polyfill (Node 25 ships a broken experimental global that
  shadows jsdom's). If localStorage-backed hook tests fail strangely, check
  that file is intact — and never remove it.
- **Playwright is self-contained.** Playwright's `webServer` config builds and
  serves the app itself — don't pre-start a dev server. First run on a
  fresh clone needs browser binaries: `npx playwright install`.

Run a single test while iterating, and only run broader gates when the table
above calls for them:

```bash
npx vitest run src/selectors/metrics.test.ts        # one file
npx vitest run -t "totalMrr excludes Churned"       # one test by name
```

## Before "fixing" a metric or visual behavior

`demo.html` (standalone prototype) is the behavior parity target and
`THEME-SPEC.md` is the design spec. Some behavior that looks like a bug is
pinned on purpose — e.g. `avgGrowth` in `src/selectors/metrics.ts` includes
Churned accounts to match the demo. Compare against `demo.html` before
changing any metric, KPI, table, or chart behavior. Browsers/tools can't open
`file://` URLs; serve it first (`python3 -m http.server`).

## Common mistakes

| Mistake | Reality |
|---|---|
| "Tests pass, ship it" | Build may still fail on types/unused imports. Run `npm run build` when public types/contracts changed. |
| "lint:theme passed, boundary is clean" | Named Tailwind colors slip past. Grep your diff: `grep -E 'bg-(white|black|gray|slate|zinc)|text-(white|black|gray)'` |
| "This metric is obviously wrong, fixing it" | Check `demo.html` parity first — it may be pinned by design. |
| "Skipping e2e, jsdom covered it" | Layout-sensitive DataGrid behavior only fails in a real browser. |
| "One component changed, so run everything" | Start with that component's colocated test and broaden only for changed boundaries. |
