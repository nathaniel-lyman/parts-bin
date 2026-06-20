---
category: Forms
---

Progress indicator showing ordered steps and their states.

**When to use:** Visualizing where the user is in a multi-step flow.

**Key props:** `steps`, `currentStepId`, `onStepSelect`, `orientation`

**vs WizardLayout:** Use WizardLayout for the full wizard scaffold (header, body, nav buttons).

**Example:**
```tsx
<Stepper steps={steps} currentStepId="details" onStepSelect={goTo} />
```
