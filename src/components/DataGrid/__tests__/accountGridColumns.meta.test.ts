import { describe, expect, it, vi } from 'vitest'
import { buildAccountGridColumns } from '../../accountGridColumns'

const columns = buildAccountGridColumns(vi.fn(), vi.fn())
const byId = (id: string) => {
  const column = columns.find((candidate) => candidate.id === id)
  if (!column) throw new Error(`missing column ${id}`)
  return column
}

describe('accountGridColumns meta adapter', () => {
  it('maps right-aligned numerics to meta.align = right', () => {
    expect(byId('mrr').meta?.align).toBe('right')
    expect(byId('growth').meta?.align).toBe('right')
  })

  it('maps left-aligned text to meta.align = left', () => {
    expect(byId('account').meta?.align).toBe('left')
    expect(byId('owner').meta?.align).toBe('left')
  })

  it('marks movable columns resizable and the actions column non-resizable', () => {
    expect(byId('account').meta?.resizable).toBe(true)
    expect(byId('actions').meta?.resizable).toBe(false)
  })
})

