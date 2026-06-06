import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './Badge'

test('renders status text', () => {
  render(<StatusBadge status="At risk" />)
  expect(screen.getByText('At risk')).toBeInTheDocument()
})
