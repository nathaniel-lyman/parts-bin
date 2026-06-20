import { Checkbox } from 'parts-bin'

export function WithLabelAndHint() {
  return (
    <div style={{ width: 280 }}>
      <Checkbox
        checked
        onChange={() => {}}
        label="Include archived rows"
        hint="Good for reporting screens."
      />
    </div>
  )
}

export function States() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 280 }}>
      <Checkbox checked onChange={() => {}} label="Email me on renewal" />
      <Checkbox checked={false} onChange={() => {}} label="Email me on churn" />
      <Checkbox checked disabled onChange={() => {}} label="Notify account owner" />
    </div>
  )
}
