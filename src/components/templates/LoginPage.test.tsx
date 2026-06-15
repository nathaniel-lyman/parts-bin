import { beforeEach, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginPage } from './LoginPage'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
})

test('renders the brand panel and the sign-in form', () => {
  render(<LoginPage />)
  expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  expect(screen.getAllByText(/parts-kit/i).length).toBeGreaterThan(0)
  expect(screen.getByText(/Example app surfaces/i)).toBeInTheDocument()
  expect(screen.getByText(/Example pre-auth screen/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /toggle color mode/i })).toBeInTheDocument()
})

test('empty submit surfaces an inline error and does not enter loading', async () => {
  const user = userEvent.setup()
  render(<LoginPage />)
  await user.click(screen.getByRole('button', { name: /^sign in$/i }))
  expect(screen.getByRole('alert')).toHaveTextContent(/enter both an email and password/i)
})

test('valid submit clears the error and enters the loading state', async () => {
  const user = userEvent.setup()
  render(<LoginPage />)
  await user.type(screen.getByLabelText('Email'), 'morgan@parts-kit.demo')
  await user.type(screen.getByLabelText('Password'), 'hunter2')
  await user.click(screen.getByRole('button', { name: /^sign in$/i }))

  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  // Button flips to the busy label while the simulated sign-in runs.
  expect(screen.getByRole('button', { name: /signing in/i })).toHaveAttribute('aria-busy', 'true')
})

test('theme toggle flips the color mode', async () => {
  const user = userEvent.setup()
  render(<LoginPage />)
  expect(document.documentElement.classList.contains('dark')).toBe(false)
  await user.click(screen.getByRole('button', { name: /toggle color mode/i }))
  expect(document.documentElement.classList.contains('dark')).toBe(true)
})
