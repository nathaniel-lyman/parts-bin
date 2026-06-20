---
category: Charts
---

Multi-series line chart themed from the SERIES palette; sample trend data by default.

**When to use:** Any value-over-time lines — pass `data` rows and the `series` keys to plot.

**Key props:** `data`, `series`, `xKey`, `showEndLabels`

**Example:**
```tsx
<LineTrendChart data={rows} series={['Plan A', 'Plan B']} xKey="period" showEndLabels />
```
