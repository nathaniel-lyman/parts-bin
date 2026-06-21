# parts-bin — a dashboard-ready design system for React

**Sharp & technical. Corporate polish with personality.** Built for data-heavy dashboards with simple CRUD. Targets Tailwind CSS + shadcn/ui.

The personality comes from four moves: monospace numerals everywhere data lives, uppercase micro-labels with wide tracking, a restrained Plex·Elevate radius/elevation scale, and a disciplined analytics palette with blue actions plus explicit review/reject semantics. Everything else stays quiet so the data is the loudest thing on screen.

---

## 1. Design principles

**Data is the hero.** Chrome (nav, cards, headers) uses neutrals only. Color is reserved for data: deltas, statuses, chart series, and the single accent for interactive elements. If something is colored, it should mean something.

**Density without claustrophobia.** Default to compact spacing (40px table rows, 16px card padding) but enforce a strict 4px spacing grid and hairline (1px) dividers so density reads as precision, not clutter.

**Motion is utilitarian.** Use the Plex·Elevate motion tokens: productive motion for data updates, expressive motion for floating surfaces entering view, and emphasized motion for larger layout changes. No springs, no bounces. The one indulgence: numbers may tick/fade when they update.

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
| `--bg` | `#F8FAFC` | `#020617` | App background |
| `--surface` | `#FFFFFF` | `#0F172A` | Cards, tables, modals |
| `--surface-2` | `#F1F5F9` | `#1E293B` | Table header rows, wells, hover |
| `--line` | `#E2E8F0` | `#334155` | Hairline borders, dividers |
| `--ink` | `#0F172A` | `#F8FAFC` | Primary text |
| `--muted` | `#475569` | `#CBD5E1` | Secondary text, labels |
| `--faint` | `#94A3B8` | `#64748B` | Placeholders, disabled |
| `--accent` | `#2563EB` | `#60A5FA` | Primary action. Buttons, links, focus, active nav |
| `--accent-soft` | `#DBEAFE` | `#172554` | Accent tint backgrounds (selected rows, chips) |
| `--accent-fg` | `#ffffff` | `#ffffff` | Text on accent |
| `--intel` | `#7C3AED` | `#A78BFA` | Recommendation intelligence, AI priority cues |
| `--intel-soft` | `#EDE9FE` | `#2E1065` | Recommendation intelligence tint |

### Semantic (data meaning — never decorative)

| Token | Light | Dark | Role |
|---|---|---|---|
| `--pos` | `#16A34A` | `#22C55E` | Positive deltas, success, "up" |
| `--neg` | `#DC2626` | `#F87171` | Reject / blocker, errors, destructive |
| `--warn` | `#D97706` | `#F59E0B` | Review, warnings, at-risk states |
| `--pos-soft` / `--neg-soft` / `--warn-soft` | tints | tints | Badge backgrounds |

Deltas always pair color with a directional glyph (`▲` / `▼`) so meaning survives color-blindness and grayscale printing.

### Data-viz palette (categorical, in order)

```
1 primary action  var(--accent)   5 reject/blocker  var(--neg)
2 intelligence    var(--intel)    6 teal            #0d9488
3 success         var(--pos)      7 slate           #64748b
4 review          var(--warn)     8 lime            #84cc16
```

Sequential: primary ramp `--accent-soft → --accent`. Diverging: `--neg → neutral gray → --pos`. Gridlines use `--line`; axis text uses `--muted` at 11px mono.

---

## 4. Shape, depth, and texture

- **Radius:** follow the Plex·Elevate scale: `--r-sm: 4px` for buttons, inputs, square chips, and icons; `--r-md: 6px` for segmented controls, dropdowns, and inline notifications; `--r-lg: 8px` for cards, panels, and tables; `--r-xl: 10px` for modals and dialogs; `--r-pill: 20px` for tags, status pills, and toggles.
- **Elevation:** flat dense tables still use borders first. Resting cards use `--sh-1`; dropdowns, popovers, and sticky bars use `--sh-2`; modals and drawers use `--sh-3`. Dark mode uses stronger black shadows but relies primarily on surface tone and `--line` for separation.
- **Focus ring:** `2px solid --accent`, `2px` offset. Visible, square, proud. Keyboard users are first-class in CRUD apps.
- **Personality texture (optional):** the app background may carry a faint 24px dot-grid (`radial-gradient` at 3% opacity) — terminal-paper energy, invisible until you look.

