import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DataGrid } from '../DataGrid'
import { productColumns, type ProductRow } from './fixtures'

const rows: ProductRow[] = Array.from({ length: 30 }, (_, index) => ({
  id: `r${index}`,
  title: `Item ${index}`,
  sku: `SKU-${index}`,
  category: index % 2 === 0 ? 'Hardware' : 'Software',
  quantity: index,
  score: 100 - index,
  status: index % 2 === 0 ? 'Ready' : 'Review',
  updatedAt: '2026-06-01',
}))

function bodyRows() {
  // Data rows only — skips the header row and the aggregation footer row.
  return screen.getAllByRole('row').filter((row) => row.hasAttribute('data-row-id'))
}

describe('DataGrid pagination', () => {
  it('paginates local rows and advances pages', async () => {
    render(
      <DataGrid
        rows={rows}
        columns={productColumns}
        getRowId={(row) => row.id}
        initialState={{ sorting: [], pagination: { pageIndex: 0, pageSize: 10 } }}
      />,
    )

    expect(bodyRows()).toHaveLength(10)
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
    expect(within(bodyRows()[0]).getByText('Item 0')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /next page/i }))

    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument()
    expect(bodyRows()).toHaveLength(10)
    expect(within(bodyRows()[0]).getByText('Item 10')).toBeInTheDocument()
  })
})
