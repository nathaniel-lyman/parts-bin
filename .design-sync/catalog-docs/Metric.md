---
category: Data Display
---

Compact label/value/delta stat with status-toned coloring.

**When to use:** A small inline stat where a full KpiCard would be too heavy.

**Key props:** `label`, `value`, `delta`, `status`

**vs KpiCard:** Use KpiCard for a top-level KPI tile with a sparkline.

**Example:**
```tsx
<Metric label="Error rate" value="2.1%" delta="-0.3" status="positive" />
```
