import { Stepper } from 'parts-bin'

const noop = () => {}

const importSteps = [
  { id: 'upload', label: 'Upload CSV', state: 'complete' as const },
  { id: 'map', label: 'Map columns', state: 'current' as const },
  { id: 'review', label: 'Review', state: 'upcoming' as const },
  { id: 'done', label: 'Finish', state: 'upcoming' as const },
]

export function Horizontal() {
  return (
    <div style={{ width: 460 }}>
      <Stepper steps={importSteps} currentStepId="map" onStepSelect={noop} />
    </div>
  )
}

export function Vertical() {
  return (
    <div style={{ width: 320 }}>
      <Stepper
        steps={[
          { id: 'account', label: 'Account', description: 'Workspace details', state: 'complete' },
          { id: 'team', label: 'Invite team', description: 'Add members', state: 'current' },
          { id: 'billing', label: 'Billing', description: 'Choose a plan', state: 'upcoming' },
        ]}
        currentStepId="team"
        orientation="vertical"
        onStepSelect={noop}
      />
    </div>
  )
}

export function WithError() {
  return (
    <div style={{ width: 460 }}>
      <Stepper
        steps={[
          { id: 'upload', label: 'Upload CSV', state: 'complete' },
          { id: 'map', label: 'Map columns', state: 'error' },
          { id: 'review', label: 'Review', state: 'upcoming' },
        ]}
        currentStepId="map"
        onStepSelect={noop}
      />
    </div>
  )
}
