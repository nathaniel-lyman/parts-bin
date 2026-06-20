---
category: Shell & Layout
---

Primary left navigation with brand lockup, nav items, and footer.

**When to use:** The app-level navigation rail inside AppShell.

**Key props:** `brand`, `items`, `footer`

**Example:**
```tsx
<Sidebar brand={<Logo />} items={[{ label: 'Projects', href: '/projects', active: true }]} />
```
