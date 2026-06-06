import { expect, test } from 'vitest'
import { totalMrr, activeCount, atRiskCount, avgGrowth, segmentShares } from './metrics'
import { seedAccounts } from '../data/accounts'

test('totalMrr excludes Churned accounts', () => {
  // sum of all non-churned mrr in seed
  const expected = seedAccounts.filter(a => a.status !== 'Churned').reduce((s, a) => s + a.mrr, 0)
  expect(totalMrr(seedAccounts)).toBe(expected)
  // sanity: churned Solstice (4300) is excluded
  expect(totalMrr(seedAccounts)).toBe(78300)
})

test('activeCount counts only Active', () => {
  expect(activeCount(seedAccounts)).toBe(seedAccounts.filter(a => a.status === 'Active').length)
})

test('atRiskCount counts non-Active (at risk + churned)', () => {
  expect(atRiskCount(seedAccounts)).toBe(seedAccounts.filter(a => a.status !== 'Active').length)
})

test('avgGrowth averages ALL accounts including Churned (matches demo)', () => {
  // (-2.1+6.2+3.9+12.8+0.4-14.2+31.4-8.6)/8 = 29.8/8 = 3.725
  expect(avgGrowth(seedAccounts)).toBeCloseTo(3.725, 3)
})

test('avgGrowth returns 0 for empty list (no NaN)', () => {
  expect(avgGrowth([])).toBe(0)
})

test('segmentShares excludes Churned and zero-value segments', () => {
  const shares = segmentShares(seedAccounts)
  expect(shares.find(s => s.segment === 'Enterprise')?.value).toBe(58750) // 24600+18400+15750
  expect(shares.find(s => s.segment === 'Mid-market')?.value).toBe(16000) // 9200+6800 (Solstice churned, dropped)
  expect(shares.map(s => s.segment)).toEqual(['Enterprise', 'Mid-market', 'Startup'])
  // every returned slice is > 0 and no churned-only segment collapses to a 0 slice
  expect(shares.every(s => s.value > 0)).toBe(true)
})

test('segmentShares drops a segment that is entirely churned (zero value)', () => {
  const data = seedAccounts.map(a => a.segment === 'Startup' ? { ...a, status: 'Churned' as const } : a)
  const shares = segmentShares(data)
  expect(shares.find(s => s.segment === 'Startup')).toBeUndefined()
  expect(shares.map(s => s.segment)).toEqual(['Enterprise', 'Mid-market'])
})
