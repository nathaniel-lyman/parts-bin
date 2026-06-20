---
category: Shell & Layout
---

Bar holding filter controls with a trailing actions slot.

**When to use:** A dedicated row of filter inputs above a list or grid.

**Key props:** `children`, `actions`

**Example:**
```tsx
<FilterBar actions={<Button>Reset</Button>}><FacetedFilter {...facet} /></FilterBar>
```
