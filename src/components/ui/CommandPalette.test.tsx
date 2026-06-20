import { expect, test, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommandPalette } from './CommandPalette'

const switchThemeSelect = vi.fn()

const groups = [
  {
    id: 'nav',
    label: 'Navigation',
    items: [
      { id: 'assembly', label: 'Open assembly demo', description: 'Component assembly reference' },
      { id: 'docs', label: 'Open component catalog', description: 'Live UI reference' },
    ],
  },
  {
    id: 'actions',
    label: 'Actions',
    items: [
      { id: 'theme', label: 'Switch theme', shortcut: 'T', onSelect: switchThemeSelect },
      { id: 'disabled', label: 'Disabled command', disabled: true },
    ],
  },
]

test('opens from the trigger, filters commands, and selects with Enter', async () => {
  const user = userEvent.setup()
  const onSelect = vi.fn()
  const commandGroups = [
    {
      id: 'actions',
      label: 'Actions',
      items: [
        { id: 'review', label: 'Show review focus', description: 'Rows that need review', onSelect },
        { id: 'theme', label: 'Switch theme' },
      ],
    },
  ]

  render(<CommandPalette groups={commandGroups} />)
  await user.click(screen.getByRole('button', { name: /command/i }))

  const input = screen.getByRole('combobox', { name: /search commands/i })
  expect(input).toHaveFocus()
  await user.type(input, 'review')
  expect(screen.getByRole('option', { name: /show review focus/i })).toBeInTheDocument()
  expect(screen.queryByRole('option', { name: /switch theme/i })).not.toBeInTheDocument()

  await user.keyboard('{Enter}')
  expect(onSelect).toHaveBeenCalled()
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
})

test('options are non-interactive listbox children (focus stays on the combobox input)', async () => {
  const user = userEvent.setup()
  render(<CommandPalette groups={groups} />)
  await user.click(screen.getByRole('button', { name: /command/i }))

  // role=listbox must own plain option elements, not nested buttons —
  // focus belongs to the input via aria-activedescendant, never the options.
  const options = screen.getAllByRole('option')
  expect(options.length).toBeGreaterThan(0)
  for (const option of options) {
    expect(option.tagName).not.toBe('BUTTON')
  }
  expect(screen.getByRole('option', { name: /disabled command/i })).toHaveAttribute('aria-disabled', 'true')

  await user.click(screen.getByRole('option', { name: /switch theme/i }))
  expect(switchThemeSelect).toHaveBeenCalled()
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
})

test('clicking a disabled option does nothing', async () => {
  const user = userEvent.setup()
  render(<CommandPalette groups={groups} />)
  await user.click(screen.getByRole('button', { name: /command/i }))
  await user.click(screen.getByRole('option', { name: /disabled command/i }))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
})

test('shortcut hints render as <kbd> chips', async () => {
  const user = userEvent.setup()
  render(<CommandPalette groups={[
    {
      id: 'nav',
      label: 'Navigation',
      items: [{ id: 'dashboard', label: 'Open dashboard', shortcut: 'G D' }],
    },
    {
      id: 'actions',
      label: 'Actions',
      items: [{ id: 'theme', label: 'Switch theme', shortcut: 'T', onSelect: switchThemeSelect }],
    },
  ]} />)

  const trigger = screen.getByRole('button', { name: /command/i })
  const triggerKeys = trigger.querySelectorAll('kbd')
  expect(Array.from(triggerKeys).map((k) => k.textContent)).toEqual(['Ctrl', 'K'])

  await user.click(trigger)
  const dashboardOption = screen.getByRole('option', { name: /open dashboard/i })
  expect(Array.from(dashboardOption.querySelectorAll('kbd')).map((k) => k.textContent)).toEqual(['G', 'D'])
  const themeOption = screen.getByRole('option', { name: /switch theme/i })
  expect(themeOption.querySelector('kbd')).toHaveTextContent('T')
})

test('search can find commands by shortcut text', async () => {
  const user = userEvent.setup()
  render(<CommandPalette groups={[{
    id: 'nav',
    label: 'Navigation',
    items: [
      { id: 'dashboard', label: 'Open dashboard', shortcut: 'G D' },
      { id: 'docs', label: 'Open component catalog', shortcut: 'G C' },
    ],
  }]} />)

  await user.click(screen.getByRole('button', { name: /command/i }))
  await user.type(screen.getByRole('combobox', { name: /search commands/i }), 'g d')

  expect(screen.getByRole('option', { name: /open dashboard/i })).toBeInTheDocument()
  expect(screen.queryByRole('option', { name: /open component catalog/i })).not.toBeInTheDocument()
})

test('global Ctrl+K opens the palette and arrow keys skip disabled commands', async () => {
  const user = userEvent.setup()
  render(<CommandPalette groups={groups} />)

  fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  const input = screen.getByRole('combobox', { name: /search commands/i })

  await user.click(input)
  await user.keyboard('{ArrowUp}')
  expect(screen.getByRole('option', { name: /switch theme/i })).toHaveAttribute('aria-selected', 'true')

  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
})

test('global item shortcuts run single-key and sequenced commands outside editable targets', () => {
  const sequenced = vi.fn()
  const single = vi.fn()
  render(
    <>
      <input aria-label="Outside input" />
      <input aria-label="Outside checkbox" type="checkbox" />
      <CommandPalette
        enableGlobalShortcuts
        groups={[{
          id: 'actions',
          label: 'Actions',
          items: [
            { id: 'dashboard', label: 'Open dashboard', shortcut: 'G D', onSelect: sequenced },
            { id: 'theme', label: 'Switch theme', shortcut: 'T', onSelect: single },
          ],
        }]}
      />
    </>,
  )

  fireEvent.keyDown(document, { key: 'g' })
  expect(sequenced).not.toHaveBeenCalled()
  fireEvent.keyDown(document, { key: 'd' })
  expect(sequenced).toHaveBeenCalledTimes(1)

  fireEvent.keyDown(document, { key: 't' })
  expect(single).toHaveBeenCalledTimes(1)

  screen.getByLabelText('Outside input').focus()
  fireEvent.keyDown(screen.getByLabelText('Outside input'), { key: 't' })
  expect(single).toHaveBeenCalledTimes(1)

  screen.getByLabelText('Outside checkbox').focus()
  fireEvent.keyDown(screen.getByLabelText('Outside checkbox'), { key: 't' })
  expect(single).toHaveBeenCalledTimes(2)
})
