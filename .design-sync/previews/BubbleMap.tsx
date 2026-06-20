import { BubbleMap } from 'parts-bin'

export function AccountsByCity() {
  return (
    <div style={{ width: 720 }}>
      <BubbleMap valueLabel="accounts" ariaLabel="Accounts by US city" />
    </div>
  )
}

export function SanFranciscoSelected() {
  return (
    <div style={{ width: 720 }}>
      <BubbleMap
        selectedPointId="san-francisco"
        valueLabel="accounts"
        ariaLabel="Accounts by US city, San Francisco selected"
      />
    </div>
  )
}
