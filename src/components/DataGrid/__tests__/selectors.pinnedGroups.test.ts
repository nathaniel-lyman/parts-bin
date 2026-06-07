import { describe, expect, it } from 'vitest'
import { pinnedLeafGroups } from '../selectors'

const ordered = ['account', 'owner', 'segment', 'mrr', 'growth', 'status', 'actions']

describe('pinnedLeafGroups', () => {
  it('splits ordered visible leaves into left / center / right by pinning', () => {
    const groups = pinnedLeafGroups(ordered, { left: ['account'], right: ['actions'] })
    expect(groups.left).toEqual(['account'])
    expect(groups.center).toEqual(['owner', 'segment', 'mrr', 'growth', 'status'])
    expect(groups.right).toEqual(['actions'])
  })

  it('preserves pin-array order for left and right', () => {
    expect(pinnedLeafGroups(ordered, { left: ['segment', 'account'], right: ['actions'] }).left).toEqual(['segment', 'account'])
  })

  it('excludes pinned ids that are not visible', () => {
    const groups = pinnedLeafGroups(ordered, { left: ['since'], right: ['actions'] })
    expect(groups.left).toEqual([])
    expect(groups.center).not.toContain('since')
  })

  it('defaults: only actions pinned right, everything else center', () => {
    const groups = pinnedLeafGroups(ordered, { left: [], right: ['actions'] })
    expect(groups.left).toEqual([])
    expect(groups.right).toEqual(['actions'])
    expect(groups.center).toEqual(['account', 'owner', 'segment', 'mrr', 'growth', 'status'])
  })
})

