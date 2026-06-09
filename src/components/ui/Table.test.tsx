import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { Table, type TableColumn } from './Table'

interface Row { id: string; name: string; mrr: number }

const columns: TableColumn<Row>[] = [
  { key: 'name', header: 'Account' },
  { key: 'mrr', header: 'MRR', numeric: true, render: (row) => `$${row.mrr}` },
]
const rows: Row[] = [
  { id: 'a', name: 'Acme', mrr: 1200 },
  { id: 'b', name: 'Globex', mrr: 800 },
]

test('renders a semantic table with headers and cells', () => {
  render(<Table caption="Top accounts" columns={columns} rows={rows} rowKey={(row) => row.id} />)
  expect(screen.getByRole('table', { name: 'Top accounts' })).toBeInTheDocument()
  expect(screen.getByRole('columnheader', { name: 'Account' })).toBeInTheDocument()
  // Default cell reads row[key]; custom render wins when provided.
  expect(screen.getByRole('cell', { name: 'Acme' })).toBeInTheDocument()
  expect(screen.getByRole('cell', { name: '$1200' })).toBeInTheDocument()
})

test('numeric columns right-align and use tabular figures', () => {
  render(<Table columns={columns} rows={rows} rowKey={(row) => row.id} />)
  expect(screen.getByRole('columnheader', { name: 'MRR' }).className).toContain('text-right')
  const cell = screen.getByRole('cell', { name: '$800' })
  expect(cell.className).toContain('num')
  expect(cell.className).toContain('text-right')
})

test('renders the empty message when there are no rows', () => {
  render(<Table columns={columns} rows={[]} rowKey={(row: Row) => row.id} emptyMessage="No accounts yet" />)
  expect(screen.getByText('No accounts yet')).toBeInTheDocument()
})
