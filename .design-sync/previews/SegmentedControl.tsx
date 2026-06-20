import { SegmentedControl } from 'parts-bin'

const densityOptions = [
  { value: 'compact', label: 'Compact' },
  { value: 'standard', label: 'Standard' },
  { value: 'comfortable', label: 'Comfortable' },
]

export function Default() {
  return (
    <div style={{ width: 340 }}>
      <SegmentedControl
        label="Row density"
        options={densityOptions}
        value="standard"
        onValueChange={() => {}}
      />
    </div>
  )
}

export function Compact() {
  return (
    <div style={{ width: 280 }}>
      <SegmentedControl
        size="compact"
        options={[
          { value: 'list', label: 'List' },
          { value: 'board', label: 'Board' },
          { value: 'calendar', label: 'Calendar' },
        ]}
        value="board"
        onValueChange={() => {}}
      />
    </div>
  )
}

export function TwoOptions() {
  return (
    <div style={{ width: 240 }}>
      <SegmentedControl
        options={[
          { value: 'active', label: 'Active' },
          { value: 'archived', label: 'Archived' },
        ]}
        value="active"
        onValueChange={() => {}}
      />
    </div>
  )
}
