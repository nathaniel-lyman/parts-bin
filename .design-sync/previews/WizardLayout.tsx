import { WizardLayout, Field, Input } from 'parts-bin'

const noop = () => {}

const wizardSteps = [
  { id: 'upload', label: 'Upload CSV', state: 'complete' as const },
  { id: 'map', label: 'Map columns', state: 'current' as const },
  { id: 'review', label: 'Review', state: 'upcoming' as const },
]

export function Default() {
  return (
    <div style={{ width: 560 }}>
      <WizardLayout
        steps={wizardSteps}
        currentStepId="map"
        title="Map columns"
        description="Match each CSV column to a field in your workspace."
        onStepSelect={noop}
        onBack={noop}
        onNext={noop}
      >
        <div style={{ display: 'grid', gap: 16 }}>
          <Field label="Account name" hint="Maps to column A">
            <Input defaultValue="company_name" readOnly />
          </Field>
          <Field label="MRR" hint="Maps to column D">
            <Input defaultValue="monthly_revenue" readOnly />
          </Field>
        </div>
      </WizardLayout>
    </div>
  )
}

export function FirstStep() {
  return (
    <div style={{ width: 560 }}>
      <WizardLayout
        steps={wizardSteps}
        currentStepId="upload"
        title="Upload CSV"
        description="Drop your export file to begin the import."
        backLabel="Cancel"
        nextLabel="Continue"
        onStepSelect={noop}
        onBack={noop}
        onNext={noop}
      >
        <Field label="Source file">
          <Input defaultValue="records-import.csv" readOnly />
        </Field>
      </WizardLayout>
    </div>
  )
}

export function FinalStep() {
  return (
    <div style={{ width: 560 }}>
      <WizardLayout
        steps={[
          { id: 'upload', label: 'Upload CSV', state: 'complete' },
          { id: 'map', label: 'Map columns', state: 'complete' },
          { id: 'review', label: 'Review', state: 'current' },
        ]}
        currentStepId="review"
        title="Review import"
        description="124 rows ready to import. This cannot be undone."
        nextLabel="Import 124 rows"
        onStepSelect={noop}
        onBack={noop}
        onNext={noop}
      >
        <Field label="Destination">
          <Input defaultValue="Accounts" readOnly />
        </Field>
      </WizardLayout>
    </div>
  )
}
