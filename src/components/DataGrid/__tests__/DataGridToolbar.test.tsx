import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DataGridToolbar } from '../DataGridToolbar'

const COLS = [
  { id: 'account', header: 'Account', hideable: true },
  { id: 'arr', header: 'ARR', hideable: true },
  { id: 'actions', header: '', hideable: false },
]

function setup() {
  const dispatch = vi.fn()
  render(<DataGridToolbar columns={COLS} columnVisibility={{ account: true, arr: false }} density="compact" dispatch={dispatch} />)
  return dispatch
}

describe('DataGridToolbar', () => {
  it('density control dispatches SET_DENSITY', () => {
    const dispatch = setup()
    fireEvent.change(screen.getByLabelText(/density/i), { target: { value: 'comfortable' } })
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_DENSITY', density: 'comfortable' })
  })

  it('columns menu lists hideable columns and toggling dispatches TOGGLE_COLUMN_VISIBILITY', () => {
    const dispatch = setup()
    fireEvent.click(screen.getByRole('button', { name: /columns/i }))
    const arr = screen.getByRole('checkbox', { name: 'ARR' })
    expect(arr).not.toBeChecked()
    fireEvent.click(arr)
    expect(dispatch).toHaveBeenCalledWith({ type: 'TOGGLE_COLUMN_VISIBILITY', id: 'arr' })
  })

  it('columns menu omits the non-hideable actions column', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: /columns/i }))
    expect(screen.getAllByRole('checkbox')).toHaveLength(2)
  })

  it('reset-to-default dispatches RESET_COLUMNS', () => {
    const dispatch = setup()
    fireEvent.click(screen.getByRole('button', { name: /columns/i }))
    fireEvent.click(screen.getByRole('button', { name: /reset to default/i }))
    expect(dispatch).toHaveBeenCalledWith({ type: 'RESET_COLUMNS' })
  })
})

