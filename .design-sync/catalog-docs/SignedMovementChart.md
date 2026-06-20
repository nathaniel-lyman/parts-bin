---
category: Charts
---

Stacked movement bars for positive and negative contribution categories.

**When to use:** Any signed movement breakdown that fits the { month, New, Expansion, Churn } compatibility row shape; pass `data` for your own rows. Use the Churn key as the negative bucket label required by the compatibility wrapper.

**Key props:** `data`, `barWidth`, `showLabels`

**Example:**
```tsx
<SignedMovementChart data={movementRows} barWidth={28} showLabels />
```
