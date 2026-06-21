import { afterEach, expect, test } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { ToastProvider } from './components/ui/ToastProvider'
import { savedViewsKeyForGrid } from './hooks/useSavedViews'

const ACCOUNT_GRID_VIEWS_KEY = savedViewsKeyForGrid('ledger.accounts.grid')

afterEach(() => {
  window.history.pushState({}, '', '/')
  document.documentElement.classList.remove('dark')
  localStorage.clear()
})

function expectTextContent(fragment: string) {
  const matches = screen.queryAllByText((_content, node) => (
    node?.textContent?.includes(fragment) ?? false
  ))
  const dialogText = screen.queryByRole('dialog', { name: 'Assistant' })?.textContent ?? document.body.textContent ?? ''
  expect(matches.length, `Expected to find "${fragment}" in text: ${dialogText}`).toBeGreaterThan(0)
}

function openAssemblyRoute() {
  window.history.pushState({}, '', '/examples/dashboard')
}

function openDataGridRoute() {
  window.history.pushState({}, '', '/examples/datagrid')
}

test('root route renders the component catalog first', () => {
  render(<ToastProvider><App /></ToastProvider>)
  expect(screen.getByRole('heading', { name: 'Components' })).toBeInTheDocument()
  expect(screen.getByText(/catalog is the primary product surface/i)).toBeInTheDocument()
  expect(screen.queryByText('Component assembly demo')).not.toBeInTheDocument()
})

test('example assembly renders KPIs and read-only table (light)', () => {
  openAssemblyRoute()
  render(<ToastProvider><App /></ToastProvider>)
  expect(screen.getByText('Component assembly demo')).toBeInTheDocument()
  expect(screen.getByText(/A working sample assembled from parts-bin components/)).toBeInTheDocument()
  expect(screen.getByText('Total value')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Dark|Light/ })).toBeInTheDocument()
  expect(screen.getByRole('figure', { name: /Sample bridge in thousands/i })).toBeInTheDocument()
  expect(screen.queryByText('Pipeline by stage')).not.toBeInTheDocument()
  // The assembly demo shows a static, read-only Table — not the interactive DataGrid.
  const table = screen.getByTestId('accounts-table')
  expect(within(table).getByText('Cobalt Freight')).toBeInTheDocument()
  expect(screen.queryByTestId('accounts-grid')).not.toBeInTheDocument()
  expect(screen.queryByRole('checkbox', { name: 'Select Cobalt Freight' })).not.toBeInTheDocument()
  expect(document.documentElement.classList.contains('dark')).toBe(false)
})

test('login route renders the sign-in page full-bleed, without the app shell', () => {
  window.history.pushState({}, '', '/login')
  render(<ToastProvider><App /></ToastProvider>)
  expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  // No app shell chrome on the pre-auth surface.
  expect(screen.queryByRole('searchbox', { name: /global search/i })).not.toBeInTheDocument()
  expect(screen.queryByText('Component assembly demo')).not.toBeInTheDocument()
})

test('settings route renders inside the shell with dashboard-only controls hidden', () => {
  window.history.pushState({}, '', '/settings')
  render(<ToastProvider><App /></ToastProvider>)
  expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Appearance' })).toBeInTheDocument()
  // Shell controls present, dashboard-only controls absent.
  expect(screen.getByRole('button', { name: /Dark|Light/ })).toBeInTheDocument()
  expect(screen.queryByLabelText('Time period')).not.toBeInTheDocument()
})

test('datagrid example renders grouping and server-mode examples', async () => {
  openDataGridRoute()
  render(<ToastProvider><App /></ToastProvider>)

  const grouping = screen.getByRole('region', { name: 'Grouping example' })
  const server = screen.getByRole('region', { name: 'Server-mode example' })

  expect(within(grouping).getByTestId('grouping-chips')).toHaveTextContent('Segment')
  expect(within(grouping).queryByRole('searchbox', { name: 'Quick filter' })).toBeNull()
  expect(within(grouping).queryByRole('checkbox')).toBeNull()
  expect(within(grouping).queryByRole('button', { name: /new row/i })).toBeNull()
  expect(within(grouping).queryByRole('switch', { name: /server mode/i })).toBeNull()
  expect(within(server).getByRole('button', { name: /new row/i })).toBeInTheDocument()
  expect(within(server).getByRole('searchbox', { name: 'Quick filter' })).toBeInTheDocument()
  expect(await within(server).findByText(/server rows/i)).toBeInTheDocument()
})

test('datagrid grouping example does not expose row selection', () => {
  openDataGridRoute()
  render(<ToastProvider><App /></ToastProvider>)
  const grouping = screen.getByRole('region', { name: 'Grouping example' })
  expect(screen.getAllByText('200 rows').length).toBeGreaterThan(0)
  expect(within(grouping).queryByRole('checkbox')).toBeNull()
  expect(within(grouping).queryByLabelText(/select/i)).toBeNull()
})

