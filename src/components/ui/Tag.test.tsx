import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { Tag } from './Tag'

test('renders a static tag with the tone utility', () => {
  render(<Tag tone="pos" label="Healthy" />)
  const tag = screen.getByText('Healthy')
  expect(tag.closest('span')?.className).toContain('text-pos')
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

test('onRemove renders an accessible remove button that fires once', () => {
  const onRemove = vi.fn()
  render(<Tag label="Beta" onRemove={onRemove} />)
  const remove = screen.getByRole('button', { name: 'Remove Beta' })
  expect(remove).toHaveAttribute('type', 'button')
  fireEvent.click(remove)
  expect(onRemove).toHaveBeenCalledTimes(1)
})