---

## 5. Token implementation

### globals.css (shadcn-compatible)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap');

:root {
  --bg: #f8fafc;          --surface: #ffffff;     --surface-2: #f1f5f9;
  --line: #e2e8f0;        --ink: #0f172a;         --muted: #475569;
  --faint: #94a3b8;       --accent: #2563eb;      --accent-soft: #dbeafe;
  --accent-fg: #ffffff;
  --intel: #7c3aed; --intel-soft: #ede9fe;
  --pos: #16a34a;   --pos-soft: #dcfce7;
  --neg: #dc2626;   --neg-soft: #fee2e2;
  --warn: #d97706;  --warn-soft: #fef3c7;
  --review: var(--warn); --review-soft: var(--warn-soft);
  --reject: var(--neg);  --reject-soft: var(--neg-soft);

  /* shadcn/ui mappings */
  --background: var(--bg);        --foreground: var(--ink);
  --card: var(--surface);         --card-foreground: var(--ink);
  --popover: var(--surface);      --popover-foreground: var(--ink);
  --primary: var(--accent);       --primary-foreground: var(--accent-fg);
  --secondary: var(--surface-2);  --secondary-foreground: var(--ink);
  --muted-bg: var(--surface-2);   --muted-foreground: var(--muted);
  --destructive: var(--neg);      --destructive-foreground: #ffffff;
  --border: var(--line);          --input: var(--line);
  --ring: var(--accent);

  --r-sm: 4px; --r-md: 6px; --r-lg: 8px; --r-xl: 10px; --r-pill: 20px;
  --radius-sm: var(--r-sm); --radius-md: var(--r-md); --radius-lg: var(--r-lg);
  --radius-xl: var(--r-xl); --radius-pill: var(--r-pill);
  --radius: var(--r-sm);
  --sh-1: 0 1px 2px rgb(22 22 22 / .10), 0 1px 3px rgb(22 22 22 / .05);
  --sh-2: 0 2px 4px rgb(22 22 22 / .05), 0 6px 18px rgb(22 22 22 / .09);
  --sh-3: 0 3px 6px rgb(22 22 22 / .04), 0 8px 20px rgb(22 22 22 / .10);
  --motion-fast-01: 70ms; --motion-fast-02: 110ms;
  --motion-moderate-01: 150ms; --motion-moderate-02: 240ms;
  --motion-slow-01: 400ms; --motion-slow-02: 700ms;
  --ease-productive: cubic-bezier(.2, 0, .38, .9);
  --ease-expressive: cubic-bezier(.4, .14, .3, 1);
  --ease-emphasized: cubic-bezier(.2, 0, 0, 1);
}

