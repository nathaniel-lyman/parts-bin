---
category: Data Display
---

Disclosure list of collapsible sections; single-open by default.

**When to use:** Stacked sections the user expands one at a time (settings groups, FAQs).

**Key props:** `items`, `multiple`, `defaultOpenIds`, `className`

**vs Tabs:** Use Tabs for equally-ranked views the user switches between, not progressive disclosure.

**Example:**
```tsx
<Accordion items={[{ id: 'general', title: 'General', content: body }]} defaultOpenIds={['general']} />
```
