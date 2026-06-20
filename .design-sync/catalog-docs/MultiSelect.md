---
category: Forms
---

Multi-value combobox with token chips, type-to-filter, and toggle-to-deselect.

**When to use:** Picking several values from a list (tags, owners, segments) in a form.

**Key props:** `options`, `values`, `defaultValues`, `onValuesChange`, `placeholder`, `disabled`

**vs Combobox:** Use Combobox when exactly one value can be selected.

**vs FacetedFilter:** Use FacetedFilter for filtering a dataset, not capturing a form value.

**Example:**
```tsx
<MultiSelect options={opts} values={vals} onValuesChange={setVals} placeholder="Segments" />
```
