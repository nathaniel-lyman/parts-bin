import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccountFormModal } from './AccountFormModal'

test('create mode submits typed values', async () => {
  const onSubmit = vi.fn()
  render(<AccountFormModal onClose={() => {}} onSubmit={onSubmit} />)
  await userEvent.type(screen.getByLabelText(/Account name/i), 'Zephyr Logistics')
  await userEvent.type(screen.getByLabelText(/Owner/i), 'T. Vance')
  await userEvent.clear(screen.getByLabelText(/Value/i))
  await userEvent.type(screen.getByLabelText(/Value/i), '12345')
  await userEvent.click(screen.getByRole('button', { name: /Create account/i }))
  expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Zephyr Logistics', owner: 'T. Vance', mrr: 12345 }))
})
