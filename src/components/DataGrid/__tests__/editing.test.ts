import { describe, expect, it } from 'vitest'
import {
  commitSession,
  editorTypeFor,
  isColumnEditable,
  isDirtyCell,
  isEditingCell,
  markDirty,
  parseDraft,
  setDraft,
  startEdit,
} from '../editing'
import type { DataGridColumn } from '../types'

interface Row {
  id: string
  name: string
  mrr: number
  segment: string
}

const row: Row = { id: 'a1', name: 'Acme', mrr: 1200, segment: 'Startup' }

const columns: DataGridColumn<Row>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    type: 'text',
    editable: true,
    validate: (value) => (String(value).trim() === '' ? 'Name is required' : null),
  },
  {
    id: 'mrr',
    accessorKey: 'mrr',
    header: 'MRR',
    type: 'currency',
    editable: true,
    validate: (value) => (Number(value) < 0 ? 'No negatives' : null),
  },
  {
    id: 'segment',
    accessorKey: 'segment',
    header: 'Segment',
    type: 'status',
    editable: true,
    meta: { options: ['Startup', 'Enterprise'] },
  },
  { id: 'readonly', accessorKey: 'id', header: 'Id', type: 'text' },
  { id: 'actions', header: 'Actions', type: 'actions', editable: true },
]

describe('editing model', () => {
  it('isColumnEditable requires editable + accessorKey and excludes actions', () => {
    expect(isColumnEditable(columns[0])).toBe(true)
    expect(isColumnEditable(columns[3])).toBe(false) // not editable
    expect(isColumnEditable(columns[4])).toBe(false) // actions
    expect(isColumnEditable(undefined)).toBe(false)
  })

  it('editorTypeFor derives select from options, number from numeric types', () => {
    expect(editorTypeFor(columns[0])).toBe('text')
    expect(editorTypeFor(columns[1])).toBe('number')
    expect(editorTypeFor(columns[2])).toBe('select')
    expect(editorTypeFor({ id: 'd', accessorKey: 'id', header: 'D', type: 'date' } as DataGridColumn<Row>)).toBe('date')
  })

  it('startEdit cell mode seeds a single draft from the row', () => {
    const session = startEdit('cell', 'a1', 'mrr', columns, row)
    expect(session.drafts).toEqual({ mrr: '1200' })
    expect(session.mode).toBe('cell')
  })

  it('startEdit row mode seeds drafts for every editable column', () => {
    const session = startEdit('row', 'a1', 'name', columns, row)
    expect(Object.keys(session.drafts).sort()).toEqual(['mrr', 'name', 'segment'])
  })

  it('setDraft updates the draft and clears its error', () => {
    let session = startEdit('cell', 'a1', 'mrr', columns, row)
    session = { ...session, errors: { mrr: 'No negatives' } }
    session = setDraft(session, 'mrr', '1500')
    expect(session.drafts.mrr).toBe('1500')
    expect(session.errors.mrr).toBeUndefined()
  })

  it('parseDraft rejects non-numeric input for number editors', () => {
    expect(parseDraft('number', 'abc').error).toBe('Enter a number')
    expect(parseDraft('number', '').error).toBe('Enter a number')
    expect(parseDraft('number', '42')).toEqual({ value: 42 })
    expect(parseDraft('text', '')).toEqual({ value: '' })
  })

  it('parseDraft tolerates formatted numerics so a formatted copy pastes back', () => {
    expect(parseDraft('number', '$24,600')).toEqual({ value: 24600 })
    expect(parseDraft('number', '-2.1%')).toEqual({ value: -2.1 })
    expect(parseDraft('number', '$1,000')).toEqual({ value: 1000 })
  })

  it('commitSession produces a patch keyed by accessorKey for changed values only', () => {
    let session = startEdit('cell', 'a1', 'mrr', columns, row)
    session = setDraft(session, 'mrr', '1500')
    const result = commitSession(session, columns, row)
    expect(result.ok).toBe(true)
    expect(result.patch).toEqual({ mrr: 1500 })
    expect(result.changed).toEqual(['mrr'])
  })

  it('commitSession with an unchanged draft commits an empty patch', () => {
    const session = startEdit('cell', 'a1', 'mrr', columns, row)
    const result = commitSession(session, columns, row)
    expect(result.ok).toBe(true)
    expect(result.patch).toEqual({})
    expect(result.changed).toEqual([])
  })

  it('commitSession surfaces validation errors and blocks the patch', () => {
    let session = startEdit('cell', 'a1', 'mrr', columns, row)
    session = setDraft(session, 'mrr', '-5')
    const result = commitSession(session, columns, row)
    expect(result.ok).toBe(false)
    expect(result.errors).toEqual({ mrr: 'No negatives' })
    expect(result.patch).toEqual({})
  })

  it('commitSession row mode validates every draft', () => {
    let session = startEdit('row', 'a1', 'name', columns, row)
    session = setDraft(session, 'name', '')
    session = setDraft(session, 'mrr', '2400')
    const result = commitSession(session, columns, row)
    expect(result.ok).toBe(false)
    expect(result.errors.name).toBe('Name is required')
  })

  it('markDirty / isDirtyCell track committed cells per row', () => {
    let dirty = markDirty({}, 'a1', ['mrr'])
    dirty = markDirty(dirty, 'a1', ['name'])
    expect(isDirtyCell(dirty, 'a1', 'mrr')).toBe(true)
    expect(isDirtyCell(dirty, 'a1', 'name')).toBe(true)
    expect(isDirtyCell(dirty, 'a2', 'mrr')).toBe(false)
    expect(markDirty(dirty, 'a1', [])).toBe(dirty)
  })

  it('isEditingCell matches cell mode exactly and row mode by editability', () => {
    const editable = (columnId: string) => columnId !== 'readonly'
    const cellSession = startEdit('cell', 'a1', 'mrr', columns, row)
    expect(isEditingCell(cellSession, 'a1', 'mrr', editable)).toBe(true)
    expect(isEditingCell(cellSession, 'a1', 'name', editable)).toBe(false)
    expect(isEditingCell(cellSession, 'a2', 'mrr', editable)).toBe(false)
    const rowSession = startEdit('row', 'a1', 'name', columns, row)
    expect(isEditingCell(rowSession, 'a1', 'mrr', editable)).toBe(true)
    expect(isEditingCell(rowSession, 'a1', 'readonly', editable)).toBe(false)
    expect(isEditingCell(null, 'a1', 'mrr', editable)).toBe(false)
  })
})
