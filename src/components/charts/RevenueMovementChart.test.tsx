import { BarChart } from 'recharts'
import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { movementSeries } from '../../data/accounts'
import { RevenueMovementChart } from './RevenueMovementChart'

// Recharts charts don't render in jsdom (ResponsiveContainer measures 0x0),
// so pin the contracts on the element tree instead.
function findAllByType(node: ReactNode, type: unknown): ReactElement[] {
  if (Array.isArray(node)) return node.flatMap((child) => findAllByType(child, type))
  if (!isValidElement(node)) return []
  const matches = node.type === type ? [node] : []
  return [...matches, ...findAllByType((node.props as { children?: ReactNode }).children, type)]
}

describe('RevenueMovementChart', () => {
  it('defaults to the demo movementSeries', () => {
    const chart = RevenueMovementChart({})
    expect((findAllByType(chart, BarChart)[0]!.props as { data?: unknown }).data).toBe(movementSeries)
  })

  it('plots caller-provided movement data', () => {
    const rows = [{ month: 'Jan', New: 5, Expansion: 2, Churn: -1 }]
    const chart = RevenueMovementChart({ data: rows })
    expect((findAllByType(chart, BarChart)[0]!.props as { data?: unknown }).data).toBe(rows)
  })
})
