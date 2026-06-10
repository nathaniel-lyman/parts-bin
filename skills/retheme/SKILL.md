---
name: retheme
description: Use when re-skinning this dashboard to a new brand or palette — changing colors, accent, dark mode, radii, fonts, or chart colors, or when asked to "make it match my brand".
---

# Retheme

## Overview

The entire skin lives in `src/theme/`. A re-skin edits **only that folder** —
never put a raw color (`#hex`, `rgb()`, `hsl()`) in a component;
`npm run lint:theme` fails the build if you do. `src/theme/RETHEME.md` is the
canonical reference; this is the working checklist.

## Checklist

1. **Read `src/theme/RETHEME.md`** — token reference table plus a worked
   example (emerald + softer corners).
2. **Colors: edit `src/theme/tokens.css`.** Update **both** `:root` (light)
   and `.dark` (dark) — a brand that only restyles light mode is half done.
   Mirror the existing structure: `.dark` deliberately overrides only the
   tokens that differ in dark mode (e.g. it omits `--accent-fg` and the
   shadcn aliases, which cascade from `:root` via `var()`); follow that
   pattern rather than duplicating every token. Token groups to cover:
   - surfaces: `--bg`, `--surface`, `--surface-2`, `--line`
   - text: `--ink`, `--muted`, `--faint`
   - interaction: `--accent`, `--accent-soft`, `--accent-fg`
   - intelligence: `--intel`, `--intel-soft`
   - semantic states: `--pos`, `--warn`, `--neg` (+ `-soft`), aliases
     `--review`, `--reject`
   - shadcn aliases at the bottom (keep in sync if shadcn/ui may be added)
3. **Radii:** `--radius` in `tokens.css`, **and** mirror it under
   `@theme inline` in `src/theme/theme.css` (the worked example in
   RETHEME.md shows this) — changing only `tokens.css` won't round the
   corners.
4. **Fonts:** edit `src/theme/fonts.css` (the font import) and the
   `--font-*` values in `theme.css`.
5. **Charts follow automatically — mostly.** `src/theme/chart-theme.ts` is
   the only place chart colors are defined. `SERIES[0]` is `var(--accent)`,
   so the lead series re-skins with your accent. Categorical `SERIES[1..]`
   and `semantic.cyan` are fixed hex by design — update them there if the
   brand needs its own palette. This is the only kind of file where new hex
   belongs.
6. **Optional — ship it as a recipe instead.** To keep the default and add
   the brand as a switchable preset, add variable overrides in
   `src/theme/recipes.css` and a metadata entry in `src/theme/recipes.ts`
   (existing examples: `finance-cobalt`, `ops-green`, `enterprise-neutral`).
   Note: an applied recipe (`data-theme-recipe` on `<html>`, persisted under
   `ledger.theme.recipe`) overrides `tokens.css` values — if your edits seem
   to do nothing, check that no recipe is active.

## Verify

1. `npm run lint:theme` — must pass.
2. `npm run dev`, then eyeball **both modes** (the theme toggle adds/removes
   `.dark` on `<html>`): dashboard `/`, `/login`, `/settings`, `/docs`.
3. Finish with the full gauntlet: follow `skills/verify-changes/SKILL.md`.

## Common mistakes

| Mistake | Fix |
|---|---|
| Edited `:root` only | Re-skin both modes — update the tokens `.dark` already overrides |
| Hex added in a component "just this once" | Add/derive a token in `tokens.css`; lint:theme blocks hex anyway |
| Named Tailwind color (`bg-black/40`) | Slips past lint:theme but breaks swappability — use token utilities |
| Radius changed but corners didn't | Also set `--radius` under `@theme inline` in `theme.css` |
| Charts still show old palette | Categorical `SERIES[1..]` are fixed hex in `chart-theme.ts` — update there |
