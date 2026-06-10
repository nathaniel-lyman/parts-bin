import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Account } from '../../../data/types'
import { ToastContext, type ToastPush } from '../../ui'
import { accountGlobalFilter, accountGridColumns } from '../../accountGridColumns'
import { DataGrid } from '../DataGrid'

const rows: Account[] = [
  { id: 'a1', name: 'Acme', owner: 'Dana', segment: 'Enterprise', mrr: 900, growth: 5, status: 'Active', arr: 10800, since: '2021-01-01' },
  { id: 'a2', name: 'Beta', owner: 'Lee', segment: 'Startup', mrr: 300, growth: -2, status: 'At risk', arr: 3600, since: '2022-02-02' },
]

let writeText: ReturnType<typeof vi.fn>
let push: ToastPush & ReturnType<typeof vi.fn>

beforeEach(() => {
  writeText = vi.fn().mockResolvedValue(undefined)
  Object.assign(navigator, { clipboard: { writeText } })
  push = vi.fn() as ToastPush & ReturnType<typeof vi.fn>
})

function renderGrid() {
  return render(
    <ToastContext.Provider value={push}>
      <DataGrid<Account>
        rows={rows}
        columns={accountGridColumns({ onEdit: vi.fn(), onDelete: vi.fn() })}
        getRowId={(row) => row.id}
        globalFilterFn={accountGlobalFilter}
        enableRowSelection
      />
    </ToastContext.Provider>,
  )
}

describe('copy feedback toasts', () => {
  it('copy cell via the hover button fires "Copied cell"', async () => {
    renderGrid()
    const cell = screen.getByText('Acme').closest('td')!
    fireEvent.click(cell.querySelector<HTMLButtonElement>('button[aria-label="Copy cell value"]')!)
    await waitFor(() => expect(push).toHaveBeenCalledWith('Copied cell'))
  })

  it('copy row via the context menu fires "Copied row"', async () => {
    renderGrid()
    fireEvent.contextMenu(screen.getByText('Acme'))
    await userEvent.click(await screen.findByRole('menuitem', { name: /copy row/i }))
    await waitFor(() => expect(push).toHaveBeenCalledWith('Copied row'))
  })

  it('copy selection counts only rows actually copied (selected AND visible)', async () => {
    renderGrid()
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select Acme' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select Beta' }))
    // Filter so only Acme remains visible; Beta stays selected but is not copied.
    await userEvent.type(screen.getByRole('searchbox', { name: /quick filter/i }), 'Acme')
    // Copy is grid-scoped and ignores editable targets — move focus from the searchbox
    // to a grid cell before firing Ctrl+C.
    const cell = document.querySelector<HTMLElement>('td[data-row-index="0"][data-col-index="0"]')!
    fireEvent.focus(cell)
    cell.focus()
    fireEvent.keyDown(window, { key: 'c', ctrlKey: true })
    await waitFor(() => expect(push).toHaveBeenCalledWith('Copied 1 row'))
  })

  it('copy selection with multiple rows uses the plural toast', async () => {
    renderGrid()
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select Acme' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select Beta' }))
    fireEvent.keyDown(window, { key: 'c', ctrlKey: true })
    await waitFor(() => expect(push).toHaveBeenCalledWith('Copied 2 rows'))
  })

  it('does not write or toast when every selected row is filtered out', async () => {
    renderGrid()
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select Acme' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select Beta' }))
    await userEvent.type(screen.getByRole('searchbox', { name: /quick filter/i }), 'Zzz')
    ;(document.activeElement as HTMLElement).blur()
    fireEvent.keyDown(window, { key: 'c', ctrlKey: true })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(writeText).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })

  it('skips the toast when the clipboard write rejects', async () => {
    writeText.mockRejectedValue(new Error('denied'))
    renderGrid()
    const cell = screen.getByText('Acme').closest('td')!
    fireEvent.click(cell.querySelector<HTMLButtonElement>('button[aria-label="Copy cell value"]')!)
    await waitFor(() => expect(writeText).toHaveBeenCalled())
    // Let the rejection's .catch microtask settle before asserting the toast never fired.
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(push).not.toHaveBeenCalled()
  })
})
