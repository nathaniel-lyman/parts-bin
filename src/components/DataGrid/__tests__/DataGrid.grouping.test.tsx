import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { seedAccounts } from '../../../data/accounts'
import { accountGridColumns } from '../../accountGridColumns'
import { DataGrid } from '../DataGrid'

const rows = [
  { ...seedAccounts[0], id: 'r0', name: 'Acct 0', segment: 'Startup' as const, mrr: 100 },
  { ...seedAccounts[1], id: 'r1', name: 'Acct 1', segment: 'Startup' as const, mrr: 300 },
  { ...seedAccounts[2], id: 'r2', name: 'Acct 2', segment: 'Enterprise' as const, mrr: 1000 },
]

function renderGrid() {
  return render(
    <DataGrid
      rows={rows}
      columns={accountGridColumns({ onEdit: vi.fn(), onDelete: vi.fn() })}
      getRowId={(row) => row.id}
      initialState={{ sorting: [] }}
      enableGrouping
    />,
  )
}

async function groupBySegment() {
  await userEvent.click(screen.getByRole('button', { name: 'Segment column menu' }))
  await userEvent.click(screen.getByRole('menuitem', { name: 'Group by Segment' }))
}

describe('DataGrid grouping & aggregation', () => {
  it('column menu groups rows, renders group rows with counts and inline aggregates', async () => {
    const { container } = renderGrid()
    await groupBySegment()

    const groupRows = container.querySelectorAll('tr[data-row-grouped="true"]')
    expect(groupRows).toHaveLength(2)

    const startupGroup = container.querySelector<HTMLElement>('tr[data-row-id="segment:Startup"]')
    expect(startupGroup).not.toBeNull()
    expect(within(startupGroup!).getByText('Startup')).toBeInTheDocument()
    expect(within(startupGroup!).getByText('(2)')).toBeInTheDocument()
    // Inline aggregate: sum of grouped MRR.
    expect(within(startupGroup!).getByText('$400')).toBeInTheDocument()

    // Leaf rows are visible because grouping starts fully expanded.
    expect(container.querySelector('tr[data-row-id="r0"]')).not.toBeNull()
  })

  it('shows grouping chips and removes grouping from the chip', async () => {
    const { container } = renderGrid()
    await groupBySegment()

    const chips = screen.getByTestId('grouping-chips')
    expect(within(chips).getByText('Segment')).toBeInTheDocument()

    await userEvent.click(within(chips).getByRole('button', { name: 'Remove grouping by Segment' }))
    expect(screen.queryByTestId('grouping-chips')).not.toBeInTheDocument()
    expect(container.querySelectorAll('tr[data-row-grouped="true"]')).toHaveLength(0)
  })

  it('clicking a group row collapses and re-expands its leaf rows', async () => {
    const { container } = renderGrid()
    await groupBySegment()

    const startupGroup = () => container.querySelector<HTMLElement>('tr[data-row-id="segment:Startup"]')!
    await userEvent.click(startupGroup())
    expect(container.querySelector('tr[data-row-id="r0"]')).toBeNull()
    // Other group unaffected.
    expect(container.querySelector('tr[data-row-id="r2"]')).not.toBeNull()

    await userEvent.click(startupGroup())
    expect(container.querySelector('tr[data-row-id="r0"]')).not.toBeNull()
  })

  it('renders an aggregation footer with totals over filtered rows', async () => {
    renderGrid()

    const footer = screen.getByTestId('grid-aggregation-footer')
    expect(within(footer).getByTestId('agg-footer-mrr')).toHaveTextContent('$1,400')
    expect(within(footer).getByTestId('agg-footer-account')).toHaveTextContent('3 rows')

    // Filter down and the totals follow.
    await userEvent.type(screen.getByRole('searchbox', { name: 'Quick filter' }), 'Acct 0')
    expect(within(screen.getByTestId('grid-aggregation-footer')).getByTestId('agg-footer-mrr')).toHaveTextContent('$100')
  })

  it('renders custom aggregates in group rows and the totals footer', async () => {
    const columns = accountGridColumns({ onEdit: vi.fn(), onDelete: vi.fn() }).map((column) => column.id === 'mrr'
      ? {
          ...column,
          aggregate: ({ rows: aggregateRows }: { rows: typeof rows }) => aggregateRows.reduce((max, row) => Math.max(max, row.mrr), 0),
        }
      : column)
    const { container } = render(
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        initialState={{ sorting: [] }}
        enableGrouping
      />,
    )

    await groupBySegment()

    const startupGroup = container.querySelector<HTMLElement>('tr[data-row-id="segment:Startup"]')
    expect(startupGroup).not.toBeNull()
    expect(within(startupGroup!).getByText('$300')).toBeInTheDocument()
    expect(within(screen.getByTestId('grid-aggregation-footer')).getByTestId('agg-footer-mrr')).toHaveTextContent('fx$1,000')
  })

  it('group rows do not render selection checkboxes or copy affordances', async () => {
    const { container } = render(
      <DataGrid
        rows={rows}
        columns={accountGridColumns({ onEdit: vi.fn(), onDelete: vi.fn() })}
        getRowId={(row) => row.id}
        initialState={{ sorting: [] }}
        enableGrouping
        enableRowSelection
      />,
    )
    await groupBySegment()

    const startupGroup = container.querySelector<HTMLElement>('tr[data-row-id="segment:Startup"]')!
    expect(within(startupGroup).queryByRole('checkbox')).not.toBeInTheDocument()
    expect(within(startupGroup).queryByLabelText('Copy cell value')).not.toBeInTheDocument()
  })
})
