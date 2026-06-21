import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import type { Account } from '../../../data/types'
import { ACCOUNT_GRID_INITIAL_STATE, accountGlobalFilter, accountGridColumns } from '../../accountGridColumns'
import { DataGrid } from '../DataGrid'

const rows: Account[] = [
  { id: 'a1', name: 'Acme', owner: 'Dana', segment: 'Enterprise', mrr: 900, growth: 5, status: 'Active', arr: 10800, since: '2021-01-01' },
  { id: 'a2', name: 'Beta', owner: 'Lee', segment: 'Startup', mrr: 300, growth: -2, status: 'At risk', arr: 3600, since: '2022-02-02' },
]

beforeEach(() => {
  Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
})

function renderGrid(opts: { editable?: boolean } = {}) {
  const onRowUpdate = vi.fn()
  const utils = render(
    <DataGrid<Account>
      rows={rows}
      columns={accountGridColumns({ onEdit: vi.fn(), onDelete: vi.fn() })}
      getRowId={(row) => row.id}
      globalFilterFn={accountGlobalFilter}
      initialState={{ ...ACCOUNT_GRID_INITIAL_STATE, sorting: [] }}
      onRowUpdate={opts.editable === false ? undefined : onRowUpdate}
    />,
  )
  return { ...utils, onRowUpdate }
}

function cell(container: HTMLElement, row: number, col: number): HTMLElement {
  const el = container.querySelector<HTMLElement>(`td[data-row-index="${row}"][data-col-index="${col}"]`)
  if (!el) throw new Error(`cell ${row}/${col} not found`)
  return el
}

function selectRange(container: HTMLElement, from: [number, number], to: [number, number]) {
  fireEvent.mouseDown(cell(container, from[0], from[1]), { button: 0 })
  fireEvent.mouseEnter(cell(container, to[0], to[1]))
  fireEvent.mouseUp(window)
}

describe('DataGrid range fill handle', () => {
  it('renders the fill handle only on a multi-cell range corner', () => {
    const { container } = renderGrid()
    // No range yet → no handle anywhere.
    expect(container.querySelector('[data-testid="fill-handle"]')).toBeNull()

    selectRange(container, [0, 1], [1, 2])
    // Exactly one handle, on the bottom-right corner cell of the range.
    const handles = container.querySelectorAll('[data-testid="fill-handle"]')
    expect(handles).toHaveLength(1)
    expect(cell(container, 1, 2).querySelector('[data-testid="fill-handle"]')).not.toBeNull()
  })

  it('does not render the handle for a single focused cell', () => {
    const { container } = renderGrid()
    fireEvent.mouseDown(cell(container, 0, 1), { button: 0 })
    fireEvent.mouseUp(window)
    expect(container.querySelector('[data-testid="fill-handle"]')).toBeNull()
  })

  it('fills the range from each column anchor-row value, leaving the source row unchanged', () => {
    const { container, onRowUpdate } = renderGrid()
    selectRange(container, [0, 1], [1, 2]) // owner + segment, both rows

    fireEvent.click(cell(container, 1, 2).querySelector('[data-testid="fill-handle"]')!)

    // Only the lower row changes; it takes the top (Acme) row's owner + segment.
    expect(onRowUpdate).toHaveBeenCalledTimes(1)
    expect(onRowUpdate).toHaveBeenCalledWith('a2', { owner: 'Dana', segment: 'Enterprise' }, rows[1])
  })

  it('omits the handle entirely when editing is disabled', () => {
    const { container } = renderGrid({ editable: false })
    selectRange(container, [0, 1], [1, 2])
    expect(container.querySelector('[data-testid="fill-handle"]')).toBeNull()
  })
})
