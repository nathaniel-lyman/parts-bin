import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IconButton } from './IconButton'

test('IconButton exposes its aria-label and fires onClick', async () => {
  const onClick = vi.fn()
  render(<IconButton aria-label="Filter rows" onClick={onClick}>⚲</IconButton>)
  const button = screen.getByRole('button', { name: 'Filter rows' })
  await userEvent.click(button)
  expect(onClick).toHaveBeenCalled()
})

test('IconButton honors disabled state', () => {
  render(<IconButton aria-label="Refresh" disabled>↻</IconButton>)
  expect(screen.getByRole('button', { name: 'Refresh' })).toBeDisabled()
})

test('IconButton loading is busy and disabled, keeping its label', () => {
  render(<IconButton aria-label="Refresh" loading>↻</IconButton>)
  const button = screen.getByRole('button', { name: 'Refresh' })
  expect(button).toHaveAttribute('aria-busy', 'true')
  expect(button).toBeDisabled()
})