.dark {
  --bg: #020617;          --surface: #0f172a;     --surface-2: #1e293b;
  --line: #334155;        --ink: #f8fafc;         --muted: #cbd5e1;
  --faint: #64748b;       --accent: #60a5fa;      --accent-soft: #172554;
  --intel: #a78bfa; --intel-soft: #2e1065;
  --pos: #22c55e;   --pos-soft: #052e16;
  --neg: #f87171;   --neg-soft: #450a0a;
  --warn: #f59e0b;  --warn-soft: #451a03;
  --review: var(--warn); --review-soft: var(--warn-soft);
  --reject: var(--neg);  --reject-soft: var(--neg-soft);
  --sh-1: 0 1px 2px rgb(0 0 0 / .45);
  --sh-2: 0 2px 10px rgb(0 0 0 / .55);
  --sh-3: 0 6px 18px rgb(0 0 0 / .55);
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
        intel: { DEFAULT: 'var(--intel)', soft: 'var(--intel-soft)' },
        pos: { DEFAULT: 'var(--pos)', soft: 'var(--pos-soft)' },
        neg: { DEFAULT: 'var(--neg)', soft: 'var(--neg-soft)' },
        warn: { DEFAULT: 'var(--warn)', soft: 'var(--warn-soft)' },
        review: { DEFAULT: 'var(--review)', soft: 'var(--review-soft)' },
        reject: { DEFAULT: 'var(--reject)', soft: 'var(--reject-soft)' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: 'var(--r-sm)',
        sm: 'var(--r-sm)',
        md: 'var(--r-md)',
        lg: 'var(--r-lg)',
        xl: 'var(--r-xl)',
        pill: 'var(--r-pill)',
      },
    },
  },
}
```

---

## 6. Component recipes

**Charts (Recharts).** Wire every chart to the token system so dark mode is free. Rules: axes in 11px JetBrains Mono `--muted` with no tick lines; gridlines `--line` dashed `3 3`, horizontal only; tooltips are surface + hairline border + dropdown shadow with micro-label header and mono values; legends are micro-labels with 8px square swatches, top-right of the card; lines 1.75px with no dots (active dot 3px); bars default to 22px wide, stay square-cornered, and may expose a token-backed width control when the chart UI needs it; optional bar labels should render only when the measured bar segment has enough room to avoid overlap; donuts 24px ring width, 2° padding angle, center metric in mono; area fills at 8% opacity, never gradients. Categorical series take the palette in order. Semantic charts (movement, variance, waterfall) use `--accent` / `--pos` / `--neg` instead of the palette, with a `ReferenceLine` at zero in `--muted`. Waterfalls use range bars (`[low, high]`) plus a custom shape for per-step color and connectors; keep a visible start/net/end summary and a screen-reader step narration outside hover-only SVG content. Shared config:

```jsx
const axisProps = {
  tick: { fill: 'var(--muted)', fontSize: 11, fontFamily: '"JetBrains Mono", monospace' },
  axisLine: { stroke: 'var(--line)' }, tickLine: false,
};
const gridProps = { stroke: 'var(--line)', strokeDasharray: '3 3', vertical: false };
// diverging stacked bars: <BarChart stackOffset="sign"> + <ReferenceLine y={0} stroke="var(--muted)" />
```

**KPI stat card.** Eyebrow micro-label → display-font value (mono numerals) → delta badge with glyph → optional sparkline in accent at 60% opacity. Border plus `--sh-1`, `--r-lg`, 16px padding.

**Data table.** The centerpiece. Built on TanStack Table (headless) so sorting, filtering, and column visibility are state-driven, with the theme applied at render time via `flexRender`. Include a "Columns" menu (popover with checkboxes) so users add/remove columns; ship secondary columns (ARR, Since, IDs) hidden by default and persist the user's choice to `localStorage`. Actions and selection columns set `enableHiding: false`. Sortable headers expose `aria-sort`. Header row on `--surface-2` with micro-label columns; 40px body rows; numerals right-aligned in mono; hairline row dividers only (no vertical rules, no zebra). Row hover = `--surface-2`; selected = `--accent-soft` with a 2px accent left edge. Sort indicator: `▲/▼` in accent next to the active column. Row actions (edit/delete) are icon buttons that appear on hover.

**Forms (CRUD).** Inputs 32px tall, `--surface` on `--line` border, `--r-sm`; focus swaps border to accent + ring. Labels are micro-labels above the field. Use modals for create/edit (480px, `--r-xl`, `--sh-3`, micro-label section dividers). Destructive confirms: red outline button, never a red-filled primary until the final confirm.

**Buttons.** Primary = accent fill; Secondary = surface + line border; Ghost = text-only; Destructive = neg outline → neg fill on confirm step. Heights: 32px default, 28px compact (in-table). All `--r-sm`, 13px/500, productive motion.

**Badges/status.** Soft-tint background + strong-color text + 6px status dot, micro-label type, `--r-pill`. e.g. `Active` = pos-soft/pos · `Review` = warn-soft/warn · `Blocked` = neg-soft/neg.

**Toasts.** Bottom-right, surface + border + dropdown shadow (`--sh-2`), `--r-md`, 4px accent (or semantic) left edge, auto-dismiss 4s.

**Empty states.** Mono-font ASCII-ish glyph or sparse line icon, one sentence in `--muted`, one primary action. Never illustrations — wrong personality.

---

## 7. Voice (microcopy)

Terse, lowercase-comfortable, numerate: "12 rows · $84.2k value", "Saved 2s ago", "No results for 'acme' — clear filter". Confirmations state consequences plainly: "Delete Meridian Corp? This removes 14 months of history."

---

*See `demo.html` for all of the above rendered live with working CRUD, sorting, filtering, and dark mode.*
