import { DatePicker } from 'parts-bin'

const noop = () => {}

export function Default() {
  return (
    <div style={{ width: 280 }}>
      <DatePicker label="Renews on" value="2026-06-09" onValueChange={noop} />
    </div>
  )
}

export function Empty() {
  return (
    <div style={{ width: 280 }}>
      <DatePicker label="Cancellation date" value="" onValueChange={noop} />
    </div>
  )
}

export function Stacked() {
  return (
    <div style={{ display: 'grid', gap: 16, width: 280 }}>
      <DatePicker label="Trial starts" value="2026-06-01" onValueChange={noop} />
      <DatePicker label="Trial ends" value="2026-06-15" onValueChange={noop} />
    </div>
  )
}
