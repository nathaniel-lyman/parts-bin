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
})

test('no-match shows empty state', async () => {
  render(<DataTable {...props} />)
  await userEvent.type(screen.getByPlaceholderText(/Search/), 'zzzqqq')
  expect(screen.getByText(/No results/i)).toBeInTheDocument()
})

test('edit button invokes onEdit with the account', async () => {
  const onEdit = vi.fn()
  render(<DataTable {...props} onEdit={onEdit} />)
  await userEvent.click(screen.getByRole('button', { name: /Edit Cobalt Freight/i }))
  expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Cobalt Freight' }))
})
