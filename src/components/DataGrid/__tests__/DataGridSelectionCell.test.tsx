import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DataGridRowCheckbox, DataGridSelectAllCheckbox } from '../DataGridSelectionCell'

describe('DataGridRowCheckbox', () => {
  it('reflects selected state and toggles on click', async () => {
    const onToggle = vi.fn()
    render(<DataGridRowCheckbox rowId="a1" rowLabel="Acme" checked={false} onToggle={onToggle} />)
    const box = screen.getByRole('checkbox', { name: 'Select Acme' })
    expect(box).not.toBeChecked()
    await userEvent.click(box)
    expect(onToggle).toHaveBeenCalledWith('a1')
  })
})

describe('DataGridSelectAllCheckbox', () => {
  it('reflects none, some, and all states', () => {
    const { rerender } = render(<DataGridSelectAllCheckbox state="none" onChange={vi.fn()} />)
    const box = screen.getByRole('checkbox', { name: /select all rows/i }) as HTMLInputElement
    expect(box).not.toBeChecked()
    expect(box.indeterminate).toBe(false)

    rerender(<DataGridSelectAllCheckbox state="some" onChange={vi.fn()} />)
    expect(box).not.toBeChecked()
    expect(box.indeterminate).toBe(true)

    rerender(<DataGridSelectAllCheckbox state="all" onChange={vi.fn()} />)
    expect(box).toBeChecked()
  })

  it('calls onChange with the next select-all intent', async () => {
    const onChange = vi.fn()
    const { rerender } = render(<DataGridSelectAllCheckbox state="none" onChange={onChange} />)
    await userEvent.click(screen.getByRole('checkbox', { name: /select all rows/i }))
    expect(onChange).toHaveBeenLastCalledWith(true)

    rerender(<DataGridSelectAllCheckbox state="all" onChange={onChange} />)
    await userEvent.click(screen.getByRole('checkbox', { name: /select all rows/i }))
    expect(onChange).toHaveBeenLastCalledWith(false)
  })
})
