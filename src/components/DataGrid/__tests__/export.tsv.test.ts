import { describe, expect, it } from 'vitest'
import { serializeTSV } from '../export'
import type { LedgerGridColumn } from '../types'

interface Row { id: string; name: string; mrr: number; owner: string }

const columns: LedgerGridColumn<Row>[] = [
  { id: 'name', accessorKey: 'name', header: 'Account', type: 'text' },
  { id: 'mrr', accessorKey: 'mrr', header: 'MRR', type: 'currency' },
  { id: 'owner', accessorKey: 'owner', header: 'Owner', type: 'text' },
  { id: 'actions', header: '', type: 'actions', exportable: false },
]

const rows: Row[] = [
  { id: 'a1', name: 'Acme', mrr: 900, owner: 'Dana' },
  { id: 'a2', name: 'Beta', mrr: 300, owner: 'Lee' },
  { id: 'a3', name: 'Cobalt', mrr: 600, owner: 'Ravi' },
]

describe('serializeTSV', () => {
  it('emits raw accessor values and excludes actions', () => {
    expect(serializeTSV(rows, columns, { getRowId: (row) => row.id })).toBe(
      'Account\tMRR\tOwner\nAcme\t900\tDana\nBeta\t300\tLee\nCobalt\t600\tRavi',
    )
  })

  it('honors order, visibility, selection, value cleaning, and header omission', () => {
    expect(serializeTSV(rows, columns, {
      getRowId: (row) => row.id,
      columnOrder: ['owner', 'name', 'mrr', 'actions'],
      columnVisibility: { mrr: false },
      rowSelection: { a1: true, a3: true },
    })).toBe('Owner\tAccount\nDana\tAcme\nRavi\tCobalt')

    expect(serializeTSV([{ id: 'x', name: 'A\tB\nC', mrr: 1, owner: 'O' }], columns, {
      getRowId: (row) => row.id,
      includeHeader: false,
    })).toBe('A B C\t1\tO')
  })
})
