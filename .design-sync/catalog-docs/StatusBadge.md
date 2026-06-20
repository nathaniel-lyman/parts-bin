---
category: Primitives
---

Tone-coded label with a status dot; schema-agnostic (any status string + a tone).

**When to use:** Showing the lifecycle state of a record. Map your domain status → tone at the call site.

**Key props:** `status`, `tone`, `className`

**vs NotificationBadge:** Use NotificationBadge for an unread/overflow count, not a status tone.

**Example:**
```tsx
<StatusBadge status="Active" tone="pos" />
```
