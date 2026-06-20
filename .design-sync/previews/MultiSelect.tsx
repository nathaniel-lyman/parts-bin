import { MultiSelect } from 'parts-bin'

const categoryOptions = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'operations', label: 'Operations' },
  { value: 'finance', label: 'Finance' },
]

export function WithSelection() {
  return (
    <div style={{ width: 320 }}>
      <MultiSelect
        options={categoryOptions}
        values={['design', 'operations']}
        onValuesChange={() => {}}
        placeholder="Add categories…"
      />
    </div>
  )
}

export function Empty() {
  return (
    <div style={{ width: 320 }}>
      <MultiSelect
        options={categoryOptions}
        values={[]}
        onValuesChange={() => {}}
        placeholder="Add categories…"
      />
    </div>
  )
}

export function Disabled() {
  return (
    <div style={{ width: 320 }}>
      <MultiSelect
        options={categoryOptions}
        values={['engineering']}
        onValuesChange={() => {}}
        placeholder="Add categories…"
        disabled
      />
    </div>
  )
}
