import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './Badge'

test('renders status text', () => {
  render(<StatusBadge status="At risk" tone="warn" />)
  expect(screen.getByText('At risk')).toBeInTheDocument()
})

test('is schema-agnostic — accepts any status string', () => {
  render(<StatusBadge status="Awaiting fulfillment" tone="accent" />)
  expect(screen.getByText('Awaiting fulfillment')).toBeInTheDocument()
})

test('applies the requested tone classes', () => {
  render(<StatusBadge status="Shipped" tone="pos" />)
  expect(screen.getByText('Shipped')).toHaveClass('bg-pos-soft', 'text-pos')
})

test('defaults to the neutral tone when none is given', () => {
  render(<StatusBadge status="Draft" />)
  expect(screen.getByText('Draft')).toHaveClass('bg-surface-2', 'text-muted')
})
