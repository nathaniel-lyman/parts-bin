import { Tooltip, Button } from 'parts-bin'

// Tooltip's open state is internal (hover/focus), not settable via props.
// The correct static render is the trigger it wraps.
export function Trigger() {
  return (
    <div style={{ padding: 32, display: 'flex', justifyContent: 'center' }}>
      <Tooltip content="MRR excludes churned accounts">
        <Button variant="secondary">Net MRR</Button>
      </Tooltip>
    </div>
  )
}
