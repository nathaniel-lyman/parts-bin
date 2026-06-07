import { describe, expect, it } from 'vitest'
import { rootReducer } from '../reducers'
import { DEFAULT_STATE } from '../state'

describe('sorting slice reducer', () => {
  it('plain click toggles a single column sort without clearing it', () => {
    const asc = rootReducer(DEFAULT_STATE, { type: 'TOGGLE_SORT', columnId: 'segment', multi: false })
    const desc = rootReducer(asc, { type: 'TOGGLE_SORT', columnId: 'segment', multi: false })
    const backToAsc = rootReducer(desc, { type: 'TOGGLE_SORT', columnId: 'segment', multi: false })

    expect(asc.sorting).toEqual([{ id: 'segment', desc: false }])
    expect(desc.sorting).toEqual([{ id: 'segment', desc: true }])
    expect(backToAsc.sorting).toEqual([{ id: 'segment', desc: false }])
  })

  it('shift-click appends secondary sorts and locked actions never stick', () => {
    const first = rootReducer(DEFAULT_STATE, { type: 'TOGGLE_SORT', columnId: 'segment', multi: false })
    const next = rootReducer(first, { type: 'TOGGLE_SORT', columnId: 'mrr', multi: true })
    const locked = rootReducer(next, { type: 'TOGGLE_SORT', columnId: 'actions', multi: true })

    expect(next.sorting).toEqual([{ id: 'segment', desc: false }, { id: 'mrr', desc: false }])
    expect(locked.sorting).toEqual(next.sorting)
  })
})
