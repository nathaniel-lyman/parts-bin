import type { Account, Segment } from '../data/types'

const liveAccounts = (a: Account[]) => a.filter((x) => x.status !== 'Churned')

export const totalMrr = (a: Account[]) => liveAccounts(a).reduce((s, x) => s + x.mrr, 0)
export const activeCount = (a: Account[]) => a.filter((x) => x.status === 'Active').length
export const atRiskCount = (a: Account[]) => a.filter((x) => x.status !== 'Active').length

// Average growth over ALL accounts (including Churned), matching the prototype (demo.html:380).
// Spec §10 is silent on avgGrowth, so the demo governs the behavior here.
export const avgGrowth = (a: Account[]) => {
  if (!a.length) return 0
  return a.reduce((s, x) => s + x.growth, 0) / a.length
}

export interface SegmentShare { segment: Segment; value: number }
export const segmentShares = (a: Account[]): SegmentShare[] => {
  const order: Segment[] = ['Enterprise', 'Mid-market', 'Startup']
  return order
    .map((segment) => ({
      segment,
      value: liveAccounts(a).filter((x) => x.segment === segment).reduce((s, x) => s + x.mrr, 0),
    }))
    .filter((s) => s.value > 0)
}
