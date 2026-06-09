import { Line, LineChart, Tooltip } from 'recharts'
import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { monthlySeries } from '../../data/accounts'
import { MrrTrendChart } from './MrrTrendChart'

// Recharts charts don't render in jsdom (ResponsiveContainer measures 0x0),
// so pin the contracts on the element tree instead.
function findAllByType(node: ReactNode, type: unknown): ReactElement[] {
  if (Array.isArray(node)) return node.flatMap((child) => findAllByType(child, type))
  if (!isValidElement(node)) return []
  const matches = node.type === type ? [node] : []
  return [...matches, ...findAllByType((node.props as { children?: ReactNode }).children, type)]
}

describe('MrrTrendChart', () => {
  it('formats tooltip values as currency like the donut chart', () => {
    const tooltip = findAllByType(MrrTrendChart({}), Tooltip)[0] as
      | ReactElement<{ formatter?: (v: unknown) => unknown }>
      | undefined
    expect(tooltip).toBeDefined()
    expect(tooltip!.props.formatter?.(42000)).toBe('$42,000')
  })

  it('defaults to the demo monthlySeries and segment keys', () => {
    const chart = MrrTrendChart({})
    expect((findAllByType(chart, LineChart)[0]!.props as { data?: unknown }).data).toBe(monthlySeries)
    const keys = findAllByType(chart, Line).map((line) => (line.props as { dataKey?: string }).dataKey)
    expect(keys).toEqual(['Enterprise', 'Mid-market', 'Startup'])
  })

  it('plots caller-provided data and series keys', () => {
    const rows = [{ month: 'Jan', Alpha: 10, Beta: 20 }]
    const chart = MrrTrendChart({ data: rows, series: ['Alpha', 'Beta'] })
    expect((findAllByType(chart, LineChart)[0]!.props as { data?: unknown }).data).toBe(rows)
    const keys = findAllByType(chart, Line).map((line) => (line.props as { dataKey?: string }).dataKey)
    expect(keys).toEqual(['Alpha', 'Beta'])
  })
})
