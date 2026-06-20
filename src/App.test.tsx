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

test('renders dashboard with KPIs and table (light)', () => {
  render(<ToastProvider><App /></ToastProvider>)
  expect(screen.getByText('Component assembly demo')).toBeInTheDocument()
  expect(screen.getByText(/A working sample assembled from parts-bin components/)).toBeInTheDocument()
  expect(screen.getByText('Total value')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Dark|Light/ })).toBeInTheDocument()
  expect(screen.getByRole('figure', { name: /Sample bridge in thousands/i })).toBeInTheDocument()
  expect(screen.queryByText('Pipeline by stage')).not.toBeInTheDocument()
  expect(screen.getByText('Cobalt Freight')).toBeInTheDocument()
  expect(screen.getByRole('checkbox', { name: 'Select Cobalt Freight' })).toBeInTheDocument()
  expect(within(screen.getByTestId('accounts-grid')).getByRole('searchbox', { name: /quick filter/i })).toBeInTheDocument()
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

test('dashboard DataGrid selection is visible without server mode', async () => {
  render(<ToastProvider><App /></ToastProvider>)
  await userEvent.click(screen.getByRole('checkbox', { name: 'Select Cobalt Freight' }))
  expect(screen.getByText('1 selected')).toBeInTheDocument()
})

test('Dark toggle switches to dark mode', async () => {
  render(<ToastProvider><App /></ToastProvider>)
  await userEvent.click(screen.getByRole('button', { name: /Dark/ }))
  expect(document.documentElement.classList.contains('dark')).toBe(true)
  expect(localStorage.getItem('parts-bin.theme')).toBe('dark')
  // app still renders its content in dark mode
  expect(screen.getByText('Component assembly demo')).toBeInTheDocument()
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
  expectTextContent('Custom range · Jun 9, 2025 - Jan 6, 2026')
  expect(document.body).not.toHaveTextContent('Last 90 days · Jun 9, 2025 - Jan 6, 2026')

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

test('recommendation review template route renders queue and detail workflow', () => {
  window.history.pushState({}, '', '/templates/recommendation-review')
  render(<ToastProvider><App /></ToastProvider>)

  expect(screen.getByText('Recommendation review console')).toBeInTheDocument()
  expect(screen.getByText('Recommendation detail')).toBeInTheDocument()
  expect(screen.getAllByText('Lumen Home 12-Cup Programmable Coffee Maker').length).toBeGreaterThan(0)
  expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Modify' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Flag' })).toBeInTheDocument()
})

test('recommendation review status filter changes visible rows', async () => {
  const user = userEvent.setup()
  window.history.pushState({}, '', '/templates/recommendation-review')
  render(<ToastProvider><App /></ToastProvider>)

  await user.click(screen.getByRole('radio', { name: /Accepted/ }))

  expect(screen.getByText('Mapleline Maple Breakfast Sausage, 16 oz')).toBeInTheDocument()
  expect(screen.queryByText('Hearthwell Organic Whole Milk, 64 oz')).not.toBeInTheDocument()
})

