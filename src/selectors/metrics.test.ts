import { expect, test } from 'vitest'
import { totalMrr, activeCount, atRiskCount, segmentShares } from './metrics'
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

test('segmentShares excludes Churned and zero-value segments', () => {
  const shares = segmentShares(seedAccounts)
  expect(shares.find(s => s.segment === 'Enterprise')?.value).toBe(58750) // 24600+18400+15750
  // every returned slice is > 0 and no churned-only segment collapses to a 0 slice
  expect(shares.every(s => s.value > 0)).toBe(true)
})
