import { afterEach, expect, test } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
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
  expect(screen.getByRole('figure', { name: /MRR bridge in thousands/i })).toBeInTheDocument()
  expect(screen.getByText('Cobalt Freight')).toBeInTheDocument()
  expect(screen.getByRole('checkbox', { name: 'Select Cobalt Freight' })).toBeInTheDocument()
  expect(screen.getByRole('searchbox', { name: /quick filter/i })).toBeInTheDocument()
  expect(document.documentElement.classList.contains('dark')).toBe(false)
})

test('dashboard DataGrid selection is visible without server mode', async () => {
  render(<ToastProvider><App /></ToastProvider>)
  await userEvent.click(screen.getByRole('checkbox', { name: 'Select Cobalt Freight' }))
  expect(screen.getByText('1 selected')).toBeInTheDocument()
})

test('Dark toggle switches to dark mode', async () => {
  render(<ToastProvider><App /></ToastProvider>)
  await userEvent.click(screen.getByRole('button', { name: /Dark/ }))
  expect(document.documentElement.classList.contains('dark')).toBe(true)
  expect(localStorage.getItem('ledger.theme')).toBe('dark')
  // app still renders its content in dark mode
  expect(screen.getByText('Account book')).toBeInTheDocument()
})

test('server mode toggle exercises the DataGrid mock server path', async () => {
  render(<ToastProvider><App /></ToastProvider>)
  await userEvent.click(screen.getByRole('switch', { name: /server mode/i }))
  expect(screen.getByText(/loading server rows/i)).toBeInTheDocument()
  expect(await screen.findByText(/server rows/i)).toBeInTheDocument()
  expect(screen.getByRole('checkbox', { name: /select all loaded/i })).toBeInTheDocument()
})

test('revenue movement chart exposes bar width and label controls', async () => {
  render(<ToastProvider><App /></ToastProvider>)
  const widthControl = screen.getByRole('slider', { name: /revenue movement bar width/i })
  const labelControl = screen.getByRole('switch', { name: /labels/i })

  expect(widthControl).toHaveValue('22')
  fireEvent.change(widthControl, { target: { value: '34' } })
  expect(widthControl).toHaveValue('34')
  expect(screen.getByText('34px')).toBeInTheDocument()

  expect(labelControl).not.toBeChecked()
  await userEvent.click(labelControl)
  expect(labelControl).toBeChecked()
})
