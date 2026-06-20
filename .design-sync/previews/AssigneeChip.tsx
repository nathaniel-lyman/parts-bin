import { AssigneeChip } from 'parts-bin'

export function Default() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, width: 360 }}>
      <AssigneeChip name="Avery Chen" status="online" />
      <AssigneeChip name="Marcus Webb" status="away" />
    </div>
  )
}

export function WithMeta() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, width: 360 }}>
      <AssigneeChip name="Priya Nair" status="online" meta="Owner" />
      <AssigneeChip name="Diego Santos" meta="Reviewer" />
    </div>
  )
}

export function Removable() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, width: 360 }}>
      <AssigneeChip name="Lena Brooks" status="busy" meta="AE" onRemove={() => {}} />
      <AssigneeChip name="Tomas Vidal" onRemove={() => {}} />
    </div>
  )
}
