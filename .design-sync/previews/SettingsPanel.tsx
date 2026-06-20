import { SettingsPanel, Switch, Button } from 'parts-bin'

// SettingsPanel: a titled settings group whose children are the setting rows.
// Switch carries its own label/hint, so each toggle is a self-describing row.
export function Workspace() {
  return (
    <div style={{ width: 440 }}>
      <SettingsPanel title="Workspace" description="Defaults applied to every account view.">
        <Switch label="Email digests" hint="Weekly MRR summary" />
        <Switch label="Renewal alerts" hint="Notify 30 days before renewal" />
        <Switch label="Compact tables" hint="Denser grid rows" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="ghost" size="compact">Reset</Button>
          <Button variant="primary" size="compact">Save changes</Button>
        </div>
      </SettingsPanel>
    </div>
  )
}

export function Notifications() {
  return (
    <div style={{ width: 440 }}>
      <SettingsPanel title="Notifications" description="Choose what lands in your inbox.">
        <Switch label="At-risk accounts" hint="When health drops to At risk" />
        <Switch label="Expansion signals" hint="Seat or MRR increases" />
        <Switch label="Weekly summary" hint="Monday morning recap" />
      </SettingsPanel>
    </div>
  )
}
