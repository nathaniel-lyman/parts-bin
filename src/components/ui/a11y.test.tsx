import { expect, test, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { Button } from './Button'
import { DropdownMenu } from './DropdownMenu'
import { Field } from './Field'
import { Input } from './Input'
import { Modal } from './Modal'
import { Popover } from './Popover'
import { Tabs } from './Tabs'
import { Tooltip } from './Tooltip'

test('Modal traps focus and restores focus to the opener', async () => {
  const user = userEvent.setup()

  function Harness() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open modal</Button>
        {open && (
          <Modal
            title="Account modal"
            onClose={() => setOpen(false)}
            footer={<Button>Save</Button>}
          >
            <Button>Cancel</Button>
          </Modal>
        )}
      </>
    )
  }

  render(<Harness />)
  const opener = screen.getByRole('button', { name: 'Open modal' })
  opener.focus()
  await user.click(opener)

  const close = screen.getByRole('button', { name: 'Close' })
  await waitFor(() => expect(close).toHaveFocus())

  await user.tab({ shift: true })
  expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus()

  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(opener).toHaveFocus()
})

test('DropdownMenu supports arrow navigation, selection, and Escape focus return', async () => {
  const user = userEvent.setup()
  const onArchive = vi.fn()

  render(
    <DropdownMenu
      label="Actions"
      items={[
        { id: 'copy', label: 'Copy row' },
        { id: 'disabled', label: 'Disabled item', disabled: true },
        { id: 'archive', label: 'Archive', onSelect: onArchive },
      ]}
    />,
  )

  const trigger = screen.getByRole('button', { name: 'Actions' })
  await user.click(trigger)
  await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Copy row' })).toHaveFocus())

  await user.keyboard('{ArrowDown}')
  expect(screen.getByRole('menuitem', { name: 'Archive' })).toHaveFocus()
  await user.keyboard('{Enter}')
  expect(onArchive).toHaveBeenCalled()
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  await waitFor(() => expect(trigger).toHaveFocus())

  await user.keyboard('{ArrowDown}')
  await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Copy row' })).toHaveFocus())
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  await waitFor(() => expect(trigger).toHaveFocus())
})

test('Popover closes with Escape and restores focus', async () => {
  const user = userEvent.setup()
  render(<Popover trigger="Open filters"><Button>Apply</Button></Popover>)

  const trigger = screen.getByRole('button', { name: 'Open filters' })
  await user.click(trigger)
  const dialog = screen.getByRole('dialog')
  await waitFor(() => expect(dialog).toHaveFocus())

  await user.keyboard('{Escape}')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  await waitFor(() => expect(trigger).toHaveFocus())
})

test('Tabs expose tab-panel relationships and roving keyboard focus', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(
    <Tabs
      label="Account sections"
      onValueChange={onValueChange}
      items={[
        { id: 'overview', label: 'Overview', content: 'Overview panel' },
        { id: 'disabled', label: 'Disabled', content: 'Disabled panel', disabled: true },
        { id: 'states', label: 'States', content: 'States panel' },
      ]}
    />,
  )

  const overview = screen.getByRole('tab', { name: 'Overview' })
  const states = screen.getByRole('tab', { name: 'States' })
  expect(overview).toHaveAttribute('aria-controls')
  expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', overview.id)

  overview.focus()
  await user.keyboard('{ArrowRight}')
  expect(states).toHaveFocus()
  expect(states).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tabpanel')).toHaveTextContent('States panel')
  expect(onValueChange).toHaveBeenCalledWith('states')
})

test('Tooltip describes a focusable trigger', () => {
  render(
    <Tooltip content="Export visible rows">
      <Button>Export</Button>
    </Tooltip>,
  )

  const trigger = screen.getByRole('button', { name: 'Export' })
  const tooltip = screen.getByRole('tooltip')
  expect(trigger).toHaveAttribute('aria-describedby', tooltip.id)
  expect(tooltip).toHaveTextContent('Export visible rows')
})

test('Field wires generated labels, descriptions, and invalid state', () => {
  const { rerender } = render(
    <Field label="Account" hint="Use the legal account name." required>
      <Input />
    </Field>,
  )

  const input = screen.getByRole('textbox', { name: 'Account' })
  expect(input).toBeRequired()
  expect(input).toHaveAccessibleDescription('Use the legal account name.')

  rerender(
    <Field label="Account" error="Account is required.">
      <Input />
    </Field>,
  )
  const invalidInput = screen.getByRole('textbox', { name: 'Account' })
  expect(invalidInput).toHaveAttribute('aria-invalid', 'true')
  expect(invalidInput).toHaveAccessibleDescription('Account is required.')
})
