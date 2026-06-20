import { Slider } from 'parts-bin'

const noop = () => {}

export function Default() {
  return (
    <div style={{ width: 360 }}>
      <Slider
        label="Review threshold"
        min={0}
        max={100}
        defaultValue={60}
        showValue
        formatValue={(v) => `${v}%`}
        onValueChange={noop}
      />
    </div>
  )
}

export function Range() {
  return (
    <div style={{ display: 'grid', gap: 20, width: 360 }}>
      <Slider label="Volume" min={0} max={100} defaultValue={25} showValue onValueChange={noop} />
      <Slider label="Brightness" min={0} max={100} defaultValue={75} showValue onValueChange={noop} />
    </div>
  )
}

export function Stepped() {
  return (
    <div style={{ width: 360 }}>
      <Slider
        label="Sample rate"
        min={0}
        max={10}
        step={1}
        defaultValue={4}
        showValue
        formatValue={(v) => `${v} per hour`}
        onValueChange={noop}
      />
    </div>
  )
}

export function Disabled() {
  return (
    <div style={{ width: 360 }}>
      <Slider label="Locked threshold" min={0} max={100} defaultValue={40} showValue disabled onValueChange={noop} />
    </div>
  )
}
