import { expect, test, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DatePicker, DateRangePicker } from './DatePicker'
import { addDays, formatDateRangeLabel, type DateRange } from './dateUtils'

test('DatePicker reports native date changes', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(<DatePicker label="Start" value="" onValueChange={onValueChange} />)

  await user.type(screen.getByLabelText('Start'), '2026-06-08')
  expect(onValueChange).toHaveBeenLastCalledWith('2026-06-08')
})

test('DatePicker exposes a calendar trigger for manual entry', async () => {
  const user = userEvent.setup()
  const showPicker = vi.fn()
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'showPicker')
  Object.defineProperty(HTMLInputElement.prototype, 'showPicker', {
    configurable: true,
    value: showPicker,
  })

  try {
    render(<DatePicker label="Start" value="2026-06-08" />)

    await user.click(screen.getByRole('button', { name: 'Open Start calendar' }))
    expect(showPicker).toHaveBeenCalledTimes(1)
    expect(screen.getByLabelText('Start')).toHaveFocus()
  } finally {
    if (descriptor) {
      Object.defineProperty(HTMLInputElement.prototype, 'showPicker', descriptor)
    } else {
      delete (HTMLInputElement.prototype as Partial<HTMLInputElement>).showPicker
    }
  }
})

test('DateRangePicker applies presets and edited dates', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  const value: DateRange = { start: '2026-06-01', end: '2026-06-08' }

  render(
    <DateRangePicker
      label="Dates"
      value={value}
      onValueChange={onValueChange}
      presets={[{ id: 'last-7', label: 'Last 7 days', range: value }]}
    />,
  )

  await user.click(screen.getByRole('button', { name: /dates/i }))
  expect(screen.getByRole('dialog', { name: 'Dates' })).toBeInTheDocument()

  await user.clear(screen.getByLabelText('Start'))
  await user.type(screen.getByLabelText('Start'), '2026-05-15')
  await user.click(screen.getByRole('button', { name: 'Apply' }))
  expect(onValueChange).toHaveBeenCalledWith({ start: '2026-05-15', end: '2026-06-08' })
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
})

test('DateRangePicker prevents inverted ranges', async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()

  render(
    <DateRangePicker
      value={{ start: '2026-06-01', end: '2026-06-08' }}
      onValueChange={onValueChange}
    />,
  )

  await user.click(screen.getByRole('button', { name: /date range/i }))
  await user.clear(screen.getByLabelText('Start'))
  await user.type(screen.getByLabelText('Start'), '2026-06-20')
  expect(screen.getByText('Start date must be before end date.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
})

test('date helpers format labels and trailing ranges', () => {
  expect(addDays('2026-06-08', -6)).toBe('2026-06-02')
  expect(formatDateRangeLabel({ start: '2026-06-01', end: '2026-06-08' })).toBe('Jun 1, 2026 - Jun 8, 2026')
  expect(formatDateRangeLabel({ start: '', end: '' })).toBe('Select dates')
})
