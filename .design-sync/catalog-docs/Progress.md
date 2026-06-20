---
category: Feedback
---

Determinate progress bar with tone variants, label, and value readout.

**When to use:** Quotas, capacity meters, and completion percentages.

**Key props:** `value`, `max`, `tone`, `label`, `showValue`, `className`

**vs ImportProgress:** Use ImportProgress for a running import/upload with a detail line.

**vs Spinner:** Use Spinner when progress is indeterminate.

**Example:**
```tsx
<Progress value={62} label="Storage" showValue tone="warn" />
```
