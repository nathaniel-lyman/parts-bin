import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import {
  Button,
  Checkbox,
  Combobox,
  Drawer,
  DropdownMenu,
  Field,
  IconButton,
  InlineAlert,
  Input,
  Pagination,
  RadioGroup,
  SegmentedControl,
  Select,
  Spinner,
  Switch,
  Tabs,
} from './index'

test('barrel exports form primitives with accessible labels', async () => {
  const user = userEvent.setup()
  const onSwitch = vi.fn()
  const onCheckbox = vi.fn()

  render(
    <div>
      <Field label="Account" id="account" required>
        <Input id="account" />
      </Field>
      <Checkbox label="Include inactive" onChange={onCheckbox} />
      <Switch label="Server mode" onChange={onSwitch} />
    </div>,
  )

  expect(screen.getByLabelText(/account/i)).toBeInTheDocument()
  await user.click(screen.getByRole('checkbox', { name: /include inactive/i }))
  await user.click(screen.getByRole('switch', { name: /server mode/i }))
  expect(onCheckbox).toHaveBeenCalled()
  expect(onSwitch).toHaveBeenCalled()
})

test('form primitives keep full width by default but honor explicit width utilities', () => {
  render(
    <div>
      <Input aria-label="Default input" />
      <Input aria-label="Compact input" className="w-[220px]" />
      <Input aria-label="Bounded input" className="max-w-sm" />
      <Select aria-label="Compact select" className="w-[132px]">
        <option>Last 90 days</option>
      </Select>
    </div>,
  )

  expect(screen.getByLabelText('Default input')).toHaveClass('w-full')
  expect(screen.getByLabelText('Bounded input')).toHaveClass('w-full')
  expect(screen.getByLabelText('Compact input')).toHaveClass('w-[220px]')
  expect(screen.getByLabelText('Compact input')).not.toHaveClass('w-full')
  expect(screen.getByLabelText('Compact select')).toHaveClass('w-[132px]')
  expect(screen.getByLabelText('Compact select')).not.toHaveClass('w-full')
})

test('tabs, dropdown menu, and pagination expose expected controls', async () => {
  const user = userEvent.setup()
  const onSelect = vi.fn()
  const onPageChange = vi.fn()

  render(
    <div>
      <Tabs
        items={[
          { id: 'one', label: 'One', content: <p>First panel</p> },
          { id: 'two', label: 'Two', content: <p>Second panel</p> },
        ]}
      />
      <DropdownMenu label="Actions" items={[{ id: 'save', label: 'Save view', onSelect }]} />
      <Pagination page={2} pageSize={10} total={35} onPageChange={onPageChange} />
      <Button>Plain button</Button>
    </div>,
  )

  await user.click(screen.getByRole('tab', { name: 'Two' }))
  expect(screen.getByText('Second panel')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Actions' }))
  await user.click(screen.getByRole('menuitem', { name: 'Save view' }))
  expect(onSelect).toHaveBeenCalled()
  await user.click(screen.getByRole('button', { name: 'Next' }))
  expect(onPageChange).toHaveBeenCalledWith(3)
})

test('barrel exports the new primitives with their accessible surfaces', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  const onIcon = vi.fn()

  function Harness() {
    const [open, setOpen] = useState(false)
    return (
      <div>
        <IconButton aria-label="Open settings" onClick={onIcon}>⚙</IconButton>
        <SegmentedControl
          label="Range"
          options={[
            { value: '30d', label: '30d' },
            { value: '90d', label: '90d' },
          ]}
          onValueChange={onValueChange}
        />
        <InlineAlert tone="warn" title="Heads up">Two columns are hidden.</InlineAlert>
        <Button onClick={() => setOpen(true)}>Open drawer</Button>
        {open && (
          <Drawer title="Saved views" onClose={() => setOpen(false)}>
            <p>Drawer body</p>
          </Drawer>
        )}
      </div>
    )
  }

  render(<Harness />)

  await user.click(screen.getByRole('button', { name: 'Open settings' }))
  expect(onIcon).toHaveBeenCalled()

  expect(screen.getByRole('radiogroup', { name: 'Range' })).toBeInTheDocument()
  await user.click(screen.getByRole('radio', { name: '90d' }))
  expect(onValueChange).toHaveBeenCalledWith('90d')

  expect(screen.getByRole('alert')).toHaveTextContent('Two columns are hidden.')

  await user.click(screen.getByRole('button', { name: 'Open drawer' }))
  expect(screen.getByRole('dialog')).toHaveTextContent('Saved views')
})

test('barrel exports the form primitives (RadioGroup, Combobox, Spinner)', async () => {
  const user = userEvent.setup()
  const onRadio = vi.fn()
  const onCombo = vi.fn()

  render(
    <div>
      <Spinner label="Loading data" />
      <RadioGroup
        label="Plan"
        defaultValue="pro"
        onValueChange={onRadio}
        options={[
          { value: 'pro', label: 'Pro' },
          { value: 'team', label: 'Team' },
        ]}
      />
      <Combobox
        options={[
          { value: 'a', label: 'Avery' },
          { value: 'b', label: 'Bced' },
        ]}
        onValueChange={onCombo}
      />
    </div>,
  )

  expect(screen.getByRole('status', { name: 'Loading data' })).toBeInTheDocument()

  await user.click(screen.getByRole('radio', { name: 'Team' }))
  expect(onRadio).toHaveBeenCalledWith('team')

  await user.click(screen.getByRole('combobox'))
  await user.click(screen.getByRole('option', { name: 'Avery' }))
  expect(onCombo).toHaveBeenCalledWith('a')
})
