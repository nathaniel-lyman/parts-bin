import { Tooltip } from 'recharts'
import { isValidElement, type ReactElement, type ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { MrrTrendChart } from './MrrTrendChart'

// Recharts tooltips don't render in jsdom (ResponsiveContainer measures 0x0),
// so pin the formatter contract on the element tree instead.
function findTooltip(node: ReactNode): ReactElement<{ formatter?: (v: unknown) => unknown }> | null {
  if (!isValidElement(node)) return null
  if (node.type === Tooltip) return node as ReactElement<{ formatter?: (v: unknown) => unknown }>
  const children = (node.props as { children?: ReactNode }).children
  for (const child of Array.isArray(children) ? children : [children]) {
    const found = findTooltip(child)
    if (found) return found
  }
  return null
}

describe('MrrTrendChart', () => {
  it('formats tooltip values as currency like the donut chart', () => {
    const tooltip = findTooltip(MrrTrendChart())
    expect(tooltip).not.toBeNull()
    expect(tooltip!.props.formatter?.(42000)).toBe('$42,000')
  })
})
