---
category: Forms
---

Full multi-step wizard scaffold: embedded Stepper, title, body, back/next nav.

**When to use:** Building a guided multi-step task end to end.

**Key props:** `steps`, `currentStepId`, `title`, `children`, `onNext`, `onBack`

**vs Stepper:** Use Stepper alone when you only need the progress indicator.

**Example:**
```tsx
<WizardLayout steps={steps} currentStepId="info" title="Setup" onNext={next} onBack={back}>{body}</WizardLayout>
```
