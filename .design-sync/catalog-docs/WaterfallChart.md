---
category: Charts
---

Waterfall chart of cumulative start → increases/decreases → total.

**When to use:** Explaining how any total is built up from sequential deltas; pass sample or real step data.

**Key props:** `data`, `showLabels`, `height`, `barWidth`, `valueFormatter`

**Example:**
```tsx
<WaterfallChart data={bridgeSteps} showLabels valueFormatter={formatValue} />
```
