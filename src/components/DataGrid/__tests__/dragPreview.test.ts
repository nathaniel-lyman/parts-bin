import { describe, expect, it } from 'vitest'
import { projectColumnDrag } from '../dragPreview'

const orderedIds = ['account', 'owner', 'segment', 'mrr']
const widths = {
  account: 160,
  owner: 120,
  segment: 100,
  mrr: 90,
}

describe('projectColumnDrag', () => {
  it('shifts intervening columns left when dragging left-to-right', () => {
    const projection = projectColumnDrag({ orderedIds, widths, activeId: 'account', overId: 'segment' })

    expect(projection.projectedOrder).toEqual(['owner', 'segment', 'account', 'mrr'])
    expect(projection.offsets).toEqual({ owner: -160, segment: -160 })
  })

  it('shifts intervening columns right when dragging right-to-left', () => {
    const projection = projectColumnDrag({ orderedIds, widths, activeId: 'segment', overId: 'account' })

    expect(projection.projectedOrder).toEqual(['segment', 'account', 'owner', 'mrr'])
    expect(projection.offsets).toEqual({ account: 100, owner: 100 })
  })

  it('does not project a same-column drag', () => {
    const projection = projectColumnDrag({ orderedIds, widths, activeId: 'owner', overId: 'owner' })

    expect(projection.projectedOrder).toEqual(orderedIds)
    expect(projection.offsets).toEqual({})
  })

  it('ignores unknown, hidden, and locked ids that are absent from the movable order', () => {
    expect(projectColumnDrag({ orderedIds, widths, activeId: 'ghost', overId: 'owner' }).offsets).toEqual({})
    expect(projectColumnDrag({ orderedIds, widths, activeId: 'account', overId: 'arr' }).offsets).toEqual({})
    expect(projectColumnDrag({ orderedIds, widths, activeId: 'actions', overId: 'account' }).offsets).toEqual({})
  })
})
