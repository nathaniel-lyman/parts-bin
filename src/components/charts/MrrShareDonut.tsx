import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { Account } from '../../data/types'
import { segmentShares } from '../../selectors/metrics'
import { SERIES, tooltipProps } from '../../theme/chart-theme'
import { fmtCurrency } from '../../lib/format'
import { ChartLegend } from './ChartScaffold'

export interface ShareDonutDatum {
  id: string
  label: string
  value: number
}

export interface ShareDonutChartProps {
  data: readonly ShareDonutDatum[]
  totalLabel?: string
  valueFormatter?: (value: number) => string
}

export function ShareDonutChart({
  data,
  totalLabel = 'Total',
  valueFormatter = fmtCurrency,
}: ShareDonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const legendItems = data.map((item, i) => ({
    id: item.id,
    label: item.label,
    color: SERIES[i],
    value: `${valueFormatter(item.value)} (${total > 0 ? Math.round((item.value / total) * 100) : 0}%)`,
  }))

  return (
    <div className="grid gap-3">
      <div className="relative">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={70} outerRadius={94} paddingAngle={2} stroke="none">
              {data.map((_, i) => <Cell key={i} fill={SERIES[i]} />)}
            </Pie>
            <Tooltip {...tooltipProps} formatter={(v) => valueFormatter(Number(v))} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="num text-2xl text-ink">{valueFormatter(total)}</div>
          <div className="micro">{totalLabel}</div>
        </div>
      </div>
      <ChartLegend items={legendItems} className="justify-center" />
    </div>
  )
}

export function MrrShareDonut({ accounts }: { accounts: Account[] }) {
  return (
    <ShareDonutChart
      data={segmentShares(accounts).map((share) => ({
        id: share.segment,
        label: share.segment,
        value: share.value,
      }))}
      totalLabel="Active value"
      valueFormatter={fmtCurrency}
    />
  )
}
