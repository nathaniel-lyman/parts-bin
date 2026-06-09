import { expect, test } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DocsPage } from './DocsPage'

test('DocsPage renders the new API sections and copy checklist', () => {
  render(<DocsPage />)
  expect(screen.getByRole('heading', { name: 'Charts API' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Maps API' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'DataGrid API' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Copy Ledger into your app' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Start with the real app template' })).toBeInTheDocument()
  // Documented public surfaces appear in the prop tables.
  expect(screen.getByText('WaterfallChart')).toBeInTheDocument()
  expect(screen.getAllByText('GeoDrilldown').length).toBeGreaterThan(0)
  expect(screen.getByText('LedgerGridColumn')).toBeInTheDocument()
  expect(screen.getByText('SegmentedControl')).toBeInTheDocument()
  // New form-primitive live examples render.
  expect(screen.getByText('Combobox & radio group')).toBeInTheDocument()
  expect(screen.getByText('Loading states & spinner')).toBeInTheDocument()
  expect(screen.getByRole('radiogroup', { name: 'Plan' })).toBeInTheDocument()
  expect(screen.getByRole('group', { name: 'Revenue by region' })).toBeInTheDocument()
  expect(screen.getByText(/us-atlas\/states-albers-10m\.json/)).toBeInTheDocument()
})

test('DocsPage live examples drive the new primitives', async () => {
  const user = userEvent.setup()
  render(<DocsPage />)

  // SegmentedControl updates the live density readout.
  await user.click(screen.getByRole('radio', { name: 'Comfortable' }))
  expect(screen.getByText('comfortable')).toBeInTheDocument()

  // InlineAlert dismiss removes the warning banner.
  const warning = screen.getByText('Two columns are hidden').closest('[role="alert"]') as HTMLElement
  await user.click(within(warning).getByRole('button', { name: 'Dismiss' }))
  expect(screen.queryByText('Two columns are hidden')).not.toBeInTheDocument()

  // Drawer opens, traps into a dialog, and closes on Escape.
  await user.click(screen.getByRole('button', { name: 'Open drawer' }))
  expect(screen.getByRole('dialog')).toHaveTextContent('Saved views')
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

  // Map examples use the same selected-state callbacks as app filters.
  await user.click(screen.getByRole('button', { name: /austin: 28 accounts/i }))
  const concentrationCard = screen.getByRole('heading', { name: 'Account concentration' }).closest('section') as HTMLElement
  expect(concentrationCard).toHaveTextContent('28')
})
