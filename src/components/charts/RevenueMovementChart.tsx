import { Bar, BarChart, CartesianGrid, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { axisProps, gridProps, legendProps, semantic, tooltipProps } from '../../theme/chart-theme'
import { movementSeries } from '../../data/accounts'

// Semantic chart (THEME-SPEC §6): use --accent / --pos|cyan / --neg, NOT the categorical
// palette, so the bars track the accent token in dark mode and on re-skin.
export function RevenueMovementChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={movementSeries} stackOffset="sign" margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip {...tooltipProps} />
        <Legend {...legendProps} />
        <ReferenceLine y={0} stroke={semantic.muted} />
        <Bar dataKey="New" stackId="m" fill={semantic.accent} maxBarSize={22} />
        <Bar dataKey="Expansion" stackId="m" fill={semantic.cyan} maxBarSize={22} />
        <Bar dataKey="Churn" stackId="m" fill={semantic.neg} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  )
}
