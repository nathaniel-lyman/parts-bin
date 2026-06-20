---
category: Charts
---

Reusable chart frame: title, caveat/description, headline metric, actions, and chart body.

**When to use:** Wrapping any chart in the standard chart panel; use either an example label in demos or an insight claim in product dashboards.

**Key props:** `title`, `description`, `metric`, `actions`, `children`

**Example:**
```tsx
<ChartCard title="Line chart example" metric="+18%" description="Sample rows; replace with your data."><LineTrendChart showEndLabels /></ChartCard>
```
