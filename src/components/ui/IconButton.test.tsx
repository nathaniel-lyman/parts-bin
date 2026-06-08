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
