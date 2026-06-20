import { Switch } from 'parts-bin'

export function WithLabelAndHint() {
  return (
    <div style={{ width: 280 }}>
      <Switch
        checked
        onChange={() => {}}
        label="Server mode"
        hint="Use for binary system settings."
      />
    </div>
  )
}

export function States() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 280 }}>
      <Switch checked onChange={() => {}} label="Dark mode" />
      <Switch checked={false} onChange={() => {}} label="Compact rows" />
      <Switch checked disabled onChange={() => {}} label="Audit logging (locked)" />
    </div>
  )
}
