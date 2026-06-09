import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { Slider } from './Slider'

test('renders a labelled slider with min/max/step and reports numeric changes', () => {
  const onValueChange = vi.fn()
  render(<Slider label="Threshold" min={0} max={50} step={5} defaultValue={20} onValueChange={onValueChange} />)
  const slider = screen.getByRole('slider', { name: 'Threshold' })
  expect(slider).toHaveAttribute('min', '0')
  expect(slider).toHaveAttribute('max', '50')
  expect(slider).toHaveAttribute('step', '5')
  expect(slider).toHaveValue('20')

  fireEvent.change(slider, { target: { value: '35' } })
  expect(onValueChange).toHaveBeenCalledWith(35)
  expect(slider).toHaveValue('35')
})

test('showValue renders the current value, formatted when a formatter is given', () => {
  render(<Slider label="Discount" defaultValue={15} showValue formatValue={(v) => `${v}%`} />)
  expect(screen.getByText('15%')).toBeInTheDocument()
})

test('controlled value follows the prop', () => {
  const { rerender } = render(<Slider aria-label="Volume" value={10} onValueChange={() => {}} />)
  expect(screen.getByRole('slider')).toHaveValue('10')
  rerender(<Slider aria-label="Volume" value={60} onValueChange={() => {}} />)
  expect(screen.getByRole('slider')).toHaveValue('60')
})

test('themes the native control with the accent token', () => {
  render(<Slider aria-label="Volume" defaultValue={30} />)
  expect(screen.getByRole('slider').style.accentColor).toBe('var(--accent)')
})
