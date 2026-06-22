import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Stepper } from './Stepper'

const steps = [
  { id: 'details', label: 'Details' },
  { id: 'mapping', label: 'Mapping' },
  { id: 'review', label: 'Review' },
]

test('infers complete/current/upcoming around currentStepId', () => {
  render(<Stepper steps={steps} currentStepId="mapping" />)

  const items = screen.getAllByRole('listitem')
  expect(items[0].querySelector('svg')).toBeInTheDocument() // before current renders a check icon
  expect(items[1]).toHaveTextContent('2') // current keeps its number
  expect(items[2]).toHaveTextContent('3') // after current → upcoming

  const current = screen.getByText('Mapping').closest('[aria-current]')
  expect(current).toHaveAttribute('aria-current', 'step')
  expect(screen.getByText('Details').closest('[aria-current]')).toBeNull()
})

test('an explicit step state overrides inference', () => {
  render(
    <Stepper
      steps={[steps[0], { ...steps[1], state: 'error' as const }, steps[2]]}
      currentStepId="review"
    />,
  )
  // error step keeps its number instead of the inferred check icon
  expect(screen.getAllByRole('listitem')[1]).toHaveTextContent('2')
})

test('steps are buttons only when onStepSelect is provided', async () => {
  const user = userEvent.setup()
  const { rerender } = render(<Stepper steps={steps} currentStepId="details" />)
  expect(screen.queryByRole('button')).not.toBeInTheDocument()

  const onStepSelect = vi.fn()
  rerender(<Stepper steps={steps} currentStepId="details" onStepSelect={onStepSelect} />)
  await user.click(screen.getByRole('button', { name: /Review/ }))
  expect(onStepSelect).toHaveBeenCalledWith('review')
})

test('optional steps without a description show the Optional hint', () => {
  render(<Stepper steps={[{ id: 'extras', label: 'Extras', optional: true }]} />)
  expect(screen.getByText('Optional')).toBeInTheDocument()
})
