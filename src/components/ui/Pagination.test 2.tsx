import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from './Pagination'

test('shows the visible range and page count', () => {
  render(<Pagination page={2} pageSize={25} total={120} onPageChange={() => {}} />)
  expect(screen.getByText('26-50 of 120')).toBeInTheDocument()
  expect(screen.getByText('2 / 5')).toBeInTheDocument()
})

test('clamps an out-of-range page into bounds', () => {
  render(<Pagination page={99} pageSize={25} total={120} onPageChange={() => {}} />)
  expect(screen.getByText('101-120 of 120')).toBeInTheDocument()
  expect(screen.getByText('5 / 5')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
})

test('handles an empty result set', () => {
  render(<Pagination page={1} pageSize={25} total={0} onPageChange={() => {}} />)
  expect(screen.getByText('0-0 of 0')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Prev' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
})

test('prev/next report the adjacent page', async () => {
  const user = userEvent.setup()
  const onPageChange = vi.fn()
  render(<Pagination page={3} pageSize={10} total={100} onPageChange={onPageChange} />)

  await user.click(screen.getByRole('button', { name: 'Prev' }))
  expect(onPageChange).toHaveBeenCalledWith(2)
  await user.click(screen.getByRole('button', { name: 'Next' }))
  expect(onPageChange).toHaveBeenCalledWith(4)
})

test('disables Prev on the first page', () => {
  render(<Pagination page={1} pageSize={10} total={100} onPageChange={() => {}} />)
  expect(screen.getByRole('button', { name: 'Prev' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled()
})
