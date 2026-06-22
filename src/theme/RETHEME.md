# Re-skinning parts-bin

The entire look lives in `src/theme/`. To change it, you edit this folder — nothing in
`src/components/` should ever need to change.

## Three moves

1. **Colors / radius / elevation / motion** — edit `tokens.css`. Every value (light in
   `:root`, dark in `.dark`) controls one thing. Change `--accent` to re-color every
   button, link, focus ring, active nav item, and the first chart series.
2. **Fonts** — edit `fonts.css` (the Google Fonts import) and the `--font-*` values in
   `theme.css`.
3. **Done.** Components read these via Tailwind utilities (`bg-surface`, `text-accent`, …);
   charts read them via `var(--…)` and `chart-theme.ts`.

Typography scale lives in `base.css` plus explicit component utilities: default UI/body text is
`14px`, secondary/helper text is `12px`, and `.micro` labels are `12px` uppercase with `0.06em`
tracking. Keep those values aligned with `THEME-SPEC.md` when changing the type system.

## Token reference

| Token | Controls |
|---|---|
| `--bg` / `--surface` / `--surface-2` | app bg / cards / header rows + hover |
| `--line` | all hairline borders |
| `--ink` / `--muted` / `--faint` | primary / secondary / disabled text |
| `--accent` / `--accent-soft` / `--accent-fg` | interactive color / tints / text-on-accent |
| `--intel` / `--intel-soft` | recommendation intelligence and AI-priority cues |
| `--pos` / `--warn` / `--neg` (+ `-soft`) | success / review / reject-blocker colors and tints |
| `--review` / `--reject` (+ `-soft`) | semantic aliases for `--warn` / `--neg` |
| `--r-sm` / `--r-md` / `--r-lg` / `--r-xl` / `--r-pill` | controls, popovers, cards, dialogs, and pills |
| `--sh-1` / `--sh-2` / `--sh-3` | cards, dropdowns/popovers, and modals/drawers |
| `--motion-*` / `--ease-*` | Carbon durations and Material-style easing curves |

## Worked example: emerald, softer corners

In `tokens.css` `:root`:
```css
--accent: #059669;        /* primary action -> emerald */
--accent-soft: #d1fae5;
--r-sm: 6px;              /* controls */
--r-lg: 10px;             /* cards and tables */
```
Also mirror the radius scale under `@theme inline` in `theme.css` using the `--r-*`
tokens. Reload — every token-backed control, surface, and overlay re-skins.

## Theme recipes

parts-bin ships a single recipe — `parts-bin-default` — in `recipes.css`. Recipes are
optional named token presets you can switch at runtime; the default mirrors `tokens.css`.

Use the helper from `recipes.ts` when you want a clone to offer theme switching:

```ts
import { applyThemeRecipe } from './theme/recipes'

applyThemeRecipe('parts-bin-default')
```

Applying a non-default recipe writes `data-theme-recipe` on `<html>` (the default clears it)
and stores the choice in `parts-bin.theme.recipe`. Light/dark mode remains separate and uses
`parts-bin.theme`. Older `ledger.*` keys are still read during migration.

To add a recipe, add variable overrides in `recipes.css` and a metadata entry in `recipes.ts`.
Do not edit component files for re-theming.

## Appearance preferences (Settings page)

The `SettingsPage` starter (`src/components/templates/`) wires its Appearance section to the
three appearance owners: color mode (`useTheme` → `parts-bin.theme`), theme recipe
(`recipes.ts` → `parts-bin.theme.recipe`), and two preference flags persisted by `useSettings`
(`parts-bin.user.settings`, with legacy reads from `ledger.user.settings`). The flags are applied as data attributes on `<html>`:

- `data-density="compact"` — exposes the compact `--row-h` / `--cell-pad` tokens at the root
  (see `base.css`). The DataGrid keeps its own per-grid density; this is an **extension hook**
  for other surfaces, so extend the `html[data-density='compact']` rule to taste.
- `data-reduce-motion="true"` — suppresses the loading animations (mirrors the
  `prefers-reduced-motion` rule in `base.css`) for users who opt in explicitly.

## The boundary is enforced

`npm run lint:theme` fails the build if a raw color (`#hex`, `rgb()`, `hsl()`) appears outside
`src/theme/`. This keeps the theme swappable over time.
