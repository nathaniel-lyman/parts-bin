import { Toolbar, Button, Input } from 'parts-bin'

export function AccountActions() {
  return (
    <div style={{ width: 520 }}>
      <Toolbar
        leading={<Input placeholder="Search accounts…" readOnly />}
        trailing={
          <>
            <Button size="compact" variant="secondary">Export</Button>
            <Button size="compact" variant="primary">New account</Button>
          </>
        }
      />
    </div>
  )
}

export function WithSelection() {
  return (
    <div style={{ width: 520 }}>
      <Toolbar
        leading={<span className="text-[13px] font-medium text-ink">3 selected</span>}
        trailing={
          <>
            <Button size="compact" variant="ghost">Assign owner</Button>
            <Button size="compact" variant="destructive">Delete</Button>
          </>
        }
      />
    </div>
  )
}
