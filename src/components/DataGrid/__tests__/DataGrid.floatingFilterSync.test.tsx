import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DataGrid } from '../DataGrid'
import { DEFAULT_STATE } from '../state'
import type { DataGridColumn, DataGridState } from '../types'

interface Row { id: string; name: string; qty: number }

const columns: DataGridColumn<Row>[] = [
  { id: 'name', accessorKey: 'name', header: 'Name', type: 'text', meta: { type: 'text' } },
  { id: 'qty', accessorKey: 'qty', header: 'Qty', type: 'number', align: 'right', meta: { type: 'number' } },
]

const rows: Row[] = [
  { id: '1', name: 'Acme', qty: 5 },
  { id: '2', name: 'Beta', qty: 50 },
]

function renderGrid(filters: DataGridState['columnFilters']) {
  return render(
    <DataGrid
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id}
      enableHeaderFilters
      initialState={{ ...DEFAULT_STATE, columnFilters: filters }}
    />,
  )
}

describe('floating filter sync', () => {
  it('preserves the operator the menu set (greaterThan), not resetting to equals', async () => {
    const user = userEvent.setup()
    renderGrid([{ id: 'qty', value: { operator: 'greaterThan', value: '40' } }])
    await user.click(screen.getByRole('button', { name: /filters/i }))

    // greaterThan 40 → only Beta (50). The floating input reflects the current value.
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.queryByText('Acme')).toBeNull()
    const input = screen.getByRole('spinbutton', { name: /filter qty/i })
    expect(input).toHaveValue(40)

    // Editing to 4 must stay greaterThan (both rows > 4). If it had reset to equals, nothing matches 4.
    await user.clear(input)
    await user.type(input, '4')
    fireEvent.blur(input)
    await waitFor(() => expect(screen.getByText('Acme')).toBeInTheDocument())
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('shows a read-only chip (not an editable input) for a between filter, with a clear button', async () => {
    const user = userEvent.setup()
    renderGrid([{ id: 'qty', value: { operator: 'between', value: ['10', '40'] } }])
    await user.click(screen.getByRole('button', { name: /filters/i }))

    // The complex filter is summarized, not offered as an inline input that would clobber it.
    expect(screen.queryByRole('spinbutton', { name: /filter qty/i })).toBeNull()
    expect(screen.getByText(/10\s+–\s+40/)).toBeInTheDocument()

    // Clearing it from the chip restores an editable inline input.
    await user.click(screen.getByRole('button', { name: /clear qty filter/i }))
    expect(screen.getByRole('spinbutton', { name: /filter qty/i })).toBeInTheDocument()
  })

  it('summarizes a valueless filter (blank) as a chip', async () => {
    const user = userEvent.setup()
    renderGrid([{ id: 'name', value: { operator: 'blank', value: true } }])
    await user.click(screen.getByRole('button', { name: /filters/i }))
    expect(screen.queryByRole('textbox', { name: /filter name/i })).toBeNull()
    expect(screen.getByText('Is blank')).toBeInTheDocument()
  })
})
