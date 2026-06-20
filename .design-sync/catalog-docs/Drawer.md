---
category: Overlays
---

Edge-anchored sliding panel with title, body, and footer.

**When to use:** A contextual task or detail view that should keep the page in sight. bodyClassName REPLACES (not merges with) the default body padding/scroll classes — for full-bleed layouts like AssistantPanel.

**Key props:** `title`, `onClose`, `children`, `footer`, `side`, `bodyClassName`

**vs Modal:** Use Modal for a centered, fully blocking confirm/decision.

**Example:**
```tsx
<Drawer title="Filters" side="right" onClose={close}>{body}</Drawer>
```
