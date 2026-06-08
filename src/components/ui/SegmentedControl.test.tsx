import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SegmentedControl } from './SegmentedControl'

const options = [
  { value: 'compact', label: 'Compact' },
  { value: 'standard', label: 'Standard' },
  { value: 'comfortable', label: 'Comfortable' },
]

test('SegmentedControl marks the active option and selects with arrow keys', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(<SegmentedControl label="Density" options={options} onValueChange={onValueChange} />)

  expect(screen.getByRole('radiogroup', { name: 'Density' })).toBeInTheDocument()
  const compact = screen.getByRole('radio', { name: 'Compact' })
  expect(compact).toHaveAttribute('aria-checked', 'true')

  compact.focus()
  await user.keyboard('{ArrowRight}')
  const standard = screen.getByRole('radio', { name: 'Standard' })
  expect(standard).toHaveFocus()
  expect(standard).toHaveAttribute('aria-checked', 'true')
  expect(onValueChange).toHaveBeenCalledWith('standard')
})

test('SegmentedControl selects on click', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(<SegmentedControl label="Density" options={options} onValueChange={onValueChange} />)
  await user.click(screen.getByRole('radio', { name: 'Comfortable' }))
  expect(onValueChange).toHaveBeenCalledWith('comfortable')
})
