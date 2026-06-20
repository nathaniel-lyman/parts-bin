# parts-bin — how to build with this design system

`parts-bin` is a React design system whose entire visual skin is driven by **design tokens**.
Build with its components and style your own layout glue with the **token-backed Tailwind
utility classes** below — never with raw colors. That is the one rule that keeps everything
on-brand and re-skinnable.

## Setup

- No app-wide provider is required for most components — they render styled on their own as long
  as the design system stylesheet is loaded (it is, via `styles.css`). Tokens + the three brand
  fonts (Inter / JetBrains Mono / Space Grotesk) come from that stylesheet.
- **Dark mode:** add `class="dark"` to a root ancestor. Every token flips automatically — do not
  hand-pick dark colors.
- Two components are stateful helpers, not visuals: wrap your app in `<ToastProvider>` only if you
  call `useToast()`; compound overlays (`Modal`, `Drawer`, `CommandPalette`, `ConfirmDialog`)
  render their open state when mounted and take an `onClose`/`onCancel` you control.

## The styling idiom — token-backed Tailwind utilities (use these, not hex)

Color utilities resolve to CSS tokens, so they re-skin and dark-mode for free. Real families:

| Purpose | Classes |
|---|---|
| Surfaces / bg | `bg-bg` `bg-surface` `bg-surface-2` `bg-accent-soft` `bg-pos-soft` `bg-neg-soft` `bg-warn-soft` `bg-intel-soft` |
| Text | `text-ink` `text-muted` `text-faint` `text-accent` `text-pos` `text-neg` `text-warn` `text-intel` |
| Borders | `border-line` `border-l-accent` `border-l-pos` `border-l-neg` `border-l-warn` |
| Accent fills | `bg-accent` + `text-accent-fg` |

Three helper classes carry the typography system — prefer them over ad-hoc font styling:
- `.num` — tabular/monospace figures (JetBrains Mono), for metrics, currency, table numbers.
- `.micro` — small uppercase muted label (section eyebrows, table headers).
- `.display` — display font (Space Grotesk) for headings/big numbers.

Radius is deliberately tight (`--radius` = 2px). Use `rounded-[2px]` / `rounded` to match.
**Never introduce raw colors** (`#hex`, `rgb()`, named Tailwind colors like `bg-blue-500`,
`bg-black/40`) — they break the swappable-theme boundary. Reach for a token utility, or
`var(--token)` (e.g. `style={{ borderColor: 'var(--line)' }}`) when no utility fits.

## Where the truth lives

- `styles.css` (and its `@import` of `_ds_bundle.css`) holds every token (`:root` + `.dark`) and
  every utility — read it before styling to see exact token names.
- Each component ships `<Name>.d.ts` (its real props) and `<Name>.prompt.md` (purpose, when-to-use,
  key props, and a copy-paste example). Read those before composing a component.

## One idiomatic example

```tsx
import { Card, KpiCard, StatusBadge, Button } from 'parts-bin'

function AccountSummary() {
  return (
    <Card title="Revenue overview" actions={<Button variant="primary">Export</Button>}>
      {/* layout glue uses token utilities + helper classes — no raw colors */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Total MRR" value="$248.4k" delta={4.2} spark={[62,64,67,70,74,82]} />
        <div className="rounded-[2px] border border-line bg-surface p-3">
          <div className="micro">Status</div>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge status="Active" tone="pos" />
            <span className="num text-ink">$1,840/mo</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
```
