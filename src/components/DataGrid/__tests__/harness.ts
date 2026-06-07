import { renderHook } from '@testing-library/react'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type {
  ColumnDef,
  ColumnPinningState,
  RowPinningState,
  Table,
  VisibilityState,
} from '@tanstack/react-table'
import type { Account } from '../../../data/types'
import { accountGridColumns } from '../../accountGridColumns'

const SEGMENTS = ['Enterprise', 'Mid-market', 'Startup'] as const
const STATUSES = ['Active', 'At risk', 'Churned'] as const

export function makeRows(count: number): Account[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `row-${index}`,
    name: `Account ${index}`,
    owner: `Owner ${index % 7}`,
    segment: SEGMENTS[index % SEGMENTS.length],
    mrr: 1000 + index,
    growth: (index % 21) - 10,
    status: STATUSES[index % STATUSES.length],
    arr: (1000 + index) * 12,
    since: '2024-01-01',
  }))
}

interface HarnessOptions {
  rowCount: number
  columnPinning?: ColumnPinningState
  rowPinning?: RowPinningState
  columnVisibility?: VisibilityState
}

interface Harness {
  table: Table<Account>
  rows: Account[]
}

export function buildAccountGridTestHarness(options: HarnessOptions): Harness {
  const rows = makeRows(options.rowCount)
  const columns = accountGridColumns({ onEdit: () => {}, onDelete: () => {} }) as ColumnDef<Account>[]

  const { result } = renderHook(() => {
    return useReactTable<Account>({
      data: rows,
      columns,
      getRowId: (row) => row.id,
      enableRowPinning: true,
      keepPinnedRows: true,
      state: {
        columnPinning: options.columnPinning ?? { left: [], right: ['actions'] },
        rowPinning: options.rowPinning ?? { top: [], bottom: [] },
        columnVisibility: options.columnVisibility ?? {},
      },
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
    })
  })

  return { table: result.current, rows }
}
