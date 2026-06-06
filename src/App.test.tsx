import { afterEach, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { ToastProvider } from './components/ui/ToastProvider'

afterEach(() => {
  document.documentElement.classList.remove('dark')
  localStorage.clear()
})

test('renders dashboard with KPIs and table (light)', () => {
  render(<ToastProvider><App /></ToastProvider>)
  expect(screen.getByText('Account book')).toBeInTheDocument()
  expect(screen.getByText('Total MRR')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Dark|Light/ })).toBeInTheDocument()
  expect(screen.getByText('Cobalt Freight')).toBeInTheDocument()
  expect(document.documentElement.classList.contains('dark')).toBe(false)
})

test('Dark toggle switches to dark mode', async () => {
  render(<ToastProvider><App /></ToastProvider>)
  await userEvent.click(screen.getByRole('button', { name: /Dark/ }))
  expect(document.documentElement.classList.contains('dark')).toBe(true)
  expect(localStorage.getItem('ledger.theme')).toBe('dark')
  // app still renders its content in dark mode
  expect(screen.getByText('Account book')).toBeInTheDocument()
})
