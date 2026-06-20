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
  const onToggleHeaderFilters = vi.fn()
  render(
    <DataGridToolbar
      columns={COLS}
      columnVisibility={{ account: true, arr: false }}
      globalFilter=""
      density="compact"
      dispatch={dispatch}
      enableHeaderFilters
      headerFiltersOpen={false}
      onToggleHeaderFilters={onToggleHeaderFilters}
    />,
  )
  return { dispatch, onToggleHeaderFilters }
}

describe('DataGridToolbar', () => {
  it('quick filter dispatches SET_GLOBAL_FILTER', () => {
    const { dispatch } = setup()
    fireEvent.change(screen.getByPlaceholderText(/search rows/i), { target: { value: 'acme' } })
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_GLOBAL_FILTER', value: 'acme' })
  })

  it('density control dispatches SET_DENSITY', () => {
    const { dispatch } = setup()
    fireEvent.change(screen.getByLabelText(/density/i), { target: { value: 'comfortable' } })
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_DENSITY', density: 'comfortable' })
  })

  it('density options use title-case labels', () => {
    setup()
    expect(screen.getByRole('option', { name: 'Compact' })).toHaveValue('compact')
    expect(screen.getByRole('option', { name: 'Standard' })).toHaveValue('standard')
    expect(screen.getByRole('option', { name: 'Comfortable' })).toHaveValue('comfortable')
  })

  it('columns menu lists hideable columns and toggling dispatches TOGGLE_COLUMN_VISIBILITY', () => {
    const { dispatch } = setup()
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
    const { dispatch } = setup()
    fireEvent.click(screen.getByRole('button', { name: /columns/i }))
    fireEvent.click(screen.getByRole('button', { name: /reset to default/i }))
    expect(dispatch).toHaveBeenCalledWith({ type: 'RESET_COLUMNS' })
  })

  it('toggles inline header filters from the toolbar', () => {
    const { onToggleHeaderFilters } = setup()
    const button = screen.getByRole('button', { name: /filters/i })
    expect(button).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(button)
    expect(onToggleHeaderFilters).toHaveBeenCalled()
  })
})
