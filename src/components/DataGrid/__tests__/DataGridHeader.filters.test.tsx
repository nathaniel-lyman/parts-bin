import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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

    // Header filter typing is debounced (~200ms), so the filter applies after the user pauses.
    await waitFor(() => expect(screen.queryByText('Gadget')).toBeNull())
    expect(screen.getByText('Widget')).toBeInTheDocument()
  })

  it('commits the in-flight filter immediately on blur (before the debounce elapses)', async () => {
    const user = userEvent.setup()
    render(<DataGrid rows={productRows} columns={productColumns} getRowId={(row) => row.id} enableHeaderFilters />)

    await user.click(screen.getByRole('button', { name: /filters/i }))
    const input = screen.getByRole('textbox', { name: /filter title/i })
    await user.type(input, 'widget')
    fireEvent.blur(input)

    // Blur flushes synchronously — so a value typed within the debounce window survives the input
    // unmounting (e.g. closing the filter panel) instead of being dropped.
    expect(screen.queryByText('Gadget')).toBeNull()
    expect(screen.getByText('Widget')).toBeInTheDocument()
  })
})
