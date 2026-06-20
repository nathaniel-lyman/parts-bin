---
category: Data Display
---

Titled card wrapping a label/value list with an optional footer.

**When to use:** Presenting record metadata as a self-contained titled panel.

**Key props:** `title`, `items`, `footer`, `className`

**vs KeyValueList:** Use KeyValueList for a bare single-column list without a card.

**vs DescriptionList:** Use DescriptionList for a bare multi-column grid without a card.

**vs PropertyGrid:** Use PropertyGrid for a bare dense 3-column grid without a card.

**Example:**
```tsx
<MetadataPanel title="Metadata" items={fields} />
```
