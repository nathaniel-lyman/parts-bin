---
category: Overlays
---

Click-triggered floating panel anchored to its trigger element.

**When to use:** Lightweight transient content (a form, picker, or info) tied to a control.

**Key props:** `trigger`, `children`, `align`, `className`

**Example:**
```tsx
<Popover trigger={<Button>Options</Button>}>{panel}</Popover>
```
