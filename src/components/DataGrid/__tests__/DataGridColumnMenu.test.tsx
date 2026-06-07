import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DataGridColumnMenu } from '../DataGridColumnMenu'

function open(props: Partial<React.ComponentProps<typeof DataGridColumnMenu>> = {}) {
  const dispatch = vi.fn()
  render(
    <DataGridColumnMenu
      columnId="mrr"
      header="MRR"
      type="currency"
      sortDirection={false}
      hideable
      canPin={false}
      pinSide={false}
      dispatch={dispatch}
      {...props}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: /column menu/i }))
  return dispatch
}

describe('DataGridColumnMenu shell', () => {
  it('Sort ascending dispatches SET_SORT asc', () => {
    const dispatch = open()
    fireEvent.click(screen.getByRole('menuitem', { name: /sort ascending/i }))
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_SORT', id: 'mrr', desc: false, additive: false })
  })

  it('Sort descending dispatches SET_SORT desc', () => {
    const dispatch = open()
    fireEvent.click(screen.getByRole('menuitem', { name: /sort descending/i }))
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_SORT', id: 'mrr', desc: true, additive: false })
  })

  it('Clear sort dispatches CLEAR_SORT for the column', () => {
    const dispatch = open({ sortDirection: 'desc' })
    fireEvent.click(screen.getByRole('menuitem', { name: /clear sort/i }))
    expect(dispatch).toHaveBeenCalledWith({ type: 'CLEAR_SORT', id: 'mrr' })
  })

  it('Hide column dispatches TOGGLE_COLUMN_VISIBILITY', () => {
    const dispatch = open()
    fireEvent.click(screen.getByRole('menuitem', { name: /hide column/i }))
    expect(dispatch).toHaveBeenCalledWith({ type: 'TOGGLE_COLUMN_VISIBILITY', id: 'mrr' })
  })

  it('Reset width dispatches RESET_COLUMN_WIDTH', () => {
    const dispatch = open()
    fireEvent.click(screen.getByRole('menuitem', { name: /reset width/i }))
    expect(dispatch).toHaveBeenCalledWith({ type: 'RESET_COLUMN_WIDTH', id: 'mrr' })
  })

  it('renders a disabled per-column filter affordance placeholder', () => {
    open()
    expect(screen.getByPlaceholderText(/filter value/i)).toBeDisabled()
    expect(screen.getByText(/filter wired in phase 3/i)).toBeInTheDocument()
  })

  it('omits Hide column for a non-hideable column', () => {
    open({ hideable: false })
    expect(screen.queryByRole('menuitem', { name: /hide column/i })).toBeNull()
  })

  it('falls back to the column id in the aria-label when header is empty', () => {
    const dispatch = vi.fn()
    render(
      <DataGridColumnMenu
        columnId="actions"
        header=""
        type="actions"
        sortDirection={false}
        hideable={false}
        canPin={false}
        pinSide={false}
        dispatch={dispatch}
      />,
    )
    expect(screen.getByRole('button', { name: 'actions column menu' })).toBeInTheDocument()
  })
})

