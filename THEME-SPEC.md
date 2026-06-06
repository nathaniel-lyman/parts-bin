# Ledger — a dashboard theme for React

**Sharp & technical. Corporate polish with personality.** Built for data-heavy dashboards with simple CRUD. Targets Tailwind CSS + shadcn/ui.

The personality comes from four moves: monospace numerals everywhere data lives, uppercase micro-labels with wide tracking, a near-zero border radius that makes everything feel machined, and one unapologetic cobalt accent against disciplined neutrals. Everything else stays quiet so the data is the loudest thing on screen.

---

## 1. Design principles

**Data is the hero.** Chrome (nav, cards, headers) uses neutrals only. Color is reserved for data: deltas, statuses, chart series, and the single accent for interactive elements. If something is colored, it should mean something.

**Density without claustrophobia.** Default to compact spacing (40px table rows, 16px card padding) but enforce a strict 4px spacing grid and hairline (1px) dividers so density reads as precision, not clutter.

**Motion is utilitarian.** 120–160ms ease-out transitions on hover/focus/open. No springs, no bounces. The one indulgence: numbers may tick/fade when they update.

**Honest hierarchy.** Three text sizes do 90% of the work: 13px body, 12px secondary, 11px micro-labels. Headings use a display face sparingly — that contrast is the polish.

---

## 2. Typography

| Role | Font | Usage |
|---|---|---|
| UI / body | **Inter** | Everything by default. 13px base in dashboards. |
| Data / numerals | **JetBrains Mono** | All numbers in tables, KPIs, deltas, IDs, timestamps. Always `font-variant-numeric: tabular-nums`. |
| Display | **Space Grotesk** | Page titles and KPI values only. Adds personality without costing legibility. |

Scale (dashboard-tuned, tighter than marketing-site scales):

```
display:  28px / 1.1  / Space Grotesk 600   — page title
kpi:      24px / 1.0  / Space Grotesk 600   — stat values (mono also acceptable)
h2:       16px / 1.3  / Inter 600           — card & section titles
body:     13px / 1.5  / Inter 400/500       — default
small:    12px / 1.4  / Inter 400           — secondary, table meta
micro:    11px / 1.2  / Inter 600 UPPERCASE — labels, column headers, badges
          letter-spacing: 0.06em
mono:     12.5px      / JetBrains Mono      — table numerals, code, IDs
```

The micro-label is the theme's signature. Column headers, card eyebrows, badge text, and nav section labels are all `11px / 600 / uppercase / tracking-wider / text-muted`.

---

## 3. Color system

Light is the default (corporate context); dark is first-class. Tokens are raw values consumed via CSS variables so both shadcn and hand-rolled components share one source.

### Neutrals + accent

| Token | Light | Dark | Role |
|---|---|---|---|
| `--bg` | `#f7f8fa` | `#0b0d11` | App background |
| `--surface` | `#ffffff` | `#13161c` | Cards, tables, modals |
| `--surface-2` | `#f1f3f6` | `#1a1e26` | Table header rows, wells, hover |
| `--line` | `#e3e6eb` | `#262b35` | Hairline borders, dividers |
| `--ink` | `#15181e` | `#e8eaee` | Primary text |
| `--muted` | `#5c6470` | `#9aa3b2` | Secondary text, labels |
| `--faint` | `#8b93a1` | `#646d7d` | Placeholders, disabled |
| `--accent` | `#2545ff` | `#5b76ff` | Cobalt. Buttons, links, focus, active nav |
| `--accent-soft` | `#eceffe` | `#1c2342` | Accent tint backgrounds (selected rows, chips) |
| `--accent-fg` | `#ffffff` | `#ffffff` | Text on accent |

### Semantic (data meaning — never decorative)

