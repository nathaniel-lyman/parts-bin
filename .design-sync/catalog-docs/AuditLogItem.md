---
category: Data Display
---

Single audit-log row: an activity event annotated with a resource.

**When to use:** Rendering one entry of an audit/change log.

**Key props:** `resource`, `meta`, `title`, `timestamp`, `actor`

**Example:**
```tsx
<AuditLogItem id="e1" title="Updated priority" resource="Project Alpha" actor="Avery" timestamp="2m ago" />
```
