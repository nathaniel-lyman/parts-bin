import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { MultiSelect } from './MultiSelect'

const options = [
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'mid', label: 'Mid-market' },
  { value: 'startup', label: 'Startup' },
  { value: 'legacy', label: 'Legacy', disabled: true },
]

test('selecting options adds tokens and keeps the listbox open', () => {
  const onValuesChange = vi.fn()
  render(<MultiSelect options={options} defaultValues={[]} onValuesChange={onValuesChange} placeholder="Segments" />)
  const input = screen.getByRole('combobox')
  fireEvent.focus(input)

  fireEvent.mouseDown(screen.getByRole('option', { name: 'Enterprise' }))
  expect(onValuesChange).toHaveBeenLastCalledWith(['enterprise'])
  // multi-pick: list stays open and the chosen option reads selected
  expect(screen.getByRole('listbox')).toBeInTheDocument()
  expect(screen.getByRole('option', { name: 'Enterprise' })).toHaveAttribute('aria-selected', 'true')
  // token chip rendered with a remove control
  expect(screen.getByRole('button', { name: 'Remove Enterprise' })).toBeInTheDocument()

  fireEvent.mouseDown(screen.getByRole('option', { name: 'Startup' }))
  expect(onValuesChange).toHaveBeenLastCalledWith(['enterprise', 'startup'])
})

test('selecting an already-selected option deselects it', () => {
  const onValuesChange = vi.fn()
  render(<MultiSelect options={options} defaultValues={['enterprise']} onValuesChange={onValuesChange} />)
  fireEvent.focus(screen.getByRole('combobox'))
  fireEvent.mouseDown(screen.getByRole('option', { name: 'Enterprise' }))
  expect(onValuesChange).toHaveBeenLastCalledWith([])
})

test('typing filters options; Enter toggles the active one', () => {
  const onValuesChange = vi.fn()
  render(<MultiSelect options={options} defaultValues={[]} onValuesChange={onValuesChange} />)
  const input = screen.getByRole('combobox')
  fireEvent.focus(input)
  fireEvent.change(input, { target: { value: 'start' } })

  expect(screen.getAllByRole('option')).toHaveLength(1)
  fireEvent.keyDown(input, { key: 'Enter' })
  expect(onValuesChange).toHaveBeenLastCalledWith(['startup'])
  // query clears after a pick so the next search starts fresh
  expect(input).toHaveValue('')
})

test('Backspace on an empty query removes the last token', () => {
  const onValuesChange = vi.fn()
  render(<MultiSelect options={options} defaultValues={['enterprise', 'mid']} onValuesChange={onValuesChange} />)
  const input = screen.getByRole('combobox')
  fireEvent.focus(input)
  fireEvent.keyDown(input, { key: 'Backspace' })
  expect(onValuesChange).toHaveBeenLastCalledWith(['enterprise'])
})

test('token remove buttons remove that value', () => {
  const onValuesChange = vi.fn()
  render(<MultiSelect options={options} defaultValues={['enterprise', 'mid']} onValuesChange={onValuesChange} />)
  fireEvent.click(screen.getByRole('button', { name: 'Remove Enterprise' }))
  expect(onValuesChange).toHaveBeenLastCalledWith(['mid'])
})

test('Escape closes the listbox and disabled options cannot be picked', () => {
  const onValuesChange = vi.fn()
  render(<MultiSelect options={options} defaultValues={[]} onValuesChange={onValuesChange} />)
  const input = screen.getByRole('combobox')
  fireEvent.focus(input)
  fireEvent.mouseDown(screen.getByRole('option', { name: 'Legacy' }))
  expect(onValuesChange).not.toHaveBeenCalled()

  fireEvent.keyDown(input, { key: 'Escape' })
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
})
