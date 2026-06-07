import { describe, expect, it, vi } from 'vitest'
import { downloadCSV, serializeCSV } from '../export'
import type { LedgerGridColumn } from '../types'

interface Row { id: string; name: string; owner: string; mrr: number }

const rows: Row[] = [
  { id: 'a1', name: 'Acme, Inc', owner: 'Dana', mrr: 10 },
  { id: 'a2', name: 'Beta "Labs"', owner: 'Lee', mrr: 20 },
]

const columns: LedgerGridColumn<Row>[] = [
  { id: 'name', accessorKey: 'name', header: 'Name' },
  { id: 'owner', accessorKey: 'owner', header: 'Owner' },
  { id: 'mrr', accessorKey: 'mrr', header: 'MRR' },
  { id: 'actions', header: '', type: 'actions', exportable: false },
]

describe('serializeCSV', () => {
  it('escapes cells and follows visible column order', () => {
    expect(serializeCSV(rows, columns, {
      getRowId: (row) => row.id,
      columnOrder: ['owner', 'name', 'actions', 'mrr'],
    })).toBe('Owner,Name,MRR\nDana,"Acme, Inc",10\nLee,"Beta ""Labs""",20')
  })

  it('exports selected rows only when rowSelection is supplied', () => {
    expect(serializeCSV(rows, columns, {
      getRowId: (row) => row.id,
      rowSelection: { a2: true },
      includeHeader: false,
    })).toBe('"Beta ""Labs""",Lee,20')
  })
})

describe('downloadCSV', () => {
  it('creates an object URL and clicks a download anchor', () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    downloadCSV('accounts.csv', 'a,b')

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(click).toHaveBeenCalledTimes(1)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test')
  })
})
