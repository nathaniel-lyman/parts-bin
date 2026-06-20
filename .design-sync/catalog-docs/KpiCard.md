---
category: Data Display
---

Headline KPI tile: label, value, delta, and an inline sparkline.

**When to use:** A top-level metric tile for dashboards, reports, or operational summaries.

**Key props:** `label`, `value`, `delta`, `spark`, `negSpark`

**vs Metric:** Use Metric for a compact inline stat without a sparkline.

**Example:**
```tsx
<KpiCard label="Total value" value="$78.3k" delta={4.2} spark={series} />
```
