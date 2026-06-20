import { SignedMovementChart } from 'parts-bin'

// Defaults to the built-in monthly movement series (New/Expansion positive, Churn negative).
export function Default() {
  return (
    <div style={{ width: 460, height: 260 }}>
      <SignedMovementChart />
    </div>
  )
}

const quarterlyMovement = [
  { month: 'Q1', New: 12.4, Expansion: 6.1, Churn: -3.2 },
  { month: 'Q2', New: 14.0, Expansion: 5.4, Churn: -2.1 },
  { month: 'Q3', New: 11.3, Expansion: 7.2, Churn: -4.0 },
  { month: 'Q4', New: 16.8, Expansion: 8.0, Churn: -1.9 },
]

export function WithLabels() {
  return (
    <div style={{ width: 460, height: 260 }}>
      <SignedMovementChart data={quarterlyMovement} showLabels />
    </div>
  )
}
