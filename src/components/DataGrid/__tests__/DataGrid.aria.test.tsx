import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DataGrid } from '../DataGrid'
import { productColumns, productRows } from './fixtures'

function renderGrid() {
  render(
    <DataGrid
      rows={productRows}
      columns={productColumns}
      getRowId={(row) => row.id}
      enableRowSelection
    />,
  )
}

describe('DataGrid ARIA', () => {
  it('exposes a grid with row and column counts', () => {
    renderGrid()
    expect(screen.getByRole('grid')).toHaveAttribute('aria-colcount')
    expect(screen.getByRole('grid')).toHaveAttribute('aria-rowcount')
  })

  it('exposes 1-based aria-rowindex/colindex so virtualization reports true positions', () => {
    renderGrid()
    const grid = screen.getByRole('grid')
    // Header row is index 1; data rows continue from 2. Count includes the header (+1).
    expect(grid).toHaveAttribute('aria-rowcount', String(productRows.length + 1))
    expect(grid).toHaveAttribute('aria-multiselectable', 'true')
    expect(screen.getByTestId('grid-header-row')).toHaveAttribute('aria-rowindex', '1')
    expect(screen.getByRole('row', { name: /Widget/ })).toHaveAttribute('aria-rowindex', '2')

    // The selection column occupies colindex 1, so the first data column is 2.
    const selectionCell = screen.getByRole('checkbox', { name: /Select p1/ }).closest('td')!
    expect(selectionCell).toHaveAttribute('aria-colindex', '1')
    expect(screen.getByText('Widget').closest('td')).toHaveAttribute('aria-colindex', '2')
  })

  it('keeps the grid to a single tab stop: rows and header controls are not tab stops', () => {
    renderGrid()
    expect(screen.getByRole('row', { name: /Widget/ })).toHaveAttribute('tabindex', '-1')
    expect(screen.getByRole('button', { name: /Quantity column menu/ })).toHaveAttribute('tabindex', '-1')
    expect(screen.getByRole('button', { name: /Quantity column filter/ })).toHaveAttribute('tabindex', '-1')
  })

  it('opens a header column menu from the keyboard with Alt+ArrowDown', async () => {
    const user = userEvent.setup()
    renderGrid()
    const menuButton = screen.getByRole('button', { name: /Quantity column menu/ })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    screen.getByRole('columnheader', { name: /Quantity/ }).focus()
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}')
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
  })

  it('updates row selection and menu expanded state', async () => {
    renderGrid()
    const row = screen.getByRole('row', { name: /Widget/ })
    expect(row).toHaveAttribute('aria-selected', 'false')
    await userEvent.click(screen.getByRole('checkbox', { name: /Select p1/ }))
    expect(row).toHaveAttribute('aria-selected', 'true')

    const trigger = screen.getByRole('button', { name: /Quantity column menu/ })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await userEvent.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})
