import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DataGrid } from '../DataGrid'
import { DEFAULT_STATE } from '../state'
import type { DataGridColumn } from '../types'

interface Row { id: string; name: string; qty: number }

const columns: DataGridColumn<Row>[] = [
  { id: 'name', accessorKey: 'name', header: 'Name', type: 'text', meta: { type: 'text' } },
  { id: 'qty', accessorKey: 'qty', header: 'Qty', type: 'number', align: 'right', meta: { type: 'number' } },
]

const rows: Row[] = [
  { id: '1', name: 'Acme', qty: 5 },
  { id: '2', name: 'Beta', qty: 25 },
  { id: '3', name: 'Gamma', qty: 50 },
]

describe('two-condition AND/OR filter', () => {
  it('AND-combines two conditions set in the column menu', async () => {
    const user = userEvent.setup()
    render(<DataGrid rows={rows} columns={columns} getRowId={(row) => row.id} />)

    await user.click(screen.getByRole('button', { name: /qty column menu/i }))
    await user.click(within(screen.getByRole('menu', { name: /qty column menu/i })).getByRole('menuitem', { name: 'Filter' }))
    const dialog = screen.getByRole('dialog', { name: /qty filter/i })

    // Condition 1: >= 10
    await user.selectOptions(within(dialog).getByLabelText(/qty filter operator/i), 'gte')
    await user.type(within(dialog).getByLabelText(/qty filter value/i), '10')
    // Condition 2: <= 40
    await user.click(within(dialog).getByRole('button', { name: /add condition/i }))
    await user.selectOptions(within(dialog).getByLabelText(/qty second filter operator/i), 'lte')
    await user.type(within(dialog).getByLabelText(/qty second filter value/i), '40')

    // Only qty in [10,40] survives the AND.
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.queryByText('Acme')).toBeNull()
    expect(screen.queryByText('Gamma')).toBeNull()
  })

  it('removing the second condition reverts to a single condition', async () => {
    const user = userEvent.setup()
    render(
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        initialState={{ ...DEFAULT_STATE, columnFilters: [{ id: 'qty', value: { operator: 'gte', value: '10', conjunction: 'and', condition2: { operator: 'lte', value: '40' } } }] }}
      />,
    )
    // Both conditions active → only Beta.
    expect(screen.queryByText('Gamma')).toBeNull()

    await user.click(screen.getByRole('button', { name: /qty column menu/i }))
    await user.click(within(screen.getByRole('menu', { name: /qty column menu/i })).getByRole('menuitem', { name: 'Filter' }))
    await user.click(within(screen.getByRole('dialog', { name: /qty filter/i })).getByRole('button', { name: /remove second qty condition/i }))

    // Now just >= 10 → Gamma (50) is back.
    expect(screen.getByText('Gamma')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.queryByText('Acme')).toBeNull()
  })

  it('renders a two-condition filter as a read-only floating chip', async () => {
    const user = userEvent.setup()
    render(
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        enableHeaderFilters
        initialState={{ ...DEFAULT_STATE, columnFilters: [{ id: 'qty', value: { operator: 'gte', value: '10', conjunction: 'and', condition2: { operator: 'lte', value: '40' } } }] }}
      />,
    )
    await user.click(screen.getByRole('button', { name: /filters/i }))
    expect(screen.queryByRole('spinbutton', { name: /filter qty/i })).toBeNull()
    expect(screen.getByText(/≥ 10 AND ≤ 40/)).toBeInTheDocument()
  })
})
