import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { AssistantPanel } from './AssistantPanel'
import { createDemoAdapter, DEMO_SUGGESTIONS } from './demoAdapter'
import { totalMrr } from '../../selectors/metrics'
import { fmtCurrency } from '../../lib/format'
import type { Account } from '../../data/types'

const fixture: Account[] = [
  { id: 'a1', name: 'Acme', owner: 'Kim', segment: 'Enterprise', mrr: 1000, growth: 10, status: 'Active', arr: 12000, since: '2024-01-01' },
  { id: 'a2', name: 'Globex', owner: 'Lee', segment: 'Startup', mrr: 200, growth: -30, status: 'At risk', arr: 2400, since: '2024-02-01' },
]

function renderPanel(onClose = vi.fn()) {
  const adapter = createDemoAdapter(() => fixture, { delayMs: 0 })
  render(<AssistantPanel adapter={adapter} onClose={onClose} suggestions={DEMO_SUGGESTIONS} />)
  return onClose
}

describe('AssistantPanel', () => {
  test('empty state shows suggestions; clicking one streams a data-aware answer', async () => {
    const user = userEvent.setup()
    renderPanel()
    await user.click(screen.getByRole('button', { name: 'How is MRR looking?' }))
    expect(await screen.findByText(new RegExp(fmtCurrency(totalMrr(fixture)).replace('$', '\\$')))).toBeInTheDocument()
    // Done message exposes actions:
    expect(await screen.findByRole('button', { name: 'Copy message' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Regenerate response' })).toBeInTheDocument()
  })

  test('typed question goes through the composer', async () => {
    const user = userEvent.setup()
    renderPanel()
    await user.type(screen.getByRole('textbox', { name: 'Message the assistant' }), 'which accounts are at risk?{Enter}')
    expect(await screen.findByText(/Globex/)).toBeInTheDocument()
  })

  test('Escape closes the panel (Drawer behavior intact)', async () => {
    const user = userEvent.setup()
    const onClose = renderPanel()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  test('clicking the scrim closes the panel', async () => {
    const user = userEvent.setup()
    const onClose = renderPanel()
    const scrim = document.querySelector('.scrim-backdrop')
    expect(scrim).not.toBeNull()
    await user.click(scrim as Element)
    expect(onClose).toHaveBeenCalled()
  })
})
