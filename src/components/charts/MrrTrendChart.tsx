import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
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
}

export function MrrTrendChart({
  data = monthlySeries,
  series = ['Enterprise', 'Mid-market', 'Startup'],
  xKey = 'month',
}: MrrTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data as object[]} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip {...tooltipProps} formatter={(v) => fmtCurrency(Number(v))} />
        <Legend {...legendProps} />
        {series.map((k, i) => (
          <Line key={k} dataKey={k} stroke={SERIES[i % SERIES.length]} strokeWidth={1.75} dot={false} activeDot={{ r: 3 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
