---
category: Maps
---

Interactive region drilldown with title/description and selection state.

**When to use:** Letting the user select a region and inspect its detail.

**Key props:** `regions`, `initialRegionId`, `onRegionChange`, `title`, `description`

**Example:**
```tsx
<GeoDrilldown regions={regions} initialRegionId="ca" onRegionChange={onChange} />
```
