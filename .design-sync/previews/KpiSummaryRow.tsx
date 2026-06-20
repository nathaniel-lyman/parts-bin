import { KpiSummaryRow, KpiCard } from 'parts-bin'

export function DashboardSummary() {
  return (
    <div style={{ width: 520 }}>
      <KpiSummaryRow>
        <KpiCard label="Total MRR" value="$284K" delta={4.6} spark={[238, 251, 260, 268, 277, 284]} />
        <KpiCard label="Active accounts" value="42" delta={2.4} spark={[36, 38, 39, 40, 41, 42]} />
        <KpiCard label="Avg growth" value="3.8%" delta={1.1} spark={[2.9, 3.1, 3.4, 3.5, 3.7, 3.8]} />
        <KpiCard label="Needs review" value="7" delta={-12.5} spark={[12, 11, 10, 9, 8, 7]} negSpark />
      </KpiSummaryRow>
    </div>
  )
}
