import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Separator } from './Separator'

test('is decorative by default and hidden from assistive tech', () => {
  render(<Separator />)
  expect(screen.queryByRole('separator')).not.toBeInTheDocument()
})

test('exposes a semantic separator when decorative is false', () => {
  render(<Separator decorative={false} />)
  const separator = screen.getByRole('separator')
  expect(separator).not.toHaveAttribute('aria-orientation')
})

test('semantic vertical separators declare their orientation', () => {
  render(<Separator decorative={false} orientation="vertical" />)
  expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical')
})
