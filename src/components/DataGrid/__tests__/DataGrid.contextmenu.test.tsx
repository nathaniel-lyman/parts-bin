import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

describe('DataGrid context menu + copy', () => {
  it('right-clicking a cell opens the context menu and can copy the raw cell value', async () => {
    renderGrid()
    fireEvent.contextMenu(screen.getByText('Acme'))
    await userEvent.click(await screen.findByRole('menuitem', { name: /copy cell/i }))
    expect(writeText).toHaveBeenCalledWith('Acme')
  })

  it('Copy row writes visible exportable columns as one raw TSV line', async () => {
    renderGrid()
    fireEvent.contextMenu(screen.getByText('Acme'))
    await userEvent.click(await screen.findByRole('menuitem', { name: /copy row/i }))
    expect(writeText).toHaveBeenCalledWith('Acme\tDana\tEnterprise\t900\t5\tActive')
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
    expect(writeText).toHaveBeenCalledWith('Account\tOwner\tSegment\tMRR\tGrowth\tStatus\nBeta\tLee\tStartup\t300\t-2\tAt risk')

    writeText.mockClear()
    const search = screen.getByRole('searchbox', { name: /quick filter/i })
    search.focus()
    fireEvent.keyDown(search, { key: 'c', ctrlKey: true })
    expect(writeText).not.toHaveBeenCalled()
  })
})
