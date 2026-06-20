import { ChartCard, LineTrendChart } from 'parts-bin'

// ChartCard is a titled surface that wraps a chart — here around a LineTrendChart.
export function WithTrend() {
  return (
    <div style={{ width: 520 }}>
      <ChartCard
        title="MRR by segment"
        description="Monthly recurring revenue, last 10 months."
        metric="+18%"
      >
        <div style={{ width: 460, height: 240 }}>
          <LineTrendChart />
        </div>
      </ChartCard>
    </div>
  )
}

// Header-only composition: title, description, metric, and a summary body.
export function HeaderMetric() {
  return (
    <div style={{ width: 360 }}>
      <ChartCard title="Net new ARR" description="Quarter to date" metric="$182k">
        <p className="m-0 text-[13px] text-muted">
          Pipeline closed 14 deals this quarter, up from 9 last quarter.
        </p>
      </ChartCard>
    </div>
  )
}
