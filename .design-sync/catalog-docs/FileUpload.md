---
category: Forms
---

Dropzone plus a rendered list of the currently selected files.

**When to use:** Uploading files and showing what has been picked so far.

**Key props:** `files`, `onFilesSelected`, `accept`, `multiple`, `label`

**vs Dropzone:** Use Dropzone alone when you render the file list yourself.

**Example:**
```tsx
<FileUpload files={files} onFilesSelected={setFiles} multiple />
```
