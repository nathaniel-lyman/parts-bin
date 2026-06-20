import { Combobox } from 'parts-bin'

const ownerOptions = [
  { value: 'avery', label: 'Avery Cohen' },
  { value: 'blair', label: 'Blair Nakamura' },
  { value: 'devin', label: 'Devin Okafor' },
  { value: 'rowan', label: 'Rowan Mitchell' },
  { value: 'sasha', label: 'Sasha Delgado' },
]

export function Selected() {
  return (
    <div style={{ width: 280 }}>
      <Combobox
        options={ownerOptions}
        value="avery"
        onValueChange={() => {}}
        placeholder="Search owners…"
      />
    </div>
  )
}

export function Empty() {
  return (
    <div style={{ width: 280 }}>
      <Combobox
        options={ownerOptions}
        value=""
        onValueChange={() => {}}
        placeholder="Search owners…"
      />
    </div>
  )
}

export function Disabled() {
  return (
    <div style={{ width: 280 }}>
      <Combobox
        options={ownerOptions}
        value="blair"
        onValueChange={() => {}}
        placeholder="Search owners…"
        disabled
      />
    </div>
  )
}
