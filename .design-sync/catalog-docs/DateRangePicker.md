---
category: Forms
---

Start/end date range input with optional quick presets.

**When to use:** Selecting a date span, e.g. a reporting window.

**Key props:** `label`, `value`, `onValueChange`, `presets`, `emptyLabel`

**vs DatePicker:** Use DatePicker when only a single date is needed.

**Example:**
```tsx
<DateRangePicker label="Period" value={range} onValueChange={setRange} presets={presets} />
```
