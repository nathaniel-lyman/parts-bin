import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RefreshCw, SlidersHorizontal } from 'lucide-react'
import { IconButton } from './IconButton'

test('IconButton exposes its aria-label and fires onClick', async () => {
  const onClick = vi.fn()
  render(<IconButton aria-label="Filter rows" onClick={onClick}><SlidersHorizontal className="h-4 w-4" /></IconButton>)
  const button = screen.getByRole('button', { name: 'Filter rows' })
  await userEvent.click(button)
  expect(onClick).toHaveBeenCalled()
})

test('IconButton honors disabled state', () => {
  render(<IconButton aria-label="Refresh" disabled><RefreshCw className="h-4 w-4" /></IconButton>)
  expect(screen.getByRole('button', { name: 'Refresh' })).toBeDisabled()
})

test('IconButton loading is busy and disabled, keeping its label', () => {
  render(<IconButton aria-label="Refresh" loading><RefreshCw className="h-4 w-4" /></IconButton>)
  const button = screen.getByRole('button', { name: 'Refresh' })
  expect(button).toHaveAttribute('aria-busy', 'true')
  expect(button).toBeDisabled()
})
