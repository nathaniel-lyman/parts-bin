import { Popover } from 'parts-bin'

// Popover's open state is internal (click to toggle), not settable via props.
// The correct static render is the closed trigger.
export function Trigger() {
  return (
    <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
      <Popover trigger="Filter by segment">
        <div style={{ display: 'grid', gap: 6 }}>
          <span className="micro">Segment</span>
          <div className="text-[13px] text-ink">Enterprise</div>
          <div className="text-[13px] text-ink">Mid-Market</div>
          <div className="text-[13px] text-ink">SMB</div>
        </div>
      </Popover>
    </div>
  )
}
