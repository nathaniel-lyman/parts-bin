---
category: Forms
---

Accent-themed range input with optional label and live value readout.

**When to use:** Picking an approximate numeric value where the gesture matters more than precision (thresholds, weights, percentages).

**Key props:** `value`, `defaultValue`, `onValueChange`, `min`, `max`, `step`, `label`, `showValue`, `formatValue`, `disabled`

**vs Input:** Use Input type="number" when the exact value matters and must be typed.

**Example:**
```tsx
<Slider label="Review threshold" min={0} max={100} defaultValue={60} showValue formatValue={(v) => v + '%'} onValueChange={setThreshold} />
```
