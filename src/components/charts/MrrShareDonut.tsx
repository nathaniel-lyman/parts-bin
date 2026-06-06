import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { Account } from '../../data/types'
import { segmentShares, totalMrr } from '../../selectors/metrics'
import { SERIES, tooltipProps } from '../../theme/chart-theme'
import { fmtCurrency } from '../../lib/format'

export function MrrShareDonut({ accounts }: { accounts: Account[] }) {
  const data = segmentShares(accounts)
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="segment" innerRadius={70} outerRadius={94} paddingAngle={2} stroke="none">
            {data.map((_, i) => <Cell key={i} fill={SERIES[i]} />)}
          </Pie>
          <Tooltip {...tooltipProps} formatter={(v) => fmtCurrency(Number(v))} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="num text-2xl text-ink">{fmtCurrency(totalMrr(accounts))}</div>
        <div className="micro">Active MRR</div>
      </div>
    </div>
  )
}
