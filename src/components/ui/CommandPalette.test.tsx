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
      { id: 'dashboard', label: 'Open dashboard', description: 'Revenue account dashboard' },
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
        { id: 'risk', label: 'Show risk focus', description: 'At-risk accounts', onSelect },
        { id: 'theme', label: 'Switch theme' },
      ],
    },
  ]

  render(<CommandPalette groups={commandGroups} />)
  await user.click(screen.getByRole('button', { name: /command/i }))

  const input = screen.getByRole('combobox', { name: /search commands/i })
  expect(input).toHaveFocus()
  await user.type(input, 'risk')
  expect(screen.getByRole('option', { name: /show risk focus/i })).toBeInTheDocument()
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
  render(<CommandPalette groups={groups} />)

  const trigger = screen.getByRole('button', { name: /command/i })
  const triggerKeys = trigger.querySelectorAll('kbd')
  expect(Array.from(triggerKeys).map((k) => k.textContent)).toEqual(['Ctrl', 'K'])

  await user.click(trigger)
  const themeOption = screen.getByRole('option', { name: /switch theme/i })
  expect(themeOption.querySelector('kbd')).toHaveTextContent('T')
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

