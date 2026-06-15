import { describe, expect, test } from 'vitest'
import { buildAssistantDashboardEvidence, buildRevenueMovementEvidence } from './dashboardEvidence'
import type { MovementPoint } from '../../data/types'

const rows: MovementPoint[] = [
  { month: 'Jan', New: 2, Expansion: 1, Churn: -4 },
  { month: 'Feb', New: 5, Expansion: 2, Churn: -1 },
  { month: 'Mar', New: 1.5, Expansion: 1.5, Churn: -0.5 },
]

describe('dashboard evidence', () => {
  test('builds revenue movement totals and standout months', () => {
    const evidence = buildRevenueMovementEvidence(rows, {
      sourceTitle: 'Revenue movement ($k)',
      timePeriodLabel: 'Last 90 days',
      barWidth: 22,
      labelsVisible: false,
    })

    expect(evidence.rowCount).toBe(3)
    expect(evidence.totalNew).toBe(8.5)
    expect(evidence.totalExpansion).toBe(4.5)
    expect(evidence.totalChurnLoss).toBe(5.5)
    expect(evidence.totalNet).toBe(7.5)
    expect(evidence.latestMonth?.month).toBe('Mar')
    expect(evidence.strongestNetMonth?.month).toBe('Feb')
    expect(evidence.weakestNetMonth?.month).toBe('Jan')
    expect(evidence.largestChurnLossMonth?.month).toBe('Jan')
    expect(evidence.barWidth).toBe(22)
    expect(evidence.labelsVisible).toBe(false)
  })

  test('falls back cleanly for empty revenue movement data', () => {
    const evidence = buildRevenueMovementEvidence([], {
      sourceTitle: 'Revenue movement ($k)',
      timePeriodLabel: 'Last 30 days',
      barWidth: 18,
      labelsVisible: true,
    })

    expect(evidence.rowCount).toBe(0)
    expect(evidence.totalNew).toBe(0)
    expect(evidence.totalExpansion).toBe(0)
    expect(evidence.totalChurnLoss).toBe(0)
    expect(evidence.totalNet).toBe(0)
    expect(evidence.latestMonth).toBeUndefined()
    expect(evidence.strongestNetMonth).toBeUndefined()
    expect(evidence.weakestNetMonth).toBeUndefined()
    expect(evidence.largestChurnLossMonth).toBeUndefined()
  })

  test('wraps revenue movement evidence for the assistant context', () => {
    const dashboardEvidence = buildAssistantDashboardEvidence({
      revenueMovementData: rows,
      sourceTitle: 'Revenue movement ($k)',
      timePeriodLabel: 'Last 12 months',
      barWidth: 34,
      labelsVisible: true,
    })

    expect(dashboardEvidence.revenueMovement.timePeriodLabel).toBe('Last 12 months')
    expect(dashboardEvidence.revenueMovement.labelsVisible).toBe(true)
    expect(dashboardEvidence.revenueMovement.barWidth).toBe(34)
  })
})
