import { expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Combobox } from './Combobox'
import { Field } from './Field'

const options = [
  { value: 'a', label: 'Acme' },
  { value: 'b', label: 'Globex' },
  { value: 'c', label: 'Initech' },
]

test('Combobox filters as you type and selects with the keyboard', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(<Combobox options={options} placeholder="Search owners" onValueChange={onValueChange} />)

  const input = screen.getByRole('combobox')
  await user.click(input)
  expect(screen.getByRole('listbox')).toBeInTheDocument()

  await user.type(input, 'ini')
  const visible = screen.getAllByRole('option')
  expect(visible).toHaveLength(1)
  expect(visible[0]).toHaveTextContent('Initech')
  expect(input).toHaveAttribute('aria-activedescendant', visible[0].id)

  await user.keyboard('{Enter}')
  expect(onValueChange).toHaveBeenCalledWith('c')
  expect(input).toHaveValue('Initech')
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
})

test('Combobox highlights options with arrow keys', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(<Combobox options={options} onValueChange={onValueChange} />)

  const input = screen.getByRole('combobox')
  await user.click(input) // opens with the first option (Acme) highlighted
  await user.keyboard('{ArrowDown}{Enter}') // move to Globex, select
  expect(onValueChange).toHaveBeenCalledWith('b')
})

test('Combobox shows an empty message when nothing matches', async () => {
  const user = userEvent.setup()
  render(<Combobox options={options} emptyMessage="No owners" />)
  const input = screen.getByRole('combobox')
  await user.click(input)
  await user.type(input, 'zzz')
  expect(screen.queryAllByRole('option')).toHaveLength(0)
  expect(screen.getByText('No owners')).toBeInTheDocument()
})

test('Combobox integrates with Field label and selects by click', async () => {
  const user = userEvent.setup()
  render(
    <Field label="Owner" hint="Pick the record owner.">
      <Combobox options={[{ value: 'av', label: 'Avery' }]} />
    </Field>,
  )

  const input = screen.getByRole('combobox', { name: 'Owner' })
  expect(input).toHaveAccessibleDescription('Pick the record owner.')

  await user.click(input)
  await user.click(screen.getByRole('option', { name: 'Avery' }))
  expect(input).toHaveValue('Avery')
})

test('Combobox renders the listbox in a portal so overflow ancestors cannot clip it', async () => {
  const user = userEvent.setup()
  render(
    <div style={{ overflow: 'hidden' }}>
      <Combobox options={options} />
    </div>,
  )

  await user.click(screen.getByRole('combobox'))
  expect(screen.getByRole('listbox').parentElement).toBe(document.body)
})
