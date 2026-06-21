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
