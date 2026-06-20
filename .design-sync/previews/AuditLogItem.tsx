import { AuditLogItem } from 'parts-bin'

export function LogEntries() {
  return (
    <div style={{ width: 460, border: '1px solid var(--line)', background: 'var(--surface)' }}>
      <AuditLogItem
        id="a1"
        title="Changed plan"
        resource="Northwind Traders"
        description="Pro → Enterprise"
        actor="Avery Chen"
        timestamp="2m ago"
        tone="accent"
      />
      <AuditLogItem
        id="a2"
        title="Deleted saved view"
        resource="Accounts grid"
        description="Removed “At-risk renewals”"
        actor="Marcus Webb"
        timestamp="1h ago"
        tone="negative"
      />
      <AuditLogItem
        id="a3"
        title="Invited member"
        resource="Workspace"
        description="priya.nair@northwind.com (Editor)"
        actor="System"
        timestamp="Yesterday"
      />
    </div>
  )
}

export function SingleEntry() {
  return (
    <div style={{ width: 460, border: '1px solid var(--line)', background: 'var(--surface)' }}>
      <AuditLogItem
        id="a1"
        title="Exported report"
        resource="Q1 MRR summary"
        description="Downloaded as CSV (1,204 rows)"
        actor="Diego Santos"
        timestamp="Mar 14, 09:41"
        tone="positive"
      />
    </div>
  )
}
