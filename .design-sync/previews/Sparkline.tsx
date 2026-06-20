import { Sparkline } from 'parts-bin'

export function Trends() {
  return (
    <div style={{ display: 'grid', gap: 16, width: 320 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span className="micro">MRR</span>
        <Sparkline data={[238, 245, 251, 260, 268, 277, 284]} width={160} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span className="micro">Churn</span>
        <Sparkline data={[14, 13, 12, 11, 9, 8, 7]} neg width={160} />
      </div>
    </div>
  )
}

export function Inline() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span className="num display text-2xl text-ink">$284K</span>
      <Sparkline data={[238, 251, 260, 268, 277, 284]} />
    </div>
  )
}