test('recommendation review feedback drawer updates status and history', async () => {
  const user = userEvent.setup()
  window.history.pushState({}, '', '/templates/recommendation-review')
  render(<ToastProvider><App /></ToastProvider>)

  await user.click(screen.getByRole('button', { name: 'Accept' }))
  expect(screen.getByRole('dialog', { name: 'Accept recommendation' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Submit feedback' }))
  expect(await screen.findByText('Accept submitted')).toBeInTheDocument()
  expect(screen.getAllByText('Accepted').length).toBeGreaterThan(0)

  await user.click(screen.getByRole('button', { name: 'Modify' }))
  expect(screen.getByRole('dialog', { name: 'Modify recommendation' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Submit feedback' }))
  expect(await screen.findByText('Modify submitted')).toBeInTheDocument()
  expect(screen.getAllByText('Reviewed').length).toBeGreaterThan(0)

  await user.click(screen.getByRole('button', { name: 'Reject' }))
  expect(screen.getByRole('dialog', { name: 'Reject recommendation' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Submit feedback' }))
  expect(await screen.findByText('Reject submitted')).toBeInTheDocument()
  expect(screen.getAllByText('Rejected').length).toBeGreaterThan(0)
})

test('components route drops dashboard-only header controls and wires global search to the gallery', async () => {
  const user = userEvent.setup()
  window.history.pushState({}, '', '/docs')
  render(<ToastProvider><App /></ToastProvider>)

  expect(screen.getByText('Components')).toBeInTheDocument()
  // dashboard-only controls have no function on the docs page
  expect(screen.queryByLabelText('Time period')).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /dates/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /risks/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /notifications/i })).not.toBeInTheDocument()
  // shell-wide controls stay
  expect(screen.getByRole('button', { name: /Dark|Light/ })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /morgan/i })).toBeInTheDocument()

  await user.type(screen.getByRole('searchbox', { name: /global search/i }), 'sparkline')
  expect(screen.getByRole('heading', { name: 'Sparkline' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Button' })).not.toBeInTheDocument()
})

test('composer route renders a guided starter and hides dashboard-only controls', () => {
  window.history.pushState({}, '', '/compose')
  render(<ToastProvider><App /></ToastProvider>)

  expect(screen.getByRole('heading', { name: 'App composer' })).toBeInTheDocument()
  expect(screen.getByText('Guided build')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Generate screen' })).toBeInTheDocument()
  expect(screen.queryByLabelText('Time period')).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /dates/i })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /risks/i })).not.toBeInTheDocument()
})

test('docs start alias renders the app composer', () => {
  window.history.pushState({}, '', '/docs/start')
  render(<ToastProvider><App /></ToastProvider>)

  expect(screen.getByRole('heading', { name: 'App composer' })).toBeInTheDocument()
  expect(screen.queryByText('Component imports')).not.toBeInTheDocument()
})

test('signed movement chart exposes bar width and label controls', async () => {
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
  render(<ToastProvider><App /></ToastProvider>)
  const labelControl = screen.getByRole('switch', { name: /bridge labels/i })

  expect(labelControl).toBeChecked()
  await userEvent.click(labelControl)
  expect(labelControl).not.toBeChecked()
})

test('assistant opens from the top nav and answers with live sample value', async () => {
  const user = userEvent.setup()
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

test('assistant summarizes selected rows from the current grid context', async () => {
  const user = userEvent.setup()
  render(<ToastProvider><App /></ToastProvider>)

  await user.click(screen.getByRole('checkbox', { name: 'Select Cobalt Freight' }))
  await user.click(screen.getByRole('button', { name: 'Open assistant' }))
  await user.type(screen.getByRole('textbox', { name: 'Message the assistant' }), 'Summarize selected rows{Enter}')

  await waitFor(() => expect(screen.getAllByText((_content, node) => (
    node?.tagName === 'P' && (node.textContent?.includes('You selected 1 row') ?? false)
  )).length).toBeGreaterThan(0), { timeout: 10000 })
  expect(screen.getAllByText(/Cobalt Freight/).length).toBeGreaterThan(0)
})

test('assistant explains signed movement with chart and filtered grid evidence', async () => {
  const user = userEvent.setup()
  render(<ToastProvider><App /></ToastProvider>)

  await user.type(screen.getByRole('searchbox', { name: /global search/i }), 'cobalt')
  await waitFor(() => expect(screen.getByText(/Search: cobalt/)).toBeInTheDocument())
  await user.click(screen.getByRole('button', { name: 'Open assistant' }))
  await user.type(screen.getByRole('textbox', { name: 'Message the assistant' }), 'Explain this signed movement{Enter}')

  await waitFor(() => expectTextContent('Signed movement is net positive'), { timeout: 10000 })
  await waitFor(() => expectTextContent('Separation: chart evidence uses monthly movement rows'), { timeout: 10000 })
  await waitFor(() => expectTextContent('Chart: Signed movement ($k), 10 monthly rows'), { timeout: 15000 })
  await waitFor(() => expectTextContent('Filters: global search "cobalt"'), { timeout: 15000 })
  expectTextContent('Evidence used')
  expectTextContent('Grid scope: 1 of 1 rows visible')
  expectTextContent('Separation: chart evidence uses monthly movement rows')
}, 30000)

test('assistant creates a saved view from the current grid context', async () => {
  const user = userEvent.setup()
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
  render(<ToastProvider><App /></ToastProvider>)

  expect(document.documentElement.classList.contains('dark')).toBe(false)
  fireEvent.keyDown(document, { key: 't' })
  expect(document.documentElement.classList.contains('dark')).toBe(true)

  fireEvent.keyDown(document, { key: 'r' })
  expect(screen.getByText(/Review focus/)).toBeInTheDocument()
  expect(screen.queryByRole('dialog', { name: /command palette/i })).not.toBeInTheDocument()
})

test('command shortcuts save and reset the current account grid view', async () => {
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

test('command shortcuts clear selected grid rows', async () => {
  const user = userEvent.setup()
  render(<ToastProvider><App /></ToastProvider>)

  await user.click(screen.getByRole('checkbox', { name: 'Select Cobalt Freight' }))
  expect(screen.getByText('1 selected')).toBeInTheDocument()

  fireEvent.keyDown(document, { key: 'v' })
  fireEvent.keyDown(document, { key: 'c' })

  await waitFor(() => expect(screen.queryByText('1 selected')).not.toBeInTheDocument())
  expect(screen.getByText('Cleared 1 selected row')).toBeInTheDocument()
})

test('command shortcuts can ask the assistant from the current screen', async () => {
  render(<ToastProvider><App /></ToastProvider>)

  fireEvent.keyDown(document, { key: 's' })

  expect(screen.getByRole('dialog', { name: 'Assistant' })).toBeInTheDocument()
  await waitFor(() => expect(screen.getAllByText((_content, node) => (
    node?.textContent?.includes('You are on Component assembly') ?? false
  )).length).toBeGreaterThan(0), { timeout: 10000 })
})
