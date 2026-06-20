import { DateRangePicker } from 'parts-bin'

const noop = () => {}

export function Default() {
  return (
    <div style={{ width: 320 }}>
      <DateRangePicker
        label="Reporting period"
        value={{ start: '2026-06-01', end: '2026-06-30' }}
        onValueChange={noop}
      />
    </div>
  )
}

export function WithPresets() {
  return (
    <div style={{ width: 320 }}>
      <DateRangePicker
        label="Date range"
        value={{ start: '2026-04-01', end: '2026-06-30' }}
        onValueChange={noop}
        presets={[
          { id: 'june', label: 'June 2026', range: { start: '2026-06-01', end: '2026-06-30' } },
          { id: 'q2', label: 'Q2 2026', range: { start: '2026-04-01', end: '2026-06-30' } },
        ]}
      />
    </div>
  )
}

export function Empty() {
  return (
    <div style={{ width: 320 }}>
      <DateRangePicker
        label="Custom range"
        value={{ start: '', end: '' }}
        onValueChange={noop}
        emptyLabel="Select dates"
      />
    </div>
  )
}
