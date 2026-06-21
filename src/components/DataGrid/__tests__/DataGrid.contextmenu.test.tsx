import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

function renderGrid() {
  return render(
    <DataGrid<Account>
      rows={rows}
      columns={accountGridColumns({ onEdit: vi.fn(), onDelete: vi.fn() })}
      getRowId={(row) => row.id}
      globalFilterFn={accountGlobalFilter}
      enableRowSelection
      initialState={ACCOUNT_GRID_INITIAL_STATE}
    />,
  )
}

describe('DataGrid context menu + copy', () => {
  it('right-clicking a cell opens the context menu and can copy the raw cell value', async () => {
    renderGrid()
    fireEvent.contextMenu(screen.getByText('Acme'))
    await userEvent.click(await screen.findByRole('menuitem', { name: /copy cell/i }))
    expect(writeText).toHaveBeenCalledWith('Acme')
  })

  it('Copy row writes visible exportable columns as one formatted TSV line', async () => {
    renderGrid()
    fireEvent.contextMenu(screen.getByText('Acme'))
    await userEvent.click(await screen.findByRole('menuitem', { name: /copy row/i }))
    expect(writeText).toHaveBeenCalledWith('Acme\tDana\tEnterprise\t$900\t5.0%\tActive')
  })

  it('number format overrides update visible cells and copied rows', async () => {
    renderGrid()
    await userEvent.click(screen.getByRole('button', { name: /value column menu/i }))
    await userEvent.click(await screen.findByRole('menuitem', { name: /number format/i }))
    fireEvent.change(screen.getByLabelText(/value number format minimum decimals/i), { target: { value: '2' } })

    expect(await screen.findByText('$900.00')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /close value number format/i }))

    fireEvent.contextMenu(screen.getByText('Acme'))
    await userEvent.click(await screen.findByRole('menuitem', { name: /copy row/i }))
    expect(writeText).toHaveBeenCalledWith('Acme\tDana\tEnterprise\t$900.00\t5.0%\tActive')
  })

  it('Copy selection (N) shows the count of rows actually copied: selected AND visible', async () => {
    renderGrid()
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select Acme' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select Beta' }))
    // Beta stays selected but is filtered out, so only 1 row would actually be copied.
    await userEvent.type(screen.getByRole('searchbox', { name: /quick filter/i }), 'Acme')
    fireEvent.contextMenu(screen.getByText('Acme'))
    expect(await screen.findByRole('menuitem', { name: /copy selection \(1\)/i })).toBeInTheDocument()
  })

  it('Ctrl+C with a selection copies selection TSV, but not from the quick-filter searchbox', async () => {
    renderGrid()
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select Beta' }))
    fireEvent.keyDown(window, { key: 'c', ctrlKey: true })
    expect(writeText).toHaveBeenCalledWith('Account\tOwner\tSegment\tValue\tGrowth\tStatus\nBeta\tLee\tStartup\t$300\t-2.0%\tAt risk')

    writeText.mockClear()
    const search = screen.getByRole('searchbox', { name: /quick filter/i })
    search.focus()
    fireEvent.keyDown(search, { key: 'c', ctrlKey: true })
    expect(writeText).not.toHaveBeenCalled()
  })

  it('pins and unpins rows from the row context menu', async () => {
    const { container } = renderGrid()
    fireEvent.contextMenu(screen.getByText('Beta'))
    await userEvent.click(await screen.findByRole('menuitem', { name: /pin row to top/i }))

    await waitFor(() => {
      expect(container.querySelector('[data-testid="grid-row-a2"][data-row-pinned="top"]')).not.toBeNull()
    })

    const pinnedNameCell = container.querySelector<HTMLElement>('[data-testid="grid-row-a2"][data-row-pinned="top"] [data-column-id="account"]')
    if (!pinnedNameCell) throw new Error('Pinned Beta name cell not found')

    fireEvent.contextMenu(pinnedNameCell)
    expect(await screen.findByRole('menuitem', { name: /unpin row/i })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /pin row to top/i })).toBeNull()
    await userEvent.click(screen.getByRole('menuitem', { name: /unpin row/i }))

    await waitFor(() => {
      expect(container.querySelector('[data-testid="grid-row-a2"][data-row-pinned="top"]')).toBeNull()
    })
  })
})
