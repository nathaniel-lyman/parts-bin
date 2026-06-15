import { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ACCOUNT_GRID_INITIAL_STATE, accountGlobalFilter, buildAccountGridColumns } from '../../accountGridColumns'
import { DataGrid } from '../DataGrid'
import { DEFAULT_STATE } from '../state'
import type { LedgerGridColumn, LedgerGridState } from '../types'
import type { Account } from '../../../data/types'

const accounts: Account[] = [
  { id: '1', name: 'Acme', owner: 'Dana', segment: 'Enterprise', mrr: 30, growth: 5, status: 'Active', arr: 360, since: '2022-01-01' },
  { id: '2', name: 'Beta', owner: 'Lee', segment: 'Startup', mrr: 10, growth: -2, status: 'At risk', arr: 120, since: '2023-06-01' },
  { id: '3', name: 'Cyan', owner: 'Mo', segment: 'Mid-market', mrr: 20, growth: 0, status: 'Active', arr: 240, since: '2021-03-01' },
]

const common = {
  rows: accounts,
  columns: buildAccountGridColumns(vi.fn(), vi.fn()),
  getRowId: (row: Account) => row.id,
  globalFilterFn: accountGlobalFilter,
}

describe('DataGrid (uncontrolled, account table)', () => {
  it('preserves TanStack default cell rendering when no custom cell renderer is provided', () => {
    interface Row { id: string; name: string }
    const rows: Row[] = [{ id: '1', name: 'Default renderer value' }]
    const columns: LedgerGridColumn<Row>[] = [
      { id: 'name', accessorKey: 'name', header: 'Name' },
    ]

    render(
      <DataGrid<Row>
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        initialState={{
          ...DEFAULT_STATE,
          sorting: [],
          columnOrder: ['name'],
          columnVisibility: {},
          columnPinning: { left: [], right: [] },
        }}
      />,
    )

    expect(screen.getByText('Default renderer value')).toBeInTheDocument()
  })

  it('layers pinned headers above pinned body cells', () => {
    render(
      <DataGrid<Account>
        {...common}
        initialState={{
          ...DEFAULT_STATE,
          columnPinning: { left: ['account'], right: ['actions'] },
        }}
      />,
    )

    expect(screen.getByTestId('col-header-account').style.zIndex).toBe('30')
    expect(screen.getByTestId('col-header-actions').style.zIndex).toBe('30')
  })

  it('renders the default visible columns and hides arr/since by default', () => {
    render(<DataGrid<Account> {...common} initialState={ACCOUNT_GRID_INITIAL_STATE} />)
    expect(screen.getByRole('columnheader', { name: /Account/ })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /MRR/ })).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'ARR' })).toBeNull()
    expect(screen.queryByRole('columnheader', { name: 'Since' })).toBeNull()
  })

  it('renders rows sorted by mrr desc by default', () => {
    render(<DataGrid<Account> {...common} initialState={ACCOUNT_GRID_INITIAL_STATE} />)
    const rows = screen.getAllByRole('row').slice(1)
    expect(within(rows[0]).getByText('Acme')).toBeInTheDocument()
    expect(within(rows[2]).getByText('Beta')).toBeInTheDocument()
  })

  it('flipping columnVisibility shows arr/since', () => {
    render(
      <DataGrid<Account>
        {...common}
        initialState={{ ...ACCOUNT_GRID_INITIAL_STATE, columnVisibility: { account: true, arr: true, since: true } }}
      />,
    )
    expect(screen.getByRole('columnheader', { name: /ARR/ })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /Since/ })).toBeInTheDocument()
  })

  it('shows the empty state when no rows match the quick filter', () => {
    render(<DataGrid<Account> {...common} initialState={{ ...ACCOUNT_GRID_INITIAL_STATE, globalFilter: 'zzzzz' }} />)
    expect(screen.getByText(/no results/i)).toBeInTheDocument()
  })

  it('renders the loading component when loading prop is set', () => {
    render(<DataGrid<Account> {...common} initialState={ACCOUNT_GRID_INITIAL_STATE} loading />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders the error component when error prop is set', () => {
    render(<DataGrid<Account> {...common} initialState={ACCOUNT_GRID_INITIAL_STATE} error={new Error('fetch failed')} />)
    expect(screen.getByText(/fetch failed/)).toBeInTheDocument()
  })
})

describe('DataGrid (controlled override)', () => {
  it('controlled state wins and routes transitions through onStateChange', async () => {
    const user = userEvent.setup()

    function Controlled() {
      const [state, setState] = useState<LedgerGridState>({
        ...ACCOUNT_GRID_INITIAL_STATE,
        columnVisibility: { account: true, arr: true, since: false },
      })
      return (
        <DataGrid<Account>
          {...common}
          initialState={{ ...ACCOUNT_GRID_INITIAL_STATE, columnVisibility: { account: true, arr: false, since: false } }}
          state={state}
          onStateChange={setState}
        />
      )
    }

    render(<Controlled />)
    expect(screen.getByRole('columnheader', { name: /ARR/ })).toBeInTheDocument()
    await user.click(screen.getByRole('columnheader', { name: /MRR/ }))
    const mrr = screen.getByRole('columnheader', { name: /MRR/ })
    expect(['ascending', 'descending']).toContain(mrr.getAttribute('aria-sort'))
  })
})
