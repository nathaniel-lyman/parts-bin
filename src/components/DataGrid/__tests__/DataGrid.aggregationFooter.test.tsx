import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DataGrid } from '../DataGrid'
import { DEFAULT_STATE } from '../state'
import type { DataGridColumn } from '../types'

interface Row { id: string; score: number }

const columns: DataGridColumn<Row>[] = [
  { id: 'score', accessorKey: 'score', header: 'Score', type: 'number', aggregate: 'avg' },
]

// Page 1 (size 5) is all zeros; the sixth row is 60. The true mean is 60/6 = 10. A page-scoped
// footer would average only the visible page and wrongly show 0.
const rows: Row[] = [0, 0, 0, 0, 0, 60].map((score, index) => ({ id: String(index), score }))

describe('DataGrid aggregation footer', () => {
  it('averages over every filtered row, not just the current page', () => {
    render(
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        initialState={{ ...DEFAULT_STATE, pagination: { pageIndex: 0, pageSize: 5 } }}
      />,
    )
    // Only five rows are on screen, but the footer avg reflects all six.
    expect(screen.getAllByRole('row').filter((r) => r.getAttribute('data-row-id')).length).toBe(5)
    expect(screen.getByTestId('agg-footer-score').textContent).toContain('10')
  })
})
