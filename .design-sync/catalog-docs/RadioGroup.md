---
category: Forms
---

Single-choice group of radio options with label and orientation.

**When to use:** Picking exactly one from a small, visible set of mutually exclusive options.

**Key props:** `options`, `value`, `onValueChange`, `label`, `orientation`

**Example:**
```tsx
<RadioGroup label="Plan" options={opts} value={v} onValueChange={setV} />
```
