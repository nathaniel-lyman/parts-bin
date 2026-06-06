import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

test('renders children and variant class', () => {
  render(<Button variant="primary">Save</Button>)
  const btn = screen.getByRole('button', { name: 'Save' })
  expect(btn).toBeInTheDocument()
})
