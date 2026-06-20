import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { Table, type TableColumn } from './Table'

interface Row { id: string; name: string; score: number }

const columns: TableColumn<Row>[] = [
  { key: 'name', header: 'Project' },
  { key: 'score', header: 'Score', numeric: true },
]
const rows: Row[] = [
  { id: 'a', name: 'Launch plan', score: 82 },
  { id: 'b', name: 'Vendor review', score: 64 },
]

test('renders a semantic table with headers and cells', () => {
  render(<Table caption="Top projects" columns={columns} rows={rows} rowKey={(row) => row.id} />)
  expect(screen.getByRole('table', { name: 'Top projects' })).toBeInTheDocument()
  expect(screen.getByRole('columnheader', { name: 'Project' })).toBeInTheDocument()
  // Default cell reads row[key]; custom render wins when provided.
  expect(screen.getByRole('cell', { name: 'Launch plan' })).toBeInTheDocument()
  expect(screen.getByRole('cell', { name: '82' })).toBeInTheDocument()
})

test('numeric columns right-align and use tabular figures', () => {
  render(<Table columns={columns} rows={rows} rowKey={(row) => row.id} />)
  expect(screen.getByRole('columnheader', { name: 'Score' }).className).toContain('text-right')
  const cell = screen.getByRole('cell', { name: '64' })
  expect(cell.className).toContain('num')
  expect(cell.className).toContain('text-right')
})

test('renders the empty message when there are no rows', () => {
  render(<Table columns={columns} rows={[]} rowKey={(row: Row) => row.id} emptyMessage="No records yet" />)
  expect(screen.getByText('No records yet')).toBeInTheDocument()
})