| Token | Light | Dark | Role |
|---|---|---|---|
| `--pos` | `#0a8754` | `#34c98e` | Positive deltas, success, "up" |
| `--neg` | `#d92d20` | `#f97066` | Negative deltas, errors, destructive |
| `--warn` | `#b54708` | `#f5a524` | Warnings, at-risk states |
| `--pos-soft` / `--neg-soft` / `--warn-soft` | tints | tints | Badge backgrounds |

Deltas always pair color with a directional glyph (`▲` / `▼`) so meaning survives color-blindness and grayscale printing.

### Data-viz palette (categorical, in order)

```
1 cobalt   #2545ff     5 magenta  #d6336c
2 cyan     #00a6c2     6 teal     #0d9488
3 violet   #7c4dff     7 slate    #64748b
4 amber    #f59e0b     8 lime     #84cc16
```

Sequential: cobalt ramp `#eceffe → #2545ff → #101c66`. Diverging: `--neg → neutral gray → --pos`. Gridlines use `--line`; axis text uses `--muted` at 11px mono.

---

## 4. Shape, depth, and texture

- **Radius:** `2px` on everything (buttons, inputs, cards, badges). `4px` max for modals. This single decision does the most "sharp & technical" work.
- **Borders over shadows.** Every surface gets a 1px `--line` border. Shadows only for floating layers: modal `0 16px 48px rgb(0 0 0 / .18)`, dropdown `0 4px 16px rgb(0 0 0 / .10)`.
- **Focus ring:** `2px solid --accent`, `2px` offset. Visible, square, proud. Keyboard users are first-class in CRUD apps.
- **Personality texture (optional):** the app background may carry a faint 24px dot-grid (`radial-gradient` at 3% opacity) — terminal-paper energy, invisible until you look.

---

## 5. Token implementation

### globals.css (shadcn-compatible)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap');

:root {
  --bg: #f7f8fa;          --surface: #ffffff;     --surface-2: #f1f3f6;
  --line: #e3e6eb;        --ink: #15181e;         --muted: #5c6470;
  --faint: #8b93a1;       --accent: #2545ff;      --accent-soft: #eceffe;
  --accent-fg: #ffffff;
  --pos: #0a8754;  --pos-soft: #e3f5ec;
  --neg: #d92d20;  --neg-soft: #fdecea;
  --warn: #b54708; --warn-soft: #fdf1e3;

  /* shadcn/ui mappings */
  --background: var(--bg);        --foreground: var(--ink);
  --card: var(--surface);         --card-foreground: var(--ink);
  --popover: var(--surface);      --popover-foreground: var(--ink);
  --primary: var(--accent);       --primary-foreground: var(--accent-fg);
  --secondary: var(--surface-2);  --secondary-foreground: var(--ink);
  --muted-bg: var(--surface-2);   --muted-foreground: var(--muted);
  --destructive: var(--neg);      --destructive-foreground: #ffffff;
  --border: var(--line);          --input: var(--line);
  --ring: var(--accent);          --radius: 2px;
}

.dark {
  --bg: #0b0d11;          --surface: #13161c;     --surface-2: #1a1e26;
  --line: #262b35;        --ink: #e8eaee;         --muted: #9aa3b2;
  --faint: #646d7d;       --accent: #5b76ff;      --accent-soft: #1c2342;
  --pos: #34c98e;  --pos-soft: #11281e;
  --neg: #f97066;  --neg-soft: #2d1715;
  --warn: #f5a524; --warn-soft: #2b2010;
}

body {
  background: var(--bg);
  color: var(--ink);
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 13px;
  -webkit-font-smoothing: antialiased;
}

