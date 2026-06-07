import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DataGridColumnMenu } from '../DataGridColumnMenu'

function open(props: Partial<React.ComponentProps<typeof DataGridColumnMenu>> = {}) {
  const dispatch = vi.fn()
  render(
    <DataGridColumnMenu
      columnId="account"
      header="Account"
      type="text"
      sortDirection={false}
      hideable
      canPin
      pinSide={false}
      dispatch={dispatch}
      {...props}
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: /column menu/i }))
  return dispatch
}

describe('DataGridColumnMenu pin entries', () => {
  it('Pin left dispatches PIN_COLUMN left', () => {
    const dispatch = open()
    fireEvent.click(screen.getByRole('menuitem', { name: /pin left/i }))
    expect(dispatch).toHaveBeenCalledWith({ type: 'PIN_COLUMN', id: 'account', side: 'left' })
  })

  it('Pin right dispatches PIN_COLUMN right', () => {
    const dispatch = open()
    fireEvent.click(screen.getByRole('menuitem', { name: /pin right/i }))
    expect(dispatch).toHaveBeenCalledWith({ type: 'PIN_COLUMN', id: 'account', side: 'right' })
  })

  it('shows Unpin when the column is already pinned', () => {
    const dispatch = open({ pinSide: 'left' })
    expect(screen.queryByRole('menuitem', { name: /pin left/i })).toBeNull()
    fireEvent.click(screen.getByRole('menuitem', { name: /unpin/i }))
    expect(dispatch).toHaveBeenCalledWith({ type: 'UNPIN_COLUMN', id: 'account' })
  })

  it('hides all pin entries for the locked actions column', () => {
    open({ columnId: 'actions', header: '', type: 'actions', hideable: false, canPin: false, pinSide: 'right' })
    expect(screen.queryByRole('menuitem', { name: /pin left/i })).toBeNull()
    expect(screen.queryByRole('menuitem', { name: /pin right/i })).toBeNull()
    expect(screen.queryByRole('menuitem', { name: /unpin/i })).toBeNull()
  })
})

