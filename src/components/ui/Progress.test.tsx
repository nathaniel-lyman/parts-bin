import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { Progress } from './Progress'

test('exposes progressbar semantics', () => {
  render(<Progress value={60} aria-label="Storage used" />)
  const bar = screen.getByRole('progressbar', { name: 'Storage used' })
  expect(bar).toHaveAttribute('aria-valuenow', '60')
  expect(bar).toHaveAttribute('aria-valuemin', '0')
  expect(bar).toHaveAttribute('aria-valuemax', '100')
})

test('clamps value into [0, max]', () => {
  const { rerender } = render(<Progress value={140} aria-label="Quota" />)
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  rerender(<Progress value={-5} aria-label="Quota" />)
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
})

test('label and showValue render the caption row and labels the bar', () => {
  render(<Progress value={45} label="Storage" showValue />)
  expect(screen.getByText('Storage')).toBeInTheDocument()
  expect(screen.getByText('45%')).toBeInTheDocument()
  expect(screen.getByRole('progressbar', { name: 'Storage' })).toBeInTheDocument()
})

test('tone maps to the matching token utility on the fill', () => {
  const { container } = render(<Progress value={80} tone="warn" aria-label="Capacity" />)
  expect(container.querySelector('.bg-warn')).not.toBeNull()
})
