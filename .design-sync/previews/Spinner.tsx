import { Spinner } from 'parts-bin'

export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
      <Spinner size="sm" label="Loading" />
      <Spinner size="default" label="Loading" />
      <Spinner size="lg" label="Loading" />
    </div>
  )
}

export function WithLabel() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <Spinner size="default" label="Refreshing accounts" />
      <span style={{ font: '13px/1.2 system-ui, sans-serif' }}>Refreshing accounts…</span>
    </div>
  )
}
