import { beforeEach, describe, expect, it, vi } from 'vitest'
import { downloadCSV, downloadXLSX, serializeCSV, serializeXLSX } from '../export'
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

beforeEach(() => {
  vi.restoreAllMocks()
})

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

  it('exports every row when the selection map is empty (no selection)', () => {
    expect(serializeCSV(rows, columns, {
      getRowId: (row) => row.id,
      rowSelection: {},
    })).toBe('Name,Owner,MRR\n"Acme, Inc",Dana,10\n"Beta ""Labs""",Lee,20')
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

describe('serializeXLSX', () => {
  it('writes an XLSX zip with workbook and worksheet XML', () => {
    const bytes = serializeXLSX(rows, columns, {
      getRowId: (row) => row.id,
      columnOrder: ['owner', 'name', 'actions', 'mrr'],
    })
    const text = new TextDecoder().decode(bytes)

    expect(Array.from(bytes.slice(0, 2))).toEqual([0x50, 0x4b])
    expect(text).toContain('xl/workbook.xml')
    expect(text).toContain('xl/worksheets/sheet1.xml')
    expect(text).toContain('Owner')
    expect(text).toContain('Acme, Inc')
    expect(text).not.toContain('actions')
  })

  it('exports selected rows only when rowSelection is supplied', () => {
    const text = new TextDecoder().decode(serializeXLSX(rows, columns, {
      getRowId: (row) => row.id,
      rowSelection: { a2: true },
    }))

    expect(text).toContain('Beta &quot;Labs&quot;')
    expect(text).not.toContain('Acme, Inc')
  })

  it('exports every row when the selection map is empty (no selection)', () => {
    const text = new TextDecoder().decode(serializeXLSX(rows, columns, {
      getRowId: (row) => row.id,
      rowSelection: {},
    }))

    expect(text).toContain('Acme, Inc')
    expect(text).toContain('Beta &quot;Labs&quot;')
  })
})

describe('downloadXLSX', () => {
  it('creates an XLSX object URL and clicks a download anchor', () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:xlsx')
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    downloadXLSX('accounts.xlsx', new Uint8Array([1, 2, 3]))

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(click).toHaveBeenCalledTimes(1)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:xlsx')
  })
})
