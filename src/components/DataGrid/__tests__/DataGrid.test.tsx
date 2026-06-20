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
    expect(screen.getByRole('columnheader', { name: /Value/ })).toBeInTheDocument()
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

// Adoption contract: the generic grid must work for a schema that shares NOTHING
// with the demo Account model — no account/owner/mrr ids and no custom cell
// renderers. Guards against demoware (hardcoded movable ids, `cell: undefined`
// clobbering the default renderer, pinned-header z-index) creeping back into the
// engine. See the 2026-06 partner-feedback triage.
describe('DataGrid (foreign schema contract)', () => {
  interface Product {
    id: string
    title: string
    sku: string
    price: number
  }
  const products: Product[] = [
    { id: 'p1', title: 'Widget', sku: 'WDG-1', price: 30 },
    { id: 'p2', title: 'Gadget', sku: 'GDG-2', price: 10 },
    { id: 'p3', title: 'Gizmo', sku: 'GZM-3', price: 20 },
  ]
  const productColumns: LedgerGridColumn<Product>[] = [
    { id: 'title', accessorKey: 'title', header: 'Title' },
    { id: 'sku', accessorKey: 'sku', header: 'SKU' },
    { id: 'price', accessorKey: 'price', header: 'Price', meta: { type: 'number' } },
  ]
  const foreignState = (overrides: Partial<LedgerGridState> = {}): LedgerGridState => ({
    ...DEFAULT_STATE,
    sorting: [],
    columnOrder: ['title', 'sku', 'price'],
    columnVisibility: {},
    columnPinning: { left: [], right: [] },
    ...overrides,
  })
  const headerIndex = (label: string) =>
    screen.getAllByRole('columnheader').findIndex((th) => th.textContent?.includes(label))

  it('renders every cell with the default renderer — no blank cells', () => {
    render(
      <DataGrid<Product>
        rows={products}
        columns={productColumns}
        getRowId={(row) => row.id}
        initialState={foreignState()}
      />,
    )
    for (const text of ['Widget', 'WDG-1', 'Gadget', 'GDG-2', 'Gizmo', 'GZM-3']) {
      expect(screen.getByText(text)).toBeInTheDocument()
    }
    // numeric column also uses the default renderer; scope to a row so the
    // footer's page-size options (10 / 20 / …) can't collide.
    const widgetRow = screen.getByText('Widget').closest('[role="row"]') as HTMLElement
    expect(within(widgetRow).getByText('30')).toBeInTheDocument()
  })

  it('honors a custom column order for non-demo ids (reorder is not a silent no-op)', () => {
    render(
      <DataGrid<Product>
        rows={products}
        columns={productColumns}
        getRowId={(row) => row.id}
        initialState={foreignState({ columnOrder: ['price', 'title', 'sku'] })}
      />,
    )
    expect(headerIndex('Price')).toBeLessThan(headerIndex('Title'))
    expect(headerIndex('Title')).toBeLessThan(headerIndex('SKU'))
  })

  it('sorts a foreign column on header click', async () => {
    const user = userEvent.setup()
    render(
      <DataGrid<Product>
        rows={products}
        columns={productColumns}
        getRowId={(row) => row.id}
        initialState={foreignState()}
      />,
    )
    const price = screen.getByRole('columnheader', { name: /Price/ })
    expect(price.getAttribute('aria-sort') ?? 'none').toBe('none')
    await user.click(price)
    expect(['ascending', 'descending']).toContain(price.getAttribute('aria-sort'))
  })

  it('pins a foreign column with the expected sticky z-index', () => {
    render(
      <DataGrid<Product>
        rows={products}
        columns={productColumns}
        getRowId={(row) => row.id}
        initialState={foreignState({ columnPinning: { left: ['title'], right: [] } })}
      />,
    )
    expect(screen.getByTestId('col-header-title').style.zIndex).toBe('30')
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
    await user.click(screen.getByRole('columnheader', { name: /Value/ }))
    const mrr = screen.getByRole('columnheader', { name: /Value/ })
    expect(['ascending', 'descending']).toContain(mrr.getAttribute('aria-sort'))
  })
})