test('Dark toggle switches to dark mode', async () => {
  render(<ToastProvider><App /></ToastProvider>)
  await userEvent.click(screen.getByRole('button', { name: /Dark/ }))
  expect(document.documentElement.classList.contains('dark')).toBe(true)
  expect(localStorage.getItem('parts-bin.theme')).toBe('dark')
  // app still renders its content in dark mode
  expect(screen.getByRole('heading', { name: 'Components' })).toBeInTheDocument()
})

test('manual date ranges update the assembly period label dynamically', async () => {
  const user = userEvent.setup()
  openAssemblyRoute()
  render(<ToastProvider><App /></ToastProvider>)

  await user.click(screen.getByRole('button', { name: /dates/i }))
  await user.clear(screen.getByLabelText('Start'))
  await user.type(screen.getByLabelText('Start'), '2025-06-09')
  await user.clear(screen.getByLabelText('End'))
  await user.type(screen.getByLabelText('End'), '2026-01-06')
  await user.click(screen.getByRole('button', { name: 'Apply' }))

  expect(screen.getByLabelText('Time period')).toHaveValue('custom')
  expectTextContent('Custom range · Jun 9, 2025 - Jan 6, 2026')
  expect(document.body).not.toHaveTextContent('Last 90 days · Jun 9, 2025 - Jan 6, 2026')

  await user.selectOptions(screen.getByLabelText('Time period'), '30d')
  expect(screen.getByLabelText('Time period')).toHaveValue('30d')
  expect(screen.getByText(/Last 30 days · /)).toBeInTheDocument()
})

test('server mode example exercises the DataGrid mock server path', async () => {
  openDataGridRoute()
  render(<ToastProvider><App /></ToastProvider>)
  const server = screen.getByRole('region', { name: 'Server-mode example' })

  expect(within(server).getByText(/loading server rows/i)).toBeInTheDocument()
  expect(await within(server).findByText(/server rows/i)).toBeInTheDocument()
  expect(within(server).getByRole('checkbox', { name: /select all loaded/i })).toBeInTheDocument()
})

test('server mode example new row updates the route-local server dataset', async () => {
  const user = userEvent.setup()
  openDataGridRoute()
  render(<ToastProvider><App /></ToastProvider>)
  const server = screen.getByRole('region', { name: 'Server-mode example' })

  await within(server).findByText(/200 server rows/i)
  await user.click(within(server).getByRole('button', { name: /new row/i }))
  await user.type(screen.getByLabelText('Account name'), 'Zenith Server Account')
  await user.type(screen.getByLabelText('Owner'), 'T. Server')
  await user.type(screen.getByLabelText('Value ($)'), '999999')
  await user.type(screen.getByLabelText('Growth (%)'), '42')
  await user.click(screen.getByRole('button', { name: 'Create account' }))

  expect(await within(server).findByText('Zenith Server Account')).toBeInTheDocument()
  expect(await within(server).findByText(/201 server rows/i)).toBeInTheDocument()
})

