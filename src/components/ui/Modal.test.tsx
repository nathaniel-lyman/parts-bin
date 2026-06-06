import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

test('renders title and fires onClose on Escape', async () => {
  const onClose = vi.fn()
  render(<Modal title="New account" onClose={onClose}><p>body</p></Modal>)
  expect(screen.getByRole('dialog')).toHaveTextContent('New account')
  await userEvent.keyboard('{Escape}')
  expect(onClose).toHaveBeenCalled()
})
