import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DataGrid } from '../DataGrid'
import { savedViewsKeyForGrid } from '../useSavedViews'
import { PRODUCT_GRID_INITIAL_STATE, productColumns, productRows } from './fixtures'

const persistenceKey = 'products.grid'

function renderGrid() {
  render(
    <DataGrid
      rows={productRows}
      columns={productColumns}
      getRowId={(row) => row.id}
      persistenceKey={persistenceKey}
      initialState={PRODUCT_GRID_INITIAL_STATE}
    />,
  )
}

const skuVisible = () => screen.queryByRole('columnheader', { name: /sku/i }) != null

describe('DataGrid saved views', () => {
  it('saves a mutated layout, resets, and reapplies it', async () => {
    renderGrid()
    // SKU is visible by default; hide it to create a non-default layout.
    expect(skuVisible()).toBe(true)

    await userEvent.click(screen.getByRole('button', { name: /columns/i }))
    await userEvent.click(screen.getByRole('checkbox', { name: /^sku$/i }))
    await userEvent.keyboard('{Escape}')
    expect(skuVisible()).toBe(false)

    await userEvent.click(screen.getByRole('button', { name: /views/i }))
    await userEvent.type(screen.getByPlaceholderText(/view name/i), 'Snapshot')
    await userEvent.click(screen.getByRole('button', { name: /save current/i }))

    const stored = JSON.parse(localStorage.getItem(savedViewsKeyForGrid(persistenceKey))!)
    expect(stored[0].name).toBe('Snapshot')
    expect(stored[0].view.columnVisibility.sku).toBe(false)

    // Reset restores the grid's built-in defaults (all columns visible).
    await userEvent.click(screen.getByRole('button', { name: /columns/i }))
    await userEvent.click(screen.getByRole('button', { name: /reset to default/i }))
    expect(skuVisible()).toBe(true)

    // Reapplying the saved view restores the hidden column.
    await userEvent.click(screen.getByRole('button', { name: /views/i }))
    await userEvent.click(screen.getByRole('button', { name: /apply snapshot/i }))
    expect(skuVisible()).toBe(false)
  })
})
