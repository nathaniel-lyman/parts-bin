import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Button,
  Checkbox,
  DropdownMenu,
  Field,
  Input,
  Pagination,
  Select,
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
