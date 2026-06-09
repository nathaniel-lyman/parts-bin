import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { Button } from './Button'
import { Banner } from './Banner'

test('renders a status region with tone styling and an action slot', () => {
  render(
    <Banner tone="warn" action={<Button size="compact">Upgrade</Button>}>
      Trial ends in 3 days.
    </Banner>,
  )
  const banner = screen.getByRole('status')
  expect(banner).toHaveTextContent('Trial ends in 3 days.')
  expect(banner.className).toContain('bg-warn-soft')
  expect(screen.getByRole('button', { name: 'Upgrade' })).toBeInTheDocument()
})

test('onDismiss renders a dismiss button that fires', () => {
  const onDismiss = vi.fn()
  render(<Banner onDismiss={onDismiss}>Scheduled maintenance tonight.</Banner>)
  const dismiss = screen.getByRole('button', { name: 'Dismiss banner' })
  expect(dismiss).toHaveAttribute('type', 'button')
  fireEvent.click(dismiss)
  expect(onDismiss).toHaveBeenCalledTimes(1)
})

test('no dismiss button without onDismiss', () => {
  render(<Banner>Read-only notice.</Banner>)
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})