test('components route drops assembly-only header controls and wires global search to the gallery', async () => {
  const user = userEvent.setup()
  window.history.pushState({}, '', '/docs')
  render(<ToastProvider><App /></ToastProvider>)

  expect(screen.getByRole('heading', { name: 'Components' })).toBeInTheDocument()
  // Assembly-only controls have no function on the docs page.
  expect(screen.queryByLabelText('Time period')).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /dates/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Review' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /notifications/i })).not.toBeInTheDocument()
  // shell-wide controls stay
  expect(screen.getByRole('button', { name: /Dark|Light/ })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /morgan/i })).toBeInTheDocument()

  await user.type(screen.getByRole('searchbox', { name: /global search/i }), 'sparkline')
  expect(screen.getByRole('heading', { name: 'Sparkline' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Button' })).not.toBeInTheDocument()
})

test('signed movement chart exposes bar width and label controls', async () => {
  openAssemblyRoute()
  render(<ToastProvider><App /></ToastProvider>)
  const widthControl = screen.getByRole('slider', { name: /signed movement bar width/i })
  const labelControl = screen.getByRole('switch', { name: /movement labels/i })

  expect(widthControl).toHaveValue('22')
  fireEvent.change(widthControl, { target: { value: '34' } })
  expect(widthControl).toHaveValue('34')
  expect(screen.getByText('34px')).toBeInTheDocument()

  expect(labelControl).toBeChecked()
  await userEvent.click(labelControl)
  expect(labelControl).not.toBeChecked()
})

test('waterfall chart labels can be toggled', async () => {
  openAssemblyRoute()
  render(<ToastProvider><App /></ToastProvider>)
  const labelControl = screen.getByRole('switch', { name: /bridge labels/i })

  expect(labelControl).toBeChecked()
  await userEvent.click(labelControl)
  expect(labelControl).not.toBeChecked()
})

test('assistant opens from the top nav and answers with live sample value', async () => {
  const user = userEvent.setup()
  openAssemblyRoute()
  render(<ToastProvider><App /></ToastProvider>)
  await user.click(screen.getByRole('button', { name: 'Open assistant' }))
  expect(screen.getByRole('dialog', { name: 'Assistant' })).toBeInTheDocument()
  await user.type(screen.getByRole('textbox', { name: 'Message the assistant' }), 'Summarize sample value{Enter}')
  // waitFor + getByText (not findByText): each streamed chunk re-renders the
  // markdown and replaces its DOM nodes, so a node captured by findByText can
  // detach before the assertion runs. Re-querying inside waitFor is race-free.
  // Generous timeout: the demo adapter streams ~40 jittered 24ms chunks, slow
  // under parallel-suite load.
  await waitFor(() => expect(screen.getByText(/Total active sample value is/)).toBeInTheDocument(), { timeout: 10000 })
})

test('assistant reports no selected rows for the grouping grid context', async () => {
  const user = userEvent.setup()
  openDataGridRoute()
  render(<ToastProvider><App /></ToastProvider>)

  await user.click(screen.getByRole('button', { name: 'Open assistant' }))
  await user.type(screen.getByRole('textbox', { name: 'Message the assistant' }), 'Summarize selected rows{Enter}')

  await waitFor(() => expect(screen.getAllByText((_content, node) => (
    node?.tagName === 'P' && (node.textContent?.includes('No rows are selected') ?? false)
  )).length).toBeGreaterThan(0), { timeout: 10000 })
})

test('assistant explains signed movement with chart evidence', async () => {
  const user = userEvent.setup()
  openAssemblyRoute()
  render(<ToastProvider><App /></ToastProvider>)

  await user.click(screen.getByRole('button', { name: 'Open assistant' }))
  await user.type(screen.getByRole('textbox', { name: 'Message the assistant' }), 'Explain this signed movement{Enter}')

  await waitFor(() => expectTextContent('Signed movement is net positive'), { timeout: 10000 })
  await waitFor(() => expectTextContent('Separation: chart evidence uses monthly movement rows'), { timeout: 10000 })
  await waitFor(() => expectTextContent('Chart: Signed movement ($k), 10 monthly rows'), { timeout: 15000 })
  expectTextContent('Evidence used')
  // The read-only assembly demo has no DataGrid, so the assistant falls back to the full sample dataset.
  expectTextContent('Grid scope: full sample dataset')
}, 30000)

test('assistant creates a saved view from the current grid context', async () => {
  const user = userEvent.setup()
  openDataGridRoute()
  render(<ToastProvider><App /></ToastProvider>)

  await user.click(screen.getByRole('button', { name: 'Open assistant' }))
  await user.type(screen.getByRole('textbox', { name: 'Message the assistant' }), 'Create a saved view for this screen{Enter}')

  await waitFor(() => {
    const saved = JSON.parse(localStorage.getItem(ACCOUNT_GRID_VIEWS_KEY) ?? '[]') as Array<{ name: string }>
    expect(saved.some((view) => view.name === 'Current grid')).toBe(true)
  }, { timeout: 10000 })
  await waitFor(() => expect(screen.getAllByText((_content, node) => (
    node?.textContent?.includes('Saved view created') ?? false
  )).length).toBeGreaterThan(0), { timeout: 10000 })
})

test('command shortcuts run workspace actions without opening the palette', () => {
  openAssemblyRoute()
  render(<ToastProvider><App /></ToastProvider>)

  expect(document.documentElement.classList.contains('dark')).toBe(false)
  fireEvent.keyDown(document, { key: 't' })
  expect(document.documentElement.classList.contains('dark')).toBe(true)

  fireEvent.keyDown(document, { key: 'r' })
  expect(screen.getByText(/Review focus/)).toBeInTheDocument()
  expect(screen.queryByRole('dialog', { name: /command palette/i })).not.toBeInTheDocument()
})

test('command shortcuts save and reset the current account grid view', async () => {
  openDataGridRoute()
  render(<ToastProvider><App /></ToastProvider>)

  fireEvent.keyDown(document, { key: 'v' })
  fireEvent.keyDown(document, { key: 's' })

  await waitFor(() => {
    const saved = JSON.parse(localStorage.getItem(ACCOUNT_GRID_VIEWS_KEY) ?? '[]') as Array<{ name: string }>
    expect(saved.some((view) => view.name === 'Current grid')).toBe(true)
  })
  expect(screen.getByText('Saved view Current grid')).toBeInTheDocument()

  fireEvent.keyDown(document, { key: 'v' })
  fireEvent.keyDown(document, { key: 'r' })
  expect(screen.getByText('Reset sample grid layout')).toBeInTheDocument()
})

test('command shortcuts report no selected rows for the grouping grid', () => {
  openDataGridRoute()
  render(<ToastProvider><App /></ToastProvider>)

  fireEvent.keyDown(document, { key: 'v' })
  fireEvent.keyDown(document, { key: 'c' })

  expect(screen.getByText('No selected rows to clear')).toBeInTheDocument()
})

test('command shortcuts can ask the assistant from the current screen', async () => {
  openAssemblyRoute()
  render(<ToastProvider><App /></ToastProvider>)

  fireEvent.keyDown(document, { key: 's' })

  expect(screen.getByRole('dialog', { name: 'Assistant' })).toBeInTheDocument()
  await waitFor(() => expect(screen.getAllByText((_content, node) => (
    node?.textContent?.includes('You are on Component assembly') ?? false
  )).length).toBeGreaterThan(0), { timeout: 10000 })
})
