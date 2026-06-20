---
category: Forms
---

Single-date input with a labelled native date control.

**When to use:** Capturing one date value.

**Key props:** `label`, `value`, `onValueChange`, `id`, `disabled`

**vs DateRangePicker:** Use DateRangePicker when the user needs a start/end span.

**Example:**
```tsx
<DatePicker label="Renews" value={d} onValueChange={setD} />
```
