---
category: Data Display
---

Header for a detail/record view: title, subtitle, status, meta, actions.

**When to use:** Top of a single-record detail page or drawer.

**Key props:** `title`, `subtitle`, `meta`, `status`, `actions`

**Example:**
```tsx
<DetailHeader title="Acme Corp" subtitle="Enterprise" status={<StatusBadge status="Active" tone="pos" />} />
```
