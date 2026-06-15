import { CartesianGrid, LabelList, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { LabelProps } from 'recharts'
import { axisProps, gridProps, legendProps, SERIES, tooltipProps } from '../../theme/chart-theme'
import { monthlySeries } from '../../data/accounts'
import { fmtCurrency } from '../../lib/format'

interface MrrTrendChartProps {
  /**
   * Rows of `{ [xKey]: string, [seriesKey]: number }`; defaults to the demo
   * monthlySeries. Typed loosely (interfaces lack index signatures) — Recharts
   * resolves keys at runtime via dataKey.
   */
  data?: readonly object[]
  /** Line keys to plot, colored from the SERIES palette in order. */
  series?: readonly string[]
  xKey?: string
  showEndLabels?: boolean
}

function renderLineEndLabel(data: readonly object[], seriesKey: string, color: string) {
  return function LineEndLabel(props: LabelProps) {
    const index = typeof props.index === 'number' ? props.index : null
    const x = typeof props.x === 'number' ? props.x : null
    const y = typeof props.y === 'number' ? props.y : null
    if (index !== data.length - 1 || x === null || y === null) return null

    return (
      <text
        x={x + 8}
        y={y}
        fill={color}
        fontFamily="Inter, system-ui, sans-serif"
        fontSize={11}
        fontWeight={700}
        dominantBaseline="central"
        pointerEvents="none"
      >
        {seriesKey}
      </text>
    )
  }
}

export function MrrTrendChart({
  data = monthlySeries,
  series = ['Enterprise', 'Mid-market', 'Startup'],
  xKey = 'month',
  showEndLabels = false,
}: MrrTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data as object[]} margin={{ top: 8, right: showEndLabels ? 92 : 8, bottom: 0, left: -16 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip {...tooltipProps} formatter={(v) => fmtCurrency(Number(v))} />
        {!showEndLabels && <Legend {...legendProps} />}
        {series.map((k, i) => (
          <Line key={k} dataKey={k} stroke={SERIES[i % SERIES.length]} strokeWidth={1.75} dot={false} activeDot={{ r: 3 }}>
            {showEndLabels && (
              <LabelList dataKey={k} content={renderLineEndLabel(data, k, SERIES[i % SERIES.length])} />
            )}
          </Line>
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
