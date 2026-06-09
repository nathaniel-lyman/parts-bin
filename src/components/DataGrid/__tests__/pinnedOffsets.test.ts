import { describe, expect, it } from 'vitest'
import { pinnedOffsets } from '../selectors'

const widths = { a: 100, b: 120, account: 200, actions: 80, status: 90 }

describe('pinnedOffsets', () => {
  it('accumulates left offsets so stacked left-pinned columns do not overlap', () => {
    const { left } = pinnedOffsets({ left: ['account', 'a'], right: [] }, widths)
    expect(left).toEqual({ account: 0, a: 200 })
  })

  it('accumulates right offsets from the rightmost column inward', () => {
    const { right } = pinnedOffsets({ left: [], right: ['status', 'actions'] }, widths)
    // actions is rightmost (offset 0); status sits to its left by actions width
    expect(right).toEqual({ actions: 0, status: 80 })
  })

  it('shifts left-pinned columns past a leading (selection) column', () => {
    const { left } = pinnedOffsets({ left: ['account'], right: [] }, widths, 40)
    expect(left).toEqual({ account: 40 })
  })

  it('treats missing widths as zero', () => {
    const { left } = pinnedOffsets({ left: ['account', 'unknown', 'a'], right: [] }, widths)
    expect(left).toEqual({ account: 0, unknown: 200, a: 200 })
  })
})
