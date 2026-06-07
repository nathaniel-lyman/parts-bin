import { describe, expect, it } from 'vitest'
import { orderedColumns, visibleColumns } from '../selectors'
import { DEFAULT_STATE } from '../state'
import type { LedgerGridColumn } from '../types'

const cols: LedgerGridColumn<{ x: number }>[] = [
  { id: 'account', header: 'Account' },
  { id: 'owner', header: 'Owner' },
  { id: 'arr', header: 'ARR' },
  { id: 'since', header: 'Since' },
  { id: 'actions', header: '' },
]

describe('orderedColumns (assumes normalized state)', () => {
  it('returns columns sorted by state.columnOrder, actions last', () => {
    const state = { ...DEFAULT_STATE, columnOrder: ['owner', 'account', 'arr', 'since', 'actions'] }
    expect(orderedColumns(cols, state).map((column) => column.id)).toEqual([
      'owner',
      'account',
      'arr',
      'since',
      'actions',
    ])
  })

  it('columns not present in columnOrder fall to the end', () => {
    const state = { ...DEFAULT_STATE, columnOrder: ['account', 'owner', 'actions'] }
    const ids = orderedColumns(cols, state).map((column) => column.id)
    expect(ids[0]).toBe('account')
    expect(ids).toContain('arr')
    expect(ids).toContain('since')
  })
})

describe('visibleColumns', () => {
  it('drops columns whose visibility is explicitly false', () => {
    const state = {
      ...DEFAULT_STATE,
      columnOrder: ['account', 'owner', 'arr', 'since', 'actions'],
      columnVisibility: { account: true, owner: true, arr: false, since: false, actions: true },
    }
    expect(visibleColumns(cols, state).map((column) => column.id)).toEqual(['account', 'owner', 'actions'])
  })

  it('treats columns omitted from visibility map as visible', () => {
    const state = {
      ...DEFAULT_STATE,
      columnOrder: ['account', 'owner', 'arr', 'since', 'actions'],
      columnVisibility: { arr: false },
    }
    expect(visibleColumns(cols, state).map((column) => column.id)).toEqual(['account', 'owner', 'since', 'actions'])
  })
})

