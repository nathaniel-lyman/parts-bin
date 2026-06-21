import { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DataGrid } from '../DataGrid'
import { DEFAULT_STATE } from '../state'
import type { DataGridColumn, DataGridState } from '../types'
import { PRODUCT_GRID_INITIAL_STATE, productColumns, productGlobalFilter, productRows, type ProductRow } from './fixtures'

const common = {
  rows: productRows,
  columns: productColumns,
  getRowId: (row: ProductRow) => row.id,
  globalFilterFn: productGlobalFilter,
}

describe('DataGrid (uncontrolled, generic product table)', () => {
  it('preserves TanStack default cell rendering when no custom cell renderer is provided', () => {
    interface Row { id: string; name: string }
    const rows: Row[] = [{ id: '1', name: 'Default renderer value' }]
    const columns: DataGridColumn<Row>[] = [
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
      <DataGrid<ProductRow>
        {...common}
        initialState={{
          ...DEFAULT_STATE,
          columnPinning: { left: ['title'], right: ['actions'] },
        }}
      />,
    )

    expect(screen.getByTestId('col-header-title').style.zIndex).toBe('30')
    expect(screen.getByTestId('col-header-actions').style.zIndex).toBe('30')
  })

  it('renders the default visible columns and hides optional generic columns by default', () => {
    render(<DataGrid<ProductRow> {...common} initialState={PRODUCT_GRID_INITIAL_STATE} />)
    expect(screen.getByRole('columnheader', { name: /Title/ })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /Quantity/ })).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Score' })).toBeNull()
    expect(screen.queryByRole('columnheader', { name: 'Updated' })).toBeNull()
  })

  it('renders rows sorted by quantity desc by default', () => {
    render(<DataGrid<ProductRow> {...common} initialState={PRODUCT_GRID_INITIAL_STATE} />)
    const rows = screen.getAllByRole('row').slice(1)
    expect(within(rows[0]).getByText('Widget')).toBeInTheDocument()
    expect(within(rows[2]).getByText('Gadget')).toBeInTheDocument()
  })

  it('flipping columnVisibility shows hidden generic columns', () => {
    render(
      <DataGrid<ProductRow>
        {...common}
        initialState={{ ...PRODUCT_GRID_INITIAL_STATE, columnVisibility: { title: true, score: true, updatedAt: true } }}
      />,
    )
    expect(screen.getByRole('columnheader', { name: /Score/ })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /Updated/ })).toBeInTheDocument()
  })

  it('shows the empty state when no rows match the quick filter', () => {
    render(<DataGrid<ProductRow> {...common} initialState={{ ...PRODUCT_GRID_INITIAL_STATE, globalFilter: 'zzzzz' }} />)
    expect(screen.getByText(/no results/i)).toBeInTheDocument()
  })

  it('renders the loading component when loading prop is set', () => {
    render(<DataGrid<ProductRow> {...common} initialState={PRODUCT_GRID_INITIAL_STATE} loading />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders the error component when error prop is set', () => {
    render(<DataGrid<ProductRow> {...common} initialState={PRODUCT_GRID_INITIAL_STATE} error={new Error('fetch failed')} />)
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
  const productColumns: DataGridColumn<Product>[] = [
    { id: 'title', accessorKey: 'title', header: 'Title' },
    { id: 'sku', accessorKey: 'sku', header: 'SKU' },
    { id: 'price', accessorKey: 'price', header: 'Price', meta: { type: 'number' } },
  ]
  const foreignState = (overrides: Partial<DataGridState> = {}): DataGridState => ({
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
      const [state, setState] = useState<DataGridState>({
        ...PRODUCT_GRID_INITIAL_STATE,
        columnVisibility: { title: true, score: true, updatedAt: false },
      })
      return (
        <DataGrid<ProductRow>
          {...common}
          initialState={{ ...PRODUCT_GRID_INITIAL_STATE, columnVisibility: { title: true, score: false, updatedAt: false } }}
          state={state}
          onStateChange={setState}
        />
      )
    }

    render(<Controlled />)
    expect(screen.getByRole('columnheader', { name: /Score/ })).toBeInTheDocument()
    await user.click(screen.getByRole('columnheader', { name: /Quantity/ }))
    const quantity = screen.getByRole('columnheader', { name: /Quantity/ })
    expect(['ascending', 'descending']).toContain(quantity.getAttribute('aria-sort'))
  })
})
