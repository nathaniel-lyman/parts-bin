---
category: Overlays
---

Modal preset for a destructive/confirm decision with cancel and confirm.

**When to use:** Confirming a single irreversible action like delete.

**Key props:** `title`, `message`, `confirmLabel`, `onCancel`, `onConfirm`

**vs Modal:** Use Modal directly for non-confirm dialogs or richer content.

**Example:**
```tsx
<ConfirmDialog title="Delete project?" message="This cannot be undone." onCancel={close} onConfirm={del} />
```
