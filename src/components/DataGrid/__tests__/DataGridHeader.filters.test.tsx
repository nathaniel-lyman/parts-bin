import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DataGrid } from '../DataGrid'
import { productColumns, productRows } from './fixtures'

describe('inline header filters', () => {
  it('renders header filter controls only when enabled and toggled open', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<DataGrid rows={productRows} columns={productColumns} getRowId={(row) => row.id} />)
    expect(screen.queryByRole('textbox', { name: /filter title/i })).toBeNull()

    rerender(<DataGrid rows={productRows} columns={productColumns} getRowId={(row) => row.id} enableHeaderFilters />)
    expect(screen.queryByRole('textbox', { name: /filter title/i })).toBeNull()

    await user.click(screen.getByRole('button', { name: /filters/i }))
    expect(screen.getByRole('textbox', { name: /filter title/i })).toBeInTheDocument()
  })

  it('filters through the same column-filter slice', async () => {
    const user = userEvent.setup()
    render(<DataGrid rows={productRows} columns={productColumns} getRowId={(row) => row.id} enableHeaderFilters />)

    await user.click(screen.getByRole('button', { name: /filters/i }))
    await user.type(screen.getByRole('textbox', { name: /filter title/i }), 'widget')

    expect(screen.getByText('Widget')).toBeInTheDocument()
    expect(screen.queryByText('Gadget')).toBeNull()
  })
})
