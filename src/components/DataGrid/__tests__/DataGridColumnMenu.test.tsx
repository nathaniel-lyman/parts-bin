import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DataGridColumnMenu } from '../DataGridColumnMenu'

const initialInnerWidth = window.innerWidth

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
  afterEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: initialInnerWidth })
  })

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

  it('Autofit to content invokes onAutofit with the column id', () => {
    const onAutofit = vi.fn()
    open({ onAutofit })
    fireEvent.click(screen.getByRole('menuitem', { name: /autofit to content/i }))
    expect(onAutofit).toHaveBeenCalledWith('mrr')
  })

  it('omits Autofit to content when no onAutofit handler is provided', () => {
    open()
    expect(screen.queryByRole('menuitem', { name: /autofit to content/i })).toBeNull()
  })

  it('dispatches per-column filter changes', () => {
    const dispatch = open()
    fireEvent.click(screen.getByRole('menuitem', { name: /filter/i }))
    fireEvent.change(screen.getByLabelText(/mrr filter value/i), { target: { value: '1000' } })
    expect(screen.getByPlaceholderText(/filter value/i)).toBeEnabled()
    expect(screen.queryByText(/filter wired in phase 3/i)).toBeNull()
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_COLUMN_FILTER', columnId: 'mrr', value: { operator: 'equals', value: '1000' } })
  })

  it('opens a number format panel for numeric columns', () => {
    open()
    fireEvent.click(screen.getByRole('menuitem', { name: /number format/i }))
    expect(screen.getByRole('dialog', { name: /mrr number format/i })).toBeInTheDocument()
    expect(screen.getByText('$12,346')).toBeInTheDocument()
  })

  it('dispatches number format changes and reset', () => {
    const dispatch = open()
    fireEvent.click(screen.getByRole('menuitem', { name: /number format/i }))
    fireEvent.change(screen.getByLabelText(/mrr number format currency/i), { target: { value: 'EUR' } })
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SET_COLUMN_NUMBER_FORMAT',
      columnId: 'mrr',
      format: expect.objectContaining({ style: 'currency', currency: 'EUR' }),
    })

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(dispatch).toHaveBeenCalledWith({ type: 'CLEAR_COLUMN_NUMBER_FORMAT', columnId: 'mrr' })
  })

  it('omits number format for non-numeric columns', () => {
    open({ type: 'text' })
    expect(screen.queryByRole('menuitem', { name: /number format/i })).toBeNull()
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

  it('positions the menu fixed and clamps it inside the viewport', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: 817 })
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: -12,
      y: 100,
      width: 32,
      height: 28,
      top: 100,
      right: 20,
      bottom: 128,
      left: -12,
      toJSON: () => ({}),
    } as DOMRect)

    open()

    const menu = screen.getByRole('menu', { name: /mrr column menu/i })
    expect(menu).toHaveClass('fixed')
    expect(menu).toHaveClass('z-50')
    expect(menu.parentElement).toBe(document.body)
    expect(menu).toHaveStyle({
      left: '8px',
      top: '132px',
    })
  })
})
