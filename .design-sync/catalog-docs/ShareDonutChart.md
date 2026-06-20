---
category: Charts
---

Donut chart for generic share-of-total rows with the shared chart legend.

**When to use:** Showing how any total splits across categories; pass rows shaped as { id, label, value }.

**Key props:** `data`, `totalLabel`, `valueFormatter`

**Example:**
```tsx
<ShareDonutChart data={shareRows} totalLabel="Total" valueFormatter={formatValue} />
```
