import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import type { Account } from '../../../data/types'
import { ACCOUNT_GRID_INITIAL_STATE, accountGlobalFilter, accountGridColumns } from '../../accountGridColumns'
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

function renderGrid(onRowUpdate = vi.fn()) {
  const utils = render(
    <DataGrid<Account>
      rows={rows}
      columns={accountGridColumns({ onEdit: vi.fn(), onDelete: vi.fn() })}
      getRowId={(row) => row.id}
      globalFilterFn={accountGlobalFilter}
      initialState={{ ...ACCOUNT_GRID_INITIAL_STATE, sorting: [] }}
      onRowUpdate={onRowUpdate}
    />,
  )
  return { ...utils, onRowUpdate }
}

function cell(container: HTMLElement, row: number, col: number): HTMLElement {
  const el = container.querySelector<HTMLElement>(`td[data-row-index="${row}"][data-col-index="${col}"]`)
  if (!el) throw new Error(`cell ${row}/${col} not found`)
  return el
}

function paste(text: string) {
  const event = new Event('paste', { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'clipboardData', {
    value: { getData: (type: string) => (type === 'text/plain' ? text : '') },
  })
  window.dispatchEvent(event)
}

describe('DataGrid cell range selection', () => {
  it('drag-selects a rectangular range and copies it as TSV', () => {
    const { container } = renderGrid()

    fireEvent.mouseDown(cell(container, 0, 0), { button: 0 })
    fireEvent.mouseEnter(cell(container, 1, 1))
    fireEvent.mouseUp(window)
    fireEvent.keyDown(window, { key: 'c', ctrlKey: true })

    expect(cell(container, 0, 0)).toHaveAttribute('aria-selected', 'true')
    expect(cell(container, 1, 1)).toHaveAttribute('aria-selected', 'true')
    // The copied range carries a header row for the copied columns.
    expect(writeText).toHaveBeenCalledWith('Account\tOwner\nAcme\tDana\nBeta\tLee')
  })

  it('copies a range with column headers and formatted currency/percent values', () => {
    const { container } = renderGrid()

    // Value (col 3) → Growth (col 4) over both rows.
    fireEvent.mouseDown(cell(container, 0, 3), { button: 0 })
    fireEvent.mouseEnter(cell(container, 1, 4))
    fireEvent.mouseUp(window)
    fireEvent.keyDown(window, { key: 'c', ctrlKey: true })

    expect(writeText).toHaveBeenCalledWith('Value\tGrowth\n$900\t5.0%\n$300\t-2.0%')
  })

  it('pastes spreadsheet text into editable cells from the active cell', () => {
    const { container, onRowUpdate } = renderGrid()

    fireEvent.mouseDown(cell(container, 0, 1), { button: 0 })
    fireEvent.mouseUp(window)
    paste('Nora\tMid-market\nMika\tEnterprise')

    expect(onRowUpdate).toHaveBeenCalledTimes(2)
    expect(onRowUpdate).toHaveBeenNthCalledWith(1, 'a1', { owner: 'Nora', segment: 'Mid-market' }, rows[0])
    expect(onRowUpdate).toHaveBeenNthCalledWith(2, 'a2', { owner: 'Mika', segment: 'Enterprise' }, rows[1])
  })

  it('pastes a formatted currency value back into a number cell (copy round-trip)', () => {
    const { container, onRowUpdate } = renderGrid()

    // Focus the Acme/Value cell (col 3) and paste a formatted figure from the clipboard.
    fireEvent.mouseDown(cell(container, 0, 3), { button: 0 })
    fireEvent.mouseUp(window)
    paste('$1,000')

    expect(onRowUpdate).toHaveBeenCalledTimes(1)
    expect(onRowUpdate).toHaveBeenCalledWith('a1', { mrr: 1000 }, rows[0])
  })
})
