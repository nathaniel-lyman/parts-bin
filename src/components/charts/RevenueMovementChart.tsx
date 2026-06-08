import { Bar, BarChart, CartesianGrid, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { LabelProps } from 'recharts'
import { axisProps, gridProps, legendProps, semantic, tooltipProps } from '../../theme/chart-theme'
import { movementSeries } from '../../data/accounts'
import { SmartBarValueLabel } from './barLabels'
import { DEFAULT_REVENUE_MOVEMENT_BAR_WIDTH } from './revenueMovementChartConfig'

interface RevenueMovementChartProps {
  barWidth?: number
  showLabels?: boolean
}

const bars = [
  { dataKey: 'New', fill: semantic.accent },
  { dataKey: 'Expansion', fill: semantic.cyan },
  { dataKey: 'Churn', fill: semantic.neg },
] as const

type RevenueMovementBarKey = (typeof bars)[number]['dataKey']

function renderBarLabel(dataKey: RevenueMovementBarKey) {
  return function BarLabel(props: LabelProps) {
    const index = typeof props.index === 'number' ? props.index : null
    const value = index === null ? props.value : movementSeries[index]?.[dataKey]
    return <SmartBarValueLabel {...props} value={value} dataKey={dataKey} />
  }
}

// Semantic chart (THEME-SPEC §6): use --accent / --pos|cyan / --neg, NOT the categorical
// palette, so the bars track the accent token in dark mode and on re-skin.
export function RevenueMovementChart({ barWidth = DEFAULT_REVENUE_MOVEMENT_BAR_WIDTH, showLabels = false }: RevenueMovementChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={movementSeries} stackOffset="sign" margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="month" {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip {...tooltipProps} />
        <Legend {...legendProps} />
        <ReferenceLine y={0} stroke={semantic.muted} />
        {bars.map((bar) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            stackId="m"
            fill={bar.fill}
            barSize={barWidth}
            maxBarSize={barWidth}
            label={showLabels ? renderBarLabel(bar.dataKey) : false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
