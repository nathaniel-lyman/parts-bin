import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DataGrid } from '../DataGrid'
import { productColumns, productGlobalFilter, productRows } from './fixtures'

describe('DataGridToolbar quick filter', () => {
  it('filters arbitrary rows through the consumer-provided global filter', async () => {
    const user = userEvent.setup()
    render(<DataGrid rows={productRows} columns={productColumns} getRowId={(row) => row.id} globalFilterFn={productGlobalFilter} />)

    await user.type(screen.getByPlaceholderText(/search rows/i), 'gzm')

    expect(screen.getByText('Gizmo')).toBeInTheDocument()
    expect(screen.queryByText('Widget')).toBeNull()
  })
})
