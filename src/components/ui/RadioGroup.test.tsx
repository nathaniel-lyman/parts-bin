import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RadioGroup } from './RadioGroup'

const options = [
  { value: 'compact', label: 'Compact' },
  { value: 'standard', label: 'Standard' },
  { value: 'comfortable', label: 'Comfortable', disabled: true },
]

test('RadioGroup exposes a labelled group and selects on click', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(<RadioGroup label="Density" options={options} defaultValue="compact" onValueChange={onValueChange} />)

  expect(screen.getByRole('radiogroup', { name: 'Density' })).toBeInTheDocument()
  expect(screen.getByRole('radio', { name: 'Compact' })).toBeChecked()

  await user.click(screen.getByRole('radio', { name: 'Standard' }))
  expect(onValueChange).toHaveBeenCalledWith('standard')
  expect(screen.getByRole('radio', { name: 'Standard' })).toBeChecked()
})

test('RadioGroup disables individual options', () => {
  render(<RadioGroup label="Density" options={options} />)
  expect(screen.getByRole('radio', { name: 'Comfortable' })).toBeDisabled()
})

test('RadioGroup renders an error and marks the group invalid', () => {
  render(<RadioGroup label="Density" options={options} error="Pick a density." />)
  const group = screen.getByRole('radiogroup', { name: 'Density' })
  expect(group).toHaveAttribute('aria-invalid', 'true')
  expect(group).toHaveAccessibleDescription('Pick a density.')
})
