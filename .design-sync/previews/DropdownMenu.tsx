import { DropdownMenu } from 'parts-bin'

// DropdownMenu's open state is internal (click to toggle), not settable via
// props. The correct static render is the closed trigger.
export function Trigger() {
  return (
    <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
      <DropdownMenu
        label="Account actions"
        items={[
          { id: 'view', label: 'View details', description: 'Open the account drawer' },
          { id: 'edit', label: 'Edit plan' },
          { id: 'export', label: 'Export to CSV' },
          { id: 'delete', label: 'Delete account', destructive: true },
        ]}
      />
    </div>
  )
}
