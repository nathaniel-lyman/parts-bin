---
category: Overlays
---

Centered blocking dialog with title, body, and footer; scrim closes it.

**When to use:** A focused, blocking task or confirmation that interrupts the flow.

**Key props:** `title`, `onClose`, `children`, `footer`

**vs Drawer:** Use Drawer for a side panel that keeps page context visible.

**Example:**
```tsx
<Modal title="Edit" onClose={close} footer={<Button onClick={save}>Save</Button>}>{body}</Modal>
```
