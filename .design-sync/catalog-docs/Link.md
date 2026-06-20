---
category: Primitives
---

Token-styled anchor with accent/muted variants and an external-link preset.

**When to use:** Navigation rendered as text — inline references, "view all" links, footer links.

**Key props:** `href`, `variant`, `external`, `children`, `className`

**vs Button:** Use Button (or variant="ghost") for actions that change state; Link is for navigation.

**Example:**
```tsx
<Link href="/docs" variant="muted">Component docs</Link>
```
