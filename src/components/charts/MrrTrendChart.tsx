import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { axisProps, gridProps, legendProps, SERIES, tooltipProps } from '../../theme/chart-theme'
import { monthlySeries } from '../../data/accounts'
import { fmtCurrency } from '../../lib/format'

export function MrrTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={monthlySeries} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip {...tooltipProps} formatter={(v) => fmtCurrency(Number(v))} />
        <Legend {...legendProps} />
        {(['Enterprise', 'Mid-market', 'Startup'] as const).map((k, i) => (
          <Line key={k} dataKey={k} stroke={SERIES[i]} strokeWidth={1.75} dot={false} activeDot={{ r: 3 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
