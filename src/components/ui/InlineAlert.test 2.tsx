import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InlineAlert } from './InlineAlert'

test('InlineAlert renders alert role for critical tones, content, and dismiss', async () => {
  const user = userEvent.setup()
  const onDismiss = vi.fn()
  render(
    <InlineAlert tone="neg" title="Sync failed" onDismiss={onDismiss}>
      Retry the import to continue.
    </InlineAlert>,
  )

  const alert = screen.getByRole('alert')
  expect(alert).toHaveTextContent('Sync failed')
  expect(alert).toHaveTextContent('Retry the import to continue.')

  await user.click(screen.getByRole('button', { name: 'Dismiss' }))
  expect(onDismiss).toHaveBeenCalled()
})

test('InlineAlert uses status role for non-critical tones', () => {
  render(<InlineAlert tone="accent">Heads up, this view is filtered.</InlineAlert>)
  expect(screen.getByRole('status')).toHaveTextContent('Heads up, this view is filtered.')
})
