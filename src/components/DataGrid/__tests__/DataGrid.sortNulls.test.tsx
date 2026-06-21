import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DataGrid } from '../DataGrid'
import { DEFAULT_STATE } from '../state'
import type { DataGridColumn, DataGridState } from '../types'

interface Row { id: string; name: string; score: number | null; priority: string }

const PRIORITY_ORDER = ['Low', 'Med', 'High']

const columns: DataGridColumn<Row>[] = [
  { id: 'name', accessorKey: 'name', header: 'Name', type: 'text' },
  { id: 'score', accessorKey: 'score', header: 'Score', type: 'number' },
  {
    id: 'priority',
    accessorKey: 'priority',
    header: 'Priority',
    type: 'text',
    comparator: (a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority),
  },
]

const rows: Row[] = [
  { id: '1', name: 'A', score: 30, priority: 'High' },
  { id: '2', name: 'B', score: null, priority: 'Low' },
  { id: '3', name: 'C', score: 10, priority: 'Med' },
  { id: '4', name: 'D', score: 20, priority: 'High' },
]

function renderSorted(sorting: DataGridState['sorting']) {
  const { container } = render(
    <DataGrid rows={rows} columns={columns} getRowId={(row) => row.id} initialState={{ ...DEFAULT_STATE, sorting }} />,
  )
  return Array.from(container.querySelectorAll('tbody tr[data-row-id]')).map(
    (tr) => tr.querySelector('td[data-column-id="name"]')?.textContent,
  )
}

describe('sort: nulls-last + custom comparator', () => {
  it('puts blank values last when sorting ascending', () => {
    // scores 10/20/30 ascending, then the null row (B) last.
    expect(renderSorted([{ id: 'score', desc: false }])).toEqual(['C', 'D', 'A', 'B'])
  })

  it('still puts blank values last when sorting descending (direction-independent)', () => {
    // scores 30/20/10 descending, and the null row (B) STILL last — not flipped to the top.
    expect(renderSorted([{ id: 'score', desc: true }])).toEqual(['A', 'D', 'C', 'B'])
  })

  it('orders non-blank values by the column comparator', () => {
    // Low < Med < High; the two High rows (A, D) keep their original order (stable).
    expect(renderSorted([{ id: 'priority', desc: false }])).toEqual(['B', 'C', 'A', 'D'])
  })
})