.num { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
.micro {
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: .06em; color: var(--muted);
}
```

### tailwind.config.js (extend)

```js
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)', surface: 'var(--surface)', 'surface-2': 'var(--surface-2)',
        line: 'var(--line)', ink: 'var(--ink)', muted: 'var(--muted)', faint: 'var(--faint)',
        accent: { DEFAULT: 'var(--accent)', soft: 'var(--accent-soft)', fg: 'var(--accent-fg)' },
        pos: { DEFAULT: 'var(--pos)', soft: 'var(--pos-soft)' },
        neg: { DEFAULT: 'var(--neg)', soft: 'var(--neg-soft)' },
        warn: { DEFAULT: 'var(--warn)', soft: 'var(--warn-soft)' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      borderRadius: { DEFAULT: '2px', md: '2px', lg: '4px' },
    },
  },
}
```

---

## 6. Component recipes

**Charts (Recharts).** Wire every chart to the token system so dark mode is free. Rules: axes in 11px JetBrains Mono `--muted` with no tick lines; gridlines `--line` dashed `3 3`, horizontal only; tooltips are surface + hairline border + dropdown shadow with micro-label header and mono values; legends are micro-labels with 8px square swatches, top-right of the card; lines 1.75px with no dots (active dot 3px); bars max 22px wide, square corners; donuts 24px ring width, 2° padding angle, center metric in mono; area fills at 8% opacity, never gradients. Categorical series take the palette in order. Semantic charts (movement, variance) use `--accent` / `--pos` / `--neg` instead of the palette, with a `ReferenceLine` at zero in `--muted`. Shared config:

```jsx
const axisProps = {
  tick: { fill: 'var(--muted)', fontSize: 11, fontFamily: '"JetBrains Mono", monospace' },
  axisLine: { stroke: 'var(--line)' }, tickLine: false,
};
const gridProps = { stroke: 'var(--line)', strokeDasharray: '3 3', vertical: false };
// diverging stacked bars: <BarChart stackOffset="sign"> + <ReferenceLine y={0} stroke="var(--muted)" />
```

**KPI stat card.** Eyebrow micro-label → display-font value (mono numerals) → delta badge with glyph → optional sparkline in accent at 60% opacity. Border, no shadow, 16px padding.

**Data table.** The centerpiece. Built on TanStack Table (headless) so sorting, filtering, and column visibility are state-driven, with the theme applied at render time via `flexRender`. Include a "Columns" menu (popover with checkboxes) so users add/remove columns; ship secondary columns (ARR, Since, IDs) hidden by default and persist the user's choice to `localStorage`. Actions and selection columns set `enableHiding: false`. Sortable headers expose `aria-sort`. Header row on `--surface-2` with micro-label columns; 40px body rows; numerals right-aligned in mono; hairline row dividers only (no vertical rules, no zebra). Row hover = `--surface-2`; selected = `--accent-soft` with a 2px accent left edge. Sort indicator: `▲/▼` in accent next to the active column. Row actions (edit/delete) are icon buttons that appear on hover.

**Forms (CRUD).** Inputs 32px tall, `--surface` on `--line` border, 2px radius; focus swaps border to accent + ring. Labels are micro-labels above the field. Use modals for create/edit (480px, 4px radius, heavy shadow, micro-label section dividers). Destructive confirms: red outline button, never a red-filled primary until the final confirm.

**Buttons.** Primary = accent fill; Secondary = surface + line border; Ghost = text-only; Destructive = neg outline → neg fill on confirm step. Heights: 32px default, 28px compact (in-table). All 2px radius, 13px/500.

**Badges/status.** Soft-tint background + strong-color text + 6px status dot, micro-label type. e.g. `Active` = pos-soft/pos · `At risk` = warn-soft/warn · `Churned` = neg-soft/neg.

**Toasts.** Bottom-right, surface + border + dropdown shadow, 4px accent (or semantic) left edge, auto-dismiss 4s.

**Empty states.** Mono-font ASCII-ish glyph or sparse line icon, one sentence in `--muted`, one primary action. Never illustrations — wrong personality.

---

## 7. Voice (microcopy)

Terse, lowercase-comfortable, numerate: "12 accounts · $84.2k MRR", "Saved 2s ago", "No results for 'acme' — clear filter". Confirmations state consequences plainly: "Delete Meridian Corp? This removes 14 months of history."

---

*See `demo.html` for all of the above rendered live with working CRUD, sorting, filtering, and dark mode.*
