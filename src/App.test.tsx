import { afterEach, expect, test } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { ToastProvider } from './components/ui/ToastProvider'

afterEach(() => {
  window.history.pushState({}, '', '/')
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

test('manual date ranges update the dashboard period label dynamically', async () => {
  const user = userEvent.setup()
  render(<ToastProvider><App /></ToastProvider>)

  await user.click(screen.getByRole('button', { name: /dates/i }))
  await user.clear(screen.getByLabelText('Start'))
  await user.type(screen.getByLabelText('Start'), '2025-06-09')
  await user.clear(screen.getByLabelText('End'))
  await user.type(screen.getByLabelText('End'), '2026-01-06')
  await user.click(screen.getByRole('button', { name: 'Apply' }))

  expect(screen.getByLabelText('Time period')).toHaveValue('custom')
  expect(screen.getByText('Custom range · Jun 9, 2025 - Jan 6, 2026')).toBeInTheDocument()
  expect(screen.queryByText('Last 90 days · Jun 9, 2025 - Jan 6, 2026')).not.toBeInTheDocument()

  await user.selectOptions(screen.getByLabelText('Time period'), '30d')
  expect(screen.getByLabelText('Time period')).toHaveValue('30d')
  expect(screen.getByText(/Last 30 days · /)).toBeInTheDocument()
})

test('server mode toggle exercises the DataGrid mock server path', async () => {
  render(<ToastProvider><App /></ToastProvider>)
  await userEvent.click(screen.getByRole('switch', { name: /server mode/i }))
  expect(screen.getByText(/loading server rows/i)).toBeInTheDocument()
  expect(await screen.findByText(/server rows/i)).toBeInTheDocument()
  expect(screen.getByRole('checkbox', { name: /select all loaded/i })).toBeInTheDocument()
})

test('customer success template route renders a full app workflow', async () => {
  const user = userEvent.setup()
  window.history.pushState({}, '', '/templates/customer-success')
  render(<ToastProvider><App /></ToastProvider>)

  expect(screen.getByText('Customer operations workspace')).toBeInTheDocument()
  expect(screen.getByText('Priority work queue')).toBeInTheDocument()
  expect(screen.getByText('Account portfolio')).toBeInTheDocument()
  expect(screen.getByText('Selected account')).toBeInTheDocument()

  await user.click(screen.getAllByRole('button', { name: 'Log touchpoint' })[0])
  expect(screen.getByRole('dialog', { name: 'Log touchpoint' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Save note' }))
  expect(await screen.findByText('Executive sponsor follow-up')).toBeInTheDocument()
})

test('revenue movement chart exposes bar width and label controls', async () => {
  render(<ToastProvider><App /></ToastProvider>)
  const widthControl = screen.getByRole('slider', { name: /revenue movement bar width/i })
  const labelControl = screen.getByRole('switch', { name: /movement labels/i })

  expect(widthControl).toHaveValue('22')
  fireEvent.change(widthControl, { target: { value: '34' } })
  expect(widthControl).toHaveValue('34')
  expect(screen.getByText('34px')).toBeInTheDocument()

  expect(labelControl).not.toBeChecked()
  await userEvent.click(labelControl)
  expect(labelControl).toBeChecked()
})

test('waterfall chart labels can be toggled', async () => {
  render(<ToastProvider><App /></ToastProvider>)
  const labelControl = screen.getByRole('switch', { name: /bridge labels/i })

  expect(labelControl).not.toBeChecked()
  await userEvent.click(labelControl)
  expect(labelControl).toBeChecked()
})
