import { useState } from 'react'
import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable } from './DataTable'
import { seedAccounts } from '../../data/accounts'
import { DEFAULT_COLUMNS } from '../../hooks/useColumnVisibility'

const noop = () => {}
const props = {
  accounts: seedAccounts,
  visibility: DEFAULT_COLUMNS,
  onEdit: noop,
  onDelete: noop,
}

test('renders all 8 rows', () => {
  render(<DataTable {...props} />)
  expect(screen.getAllByRole('row').length).toBe(9) // header + 8
})

test('search filters by owner name', async () => {
  render(<DataTable {...props} />)
  await userEvent.type(screen.getByPlaceholderText(/Search/), 'osei')
  expect(screen.getByText('Cobalt Freight')).toBeInTheDocument()
  expect(screen.getByText('Meridian Corp')).toBeInTheDocument()
  expect(screen.queryByText('Quill Analytics')).not.toBeInTheDocument()
  expect(screen.getAllByRole('row')).toHaveLength(3) // header + 2 owner matches
})

test('search filters by account name only', async () => {
  render(<DataTable {...props} />)
  await userEvent.type(screen.getByPlaceholderText(/Search/), 'meridian')
  expect(screen.getByText('Meridian Corp')).toBeInTheDocument()
  expect(screen.getAllByRole('row')).toHaveLength(2) // header + 1
})

test('no-match shows empty state', async () => {
  render(<DataTable {...props} />)
  await userEvent.type(screen.getByPlaceholderText(/Search/), 'zzzqqq')
  expect(screen.getByText(/No results/i)).toBeInTheDocument()
})

test('clear filters from empty state restores all rows', async () => {
  render(<DataTable {...props} />)
  await userEvent.type(screen.getByPlaceholderText(/Search/), 'zzzqqq')
  await userEvent.click(screen.getByRole('button', { name: /clear filters/i }))
  expect(screen.getAllByRole('row')).toHaveLength(9) // header + 8
})

test('edit button invokes onEdit with the account', async () => {
  const onEdit = vi.fn()
  render(<DataTable {...props} onEdit={onEdit} />)
  await userEvent.click(screen.getByRole('button', { name: /Edit Cobalt Freight/i }))
  expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Cobalt Freight' }))
})

test('delete button invokes onDelete with the account', async () => {
  const onDelete = vi.fn()
  render(<DataTable {...props} onDelete={onDelete} />)
  await userEvent.click(screen.getByRole('button', { name: /Delete Cobalt Freight/i }))
  expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ name: 'Cobalt Freight' }))
})

test('ARR/Since columns hidden by default, shown when visibility flips', () => {
  const { rerender } = render(<DataTable {...props} />)
  expect(screen.queryByRole('columnheader', { name: /ARR/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('columnheader', { name: /Since/i })).not.toBeInTheDocument()
  rerender(<DataTable {...props} visibility={{ name: true, arr: true, since: true }} />)
  expect(screen.getByRole('columnheader', { name: /ARR/i })).toBeInTheDocument()
  expect(screen.getByRole('columnheader', { name: /Since/i })).toBeInTheDocument()
})

test('renders drag handles for movable columns but keeps actions locked', () => {
  render(<DataTable {...props} />)
  expect(screen.getByRole('button', { name: /Move Account column/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Move Owner column/i })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /Move actions column/i })).not.toBeInTheDocument()
})

test('reads persisted column order', () => {
  localStorage.setItem('ledger.colOrder', JSON.stringify([
    'owner',
    'account',
    'segment',
    'mrr',
    'growth',
    'status',
    'arr',
    'since',
    'actions',
  ]))

  render(<DataTable {...props} />)

  const headers = screen.getAllByRole('columnheader').map((header) =>
    header.textContent?.replaceAll(':', '').replace(/[▲▼]/g, '').trim(),
  )
  expect(headers.slice(0, 3)).toEqual(['Owner', 'Account', 'Segment'])
})

test('defaults to mrr descending sort', () => {
  render(<DataTable {...props} />)
  const mrrHeader = screen.getByRole('columnheader', { name: /MRR/i })
  expect(mrrHeader).toHaveAttribute('aria-sort', 'descending')
})

test('clicking a sortable header toggles aria-sort', async () => {
  render(<DataTable {...props} />)

  const accountHeader = screen.getByRole('columnheader', { name: /Account/i })
  expect(accountHeader).toHaveAttribute('aria-sort', 'none')

  await userEvent.click(accountHeader)
  expect(accountHeader).toHaveAttribute('aria-sort', 'ascending')
  expect(screen.getByRole('columnheader', { name: /MRR/i })).toHaveAttribute('aria-sort', 'none')

  await userEvent.click(accountHeader)
  expect(accountHeader).toHaveAttribute('aria-sort', 'descending')
})

test('reset restores default column order and default visibility', async () => {
  localStorage.setItem('ledger.colOrder', JSON.stringify([
    'owner',
    'account',
    'segment',
    'mrr',
    'growth',
    'status',
    'arr',
    'since',
    'actions',
  ]))

  function Harness() {
    const [vis, setVis] = useState({ name: true, arr: true, since: false })
    return (
      <DataTable
        {...props}
        visibility={vis}
        onToggleColumn={(c) => setVis((v) => ({ ...v, [c]: !v[c] }))}
        onResetColumns={() => setVis({ name: true, arr: false, since: false })}
      />
    )
  }

  render(<Harness />)

  const before = screen.getAllByRole('columnheader').map((header) =>
    header.textContent?.replaceAll(':', '').replace(/[▲▼]/g, '').trim(),
  )
  expect(before.slice(0, 2)).toEqual(['Owner', 'Account'])
  expect(screen.getByRole('columnheader', { name: /ARR/i })).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: /Columns/i }))
  await userEvent.click(screen.getByRole('button', { name: /Reset to default/i }))

  const after = screen.getAllByRole('columnheader').map((header) =>
    header.textContent?.replaceAll(':', '').replace(/[▲▼]/g, '').trim(),
  )
  expect(after.slice(0, 3)).toEqual(['Account', 'Owner', 'Segment'])
  expect(screen.queryByRole('columnheader', { name: /ARR/i })).not.toBeInTheDocument()
  expect(JSON.parse(localStorage.getItem('ledger.colOrder')!)).toEqual([
    'account',
    'owner',
    'segment',
    'mrr',
    'growth',
    'status',
    'arr',
    'since',
    'actions',
  ])
})
