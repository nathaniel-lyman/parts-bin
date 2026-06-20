import { RadioGroup } from 'parts-bin'

const planOptions = [
  { value: 'starter', label: 'Starter', description: 'Core workflow screens and local state.' },
  { value: 'pro', label: 'Pro', description: 'Saved views, export, and server-mode data.' },
  { value: 'enterprise', label: 'Enterprise', description: 'SSO, audit log, and priority support.' },
]

export function WithDescriptions() {
  return (
    <div style={{ width: 340 }}>
      <RadioGroup label="Plan" options={planOptions} value="pro" onValueChange={() => {}} />
    </div>
  )
}

export function Horizontal() {
  return (
    <div style={{ width: 340 }}>
      <RadioGroup
        label="Billing cycle"
        orientation="horizontal"
        options={[
          { value: 'monthly', label: 'Monthly' },
          { value: 'annual', label: 'Annual' },
        ]}
        value="annual"
        onValueChange={() => {}}
      />
    </div>
  )
}

export function WithError() {
  return (
    <div style={{ width: 340 }}>
      <RadioGroup
        label="Plan"
        error="Select a plan to continue."
        options={[
          { value: 'starter', label: 'Starter' },
          { value: 'pro', label: 'Pro' },
        ]}
        onValueChange={() => {}}
      />
    </div>
  )
}
