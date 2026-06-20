---
category: Chat
---

Token-styled markdown renderer (GFM tables, lists, links, fenced code via CodeBlock).

**When to use:** Rendering LLM output anywhere; re-skins with the theme tokens.

**Key props:** `content`

**vs CodeBlock:** Use CodeBlock directly only for standalone code; ChatMarkdown routes fenced blocks to it.

**Example:**
```tsx
<ChatMarkdown content={assistantText} />
```
