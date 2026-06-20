import { ContextMenu } from 'parts-bin'

// ContextMenu's open state is internal (right-click), not settable via props.
// The correct static render is the wrapped target (closed).
export function Trigger() {
  return (
    <div style={{ padding: 24 }}>
      <ContextMenu
        items={[
          { id: 'open', label: 'Open account' },
          { id: 'rename', label: 'Rename' },
          { id: 'duplicate', label: 'Duplicate row' },
          { id: 'remove', label: 'Remove from view', destructive: true },
        ]}
      >
        <div className="rounded-[2px] border border-line bg-surface px-3 py-2 text-[13px] text-ink">
          Northwind Logistics · $1,840 MRR
          <div className="text-[12px] text-muted">Right-click for row actions</div>
        </div>
      </ContextMenu>
    </div>
  )
}
