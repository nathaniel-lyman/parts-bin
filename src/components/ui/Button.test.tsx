import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

test('renders children and variant class', () => {
  render(<Button variant="primary">Save</Button>)
  const btn = screen.getByRole('button', { name: 'Save' })
  expect(btn).toBeInTheDocument()
})

test('loading button is busy, disabled, and non-interactive', async () => {
  const onClick = vi.fn()
  render(<Button loading onClick={onClick}>Save</Button>)
  const btn = screen.getByRole('button', { name: 'Save' })
  expect(btn).toHaveAttribute('aria-busy', 'true')
  expect(btn).toBeDisabled()
  await userEvent.click(btn)
  expect(onClick).not.toHaveBeenCalled()
})
