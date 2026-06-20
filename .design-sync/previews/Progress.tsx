import { Progress } from 'parts-bin'

export function Tones() {
  return (
    <div style={{ display: 'grid', gap: 16, width: 320 }}>
      <Progress value={72} label="Storage used" showValue tone="accent" />
      <Progress value={100} label="Onboarding complete" showValue tone="pos" />
      <Progress value={88} label="Seats filled" showValue tone="warn" />
      <Progress value={34} label="Renewal at risk" showValue tone="neg" />
    </div>
  )
}

export function SingleBar() {
  return (
    <div style={{ width: 320 }}>
      <Progress value={62} max={100} label="Importing accounts" showValue />
    </div>
  )
}
