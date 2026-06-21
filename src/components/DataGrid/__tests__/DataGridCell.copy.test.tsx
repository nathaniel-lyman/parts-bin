import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import type { Account } from '../../../data/types'
import { accountGlobalFilter, accountGridColumns } from '../../accountGridColumns'
import { DataGrid } from '../DataGrid'

const rows: Account[] = [
  { id: 'a1', name: 'Acme', owner: 'Dana', segment: 'Enterprise', mrr: 900, growth: 5, status: 'Active', arr: 10800, since: '2021-01-01' },
  { id: 'a2', name: 'Beta', owner: 'Lee', segment: 'Startup', mrr: 300, growth: -2, status: 'At risk', arr: 3600, since: '2022-02-02' },
]

let writeText: ReturnType<typeof vi.fn>

beforeEach(() => {
  writeText = vi.fn().mockResolvedValue(undefined)
  Object.assign(navigator, { clipboard: { writeText } })
})

function renderGrid() {
  return render(
    <DataGrid<Account>
      rows={rows}
      columns={accountGridColumns({ onEdit: vi.fn(), onDelete: vi.fn() })}
      getRowId={(row) => row.id}
      globalFilterFn={accountGlobalFilter}
      enableRowSelection
    />,
  )
}

describe('DataGridCell hover + copy button', () => {
  it('data cells host the copy-reveal group; row hover is the neutral surface tint', () => {
    renderGrid()
    const cell = screen.getByText('Acme').closest('td')!
    // The copy button reveals on the cell group; hover highlight now lives on the row (surface-2),
    // with accent-soft reserved for selection/range so the two reads never collide.
    expect(cell.className).toContain('group/cell')
    expect(cell.className).not.toContain('hover:bg-accent-soft')
    const row = cell.closest('tr')!
    expect(row.className).toContain('hover:bg-surface-2')
  })

  it('renders a copy button in data cells but not in the actions column', () => {
    renderGrid()
    const acmeCell = screen.getByText('Acme').closest('td')!
    expect(acmeCell.querySelector('button[aria-label="Copy cell value"]')).not.toBeNull()
    const actionsCell = document.querySelector('td[data-column-id="actions"]')!
    expect(actionsCell.querySelector('button[aria-label="Copy cell value"]')).toBeNull()
  })

  it('clicking the copy button copies the raw cell value without toggling row selection', () => {
    renderGrid()
    const acmeCell = screen.getByText('Acme').closest('td')!
    const button = acmeCell.querySelector<HTMLButtonElement>('button[aria-label="Copy cell value"]')!
    fireEvent.click(button)
    expect(writeText).toHaveBeenCalledWith('Acme')
    // Row click toggles selection when enableRowSelection is on; the button must not bubble to it.
    expect(screen.getByRole('checkbox', { name: 'Select Acme' })).not.toBeChecked()
  })

  it('the copy button is not tab-focusable (keyboard users copy with Ctrl/Cmd+C)', () => {
    renderGrid()
    const acmeCell = screen.getByText('Acme').closest('td')!
    const button = acmeCell.querySelector<HTMLButtonElement>('button[aria-label="Copy cell value"]')!
    expect(button.tabIndex).toBe(-1)
  })

  it('Enter still fires the row primary action (edit), not the new copy button', () => {
    const onEdit = vi.fn()
    render(
      <DataGrid<Account>
        rows={rows}
        columns={accountGridColumns({ onEdit, onDelete: vi.fn() })}
        getRowId={(row) => row.id}
        globalFilterFn={accountGlobalFilter}
        enableRowSelection
      />,
    )
    // Default keyboard focus is cell (0,0); Enter clicks the row's first non-copy button (Edit).
    const cell = document.querySelector<HTMLElement>('td[data-row-index="0"][data-col-index="0"]')!
    fireEvent.focus(cell)
    fireEvent.keyDown(cell, { key: 'Enter' })
    expect(onEdit).toHaveBeenCalled()
    expect(writeText).not.toHaveBeenCalled()
  })
})
