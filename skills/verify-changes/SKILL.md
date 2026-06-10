---
name: verify-changes
description: Use before claiming any change to this repo is done, fixed, or passing — and when a build fails after tests passed, a color sneaks past lint, or a localStorage test misbehaves.
---

# Verify Changes

## Overview

Green tests alone do not prove a change is done in this repo. Vitest does not
type-check, and the theme boundary has blind spots. Run every gate below, in
order, before reporting success.

## The gates (run in order)

| # | Command | Catches |
|---|---|---|
| 1 | `npm run lint` | ESLint issues |
| 2 | `npm run lint:theme` | raw colors (`#hex`, `rgb()`, `hsl()`) outside `src/theme/` |
| 3 | `npm run build` | **type errors tests can't see** (`tsc -b` + Vite build) |
| 4 | `npm test` | Vitest suite, single run (jsdom) |
| 5 | `npm run test:e2e` | Playwright — run only when layout or visual behavior changed |

Notes that prevent wasted debugging:

- **Gate 3 is the real type-check.** Vitest does not type-check, and
  `tsconfig` sets `noUnusedLocals`, so a single unused import fails the build
  even when every test is green. Never claim done on `npm test` alone.
- **Gate 2 has a blind spot.** It only matches raw color text. Named Tailwind
  color utilities (e.g. `bg-black/40`) slip past it — do not introduce new
  ones; use token-backed utilities instead.
- **Gate 4 depends on `src/test-setup.ts`.** It installs an in-memory
  localStorage polyfill (Node 25 ships a broken experimental global that
  shadows jsdom's). If localStorage-backed hook tests fail strangely, check
  that file is intact — and never remove it.
- **Gate 5 is self-contained.** Playwright's `webServer` config builds and
  serves the app itself — don't pre-start a dev server. First run on a
  fresh clone needs browser binaries: `npx playwright install`.

Run a single test while iterating, then the full gauntlet at the end:

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
| "Tests pass, ship it" | Build may still fail on types/unused imports. Run gate 3. |
| "lint:theme passed, boundary is clean" | Named Tailwind colors slip past. Grep your diff: `grep -E 'bg-(white|black|gray|slate|zinc)|text-(white|black|gray)'` |
| "This metric is obviously wrong, fixing it" | Check `demo.html` parity first — it may be pinned by design. |
| "Skipping e2e, jsdom covered it" | Layout-sensitive DataGrid behavior only fails in a real browser. |
