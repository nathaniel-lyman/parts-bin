# Re-skinning Ledger

The entire look lives in `src/theme/`. To change it, you edit this folder — nothing in
`src/components/` should ever need to change.

## Three moves

1. **Colors / radius** — edit `tokens.css`. Every value (light in `:root`, dark in `.dark`)
   controls one thing. Change `--accent` to re-color every button, link, focus ring, active
   nav item, and the first chart series.
2. **Fonts** — edit `fonts.css` (the Google Fonts import) and the `--font-*` values in
   `theme.css`.
3. **Done.** Components read these via Tailwind utilities (`bg-surface`, `text-accent`, …);
   charts read them via `var(--…)` and `chart-theme.ts`.

## Token reference

| Token | Controls |
|---|---|
| `--bg` / `--surface` / `--surface-2` | app bg / cards / header rows + hover |
| `--line` | all hairline borders |
| `--ink` / `--muted` / `--faint` | primary / secondary / disabled text |
| `--accent` / `--accent-soft` / `--accent-fg` | interactive color / tints / text-on-accent |
| `--pos` / `--neg` / `--warn` (+ `-soft`) | semantic data colors and badge tints |

## Worked example: emerald, softer corners

In `tokens.css` `:root`:
```css
--accent: #059669;        /* cobalt -> emerald */
--accent-soft: #d1fae5;
--radius: 8px;            /* sharper 2px -> rounded 8px */
```
Also set `--radius: 8px` under `@theme inline` in `theme.css`. Reload — every control re-skins.

## The boundary is enforced

`npm run lint:theme` fails the build if a raw color (`#hex`, `rgb()`, `hsl()`) appears outside
`src/theme/`. This keeps the theme swappable over time.
