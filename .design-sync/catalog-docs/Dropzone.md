---
category: Forms
---

Drag-and-drop / click file selection target firing onFilesSelected.

**When to use:** Accepting file uploads without needing to render the picked files.

**Key props:** `onFilesSelected`, `accept`, `multiple`, `label`, `description`

**vs FileUpload:** Use FileUpload to also show the selected files list.

**Example:**
```tsx
<Dropzone multiple onFilesSelected={(files) => add(files)} />
```
