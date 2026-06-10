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

describe('Ctrl/Cmd+C on the focused cell', () => {
  it('copies the focused cell value when focus is inside the grid and nothing is selected', () => {
    renderGrid()
    // Focus the Beta/Owner cell via the grid's own focus mechanism (row 1, col 1 = Owner).
    const cell = document.querySelector<HTMLElement>('td[data-row-index="1"][data-col-index="1"]')!
    fireEvent.focus(cell)
    cell.focus()
    fireEvent.keyDown(window, { key: 'c', ctrlKey: true })
    expect(writeText).toHaveBeenCalledWith('Lee')
  })

  it('does nothing when focus is on a toolbar control inside the grid', () => {
    renderGrid()
    const columnsButton = screen.getByRole('button', { name: /columns/i })
    columnsButton.focus()
    fireEvent.keyDown(window, { key: 'c', ctrlKey: true })
    expect(writeText).not.toHaveBeenCalled()
  })

  it('does nothing when focus is outside the grid', () => {
    renderGrid()
    document.body.focus()
    fireEvent.keyDown(window, { key: 'c', ctrlKey: true })
    expect(writeText).not.toHaveBeenCalled()
  })

  it('yields to native copy when page text is selected', () => {
    renderGrid()
    const cell = document.querySelector<HTMLElement>('td[data-row-index="0"][data-col-index="0"]')!
    fireEvent.focus(cell)
    cell.focus()
    // Simulate a non-collapsed native text selection over the cell's text node.
    const range = document.createRange()
    range.selectNodeContents(cell)
    const selection = window.getSelection()!
    selection.removeAllRanges()
    selection.addRange(range)
    fireEvent.keyDown(window, { key: 'c', ctrlKey: true })
    expect(writeText).not.toHaveBeenCalled()
    selection.removeAllRanges()
  })

  it('selection copy still wins when rows are selected', () => {
    renderGrid()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Beta' }))
    fireEvent.keyDown(window, { key: 'c', ctrlKey: true })
    expect(writeText).toHaveBeenCalledWith('Account\tOwner\tSegment\tMRR\tGrowth\tStatus\nBeta\tLee\tStartup\t300\t-2\tAt risk')
  })

  it('does nothing when the focused cell is the actions column', () => {
    renderGrid()
    const cell = document.querySelector<HTMLElement>('td[data-row-index="0"][data-column-id="actions"]')!
    fireEvent.focus(cell)
    cell.focus()
    fireEvent.keyDown(window, { key: 'c', ctrlKey: true })
    expect(writeText).not.toHaveBeenCalled()
  })
})
