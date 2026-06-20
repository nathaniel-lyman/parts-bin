---
category: Shell & Layout
---

Top-level layout frame composing a sidebar, top nav, and content.

**When to use:** The outermost application chrome around routed pages.

**Key props:** `sidebar`, `topNav`, `children`

**Example:**
```tsx
<AppShell sidebar={<Sidebar brand={brand} items={nav} />} topNav={<TopNav title="Projects" />}>{page}</AppShell>
```
