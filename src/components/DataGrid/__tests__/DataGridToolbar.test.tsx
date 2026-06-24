import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('tool panel density control dispatches SET_DENSITY', async () => {
    const { dispatch } = setup()
    await userEvent.click(screen.getByRole('button', { name: /grid tools/i }))
    await userEvent.click(screen.getByRole('tab', { name: /view/i }))
    fireEvent.change(screen.getByLabelText(/tool panel density/i), { target: { value: 'comfortable' } })
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_DENSITY', density: 'comfortable' })
  })

  it('tool panel density options use title-case labels', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: /grid tools/i }))
    await userEvent.click(screen.getByRole('tab', { name: /view/i }))
    expect(screen.getByRole('option', { name: 'Compact' })).toHaveValue('compact')
    expect(screen.getByRole('option', { name: 'Standard' })).toHaveValue('standard')
    expect(screen.getByRole('option', { name: 'Comfortable' })).toHaveValue('comfortable')
  })

  it('tool panel lists manageable columns and toggling dispatches TOGGLE_COLUMN_VISIBILITY', async () => {
    const { dispatch } = setup()
    await userEvent.click(screen.getByRole('button', { name: /grid tools/i }))
    const arr = screen.getByRole('checkbox', { name: 'ARR' })
    expect(arr).not.toBeChecked()
    fireEvent.click(arr)
    expect(dispatch).toHaveBeenCalledWith({ type: 'TOGGLE_COLUMN_VISIBILITY', id: 'arr' })
  })

  it('tool panel omits the locked actions column', async () => {
    setup()
    await userEvent.click(screen.getByRole('button', { name: /grid tools/i }))
    expect(screen.getAllByRole('checkbox')).toHaveLength(2)
  })

  it('reset columns dispatches RESET_COLUMNS', async () => {
    const { dispatch } = setup()
    await userEvent.click(screen.getByRole('button', { name: /grid tools/i }))
    fireEvent.click(screen.getByRole('button', { name: /reset columns/i }))
    expect(dispatch).toHaveBeenCalledWith({ type: 'RESET_COLUMNS' })
  })

  it('tool panel filters clear global and column filters', async () => {
    const dispatch = vi.fn()
    render(
      <DataGridToolbar
        columns={COLS}
        columnVisibility={{ account: true, arr: false }}
        columnFilters={[{ id: 'account', value: { operator: 'contains', value: 'acme' } }]}
        globalFilter="risk"
        density="compact"
        dispatch={dispatch}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: /grid tools/i }))
    await userEvent.click(screen.getByRole('tab', { name: /filters/i }))
    await userEvent.click(screen.getByRole('button', { name: /clear all filters/i }))

    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_GLOBAL_FILTER', value: '' })
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_COLUMN_FILTERS', columnFilters: [] })
  })

  it('tool panel groups toggles groupable columns', async () => {
    const dispatch = vi.fn()
    render(
      <DataGridToolbar
        columns={[...COLS, { id: 'segment', header: 'Segment', hideable: true, groupable: true }]}
        columnVisibility={{ account: true, arr: false, segment: true }}
        globalFilter=""
        density="compact"
        dispatch={dispatch}
        enableGrouping
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: /grid tools/i }))
    await userEvent.click(screen.getByRole('tab', { name: /groups/i }))
    await userEvent.click(screen.getByRole('checkbox', { name: /group by segment/i }))

    expect(dispatch).toHaveBeenCalledWith({ type: 'TOGGLE_GROUP_BY', columnId: 'segment' })
  })

  it('toggles inline header filters from the toolbar', () => {
    const { onToggleHeaderFilters } = setup()
    const button = screen.getByRole('button', { name: /filters/i })
    expect(button).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(button)
    expect(onToggleHeaderFilters).toHaveBeenCalled()
  })

  it('renders Excel export when the callback is provided', () => {
    const dispatch = vi.fn()
    const onExportXlsx = vi.fn()
    render(
      <DataGridToolbar
        columns={COLS}
        columnVisibility={{ account: true, arr: false }}
        globalFilter=""
        density="compact"
        dispatch={dispatch}
        enableExport
        onExportXlsx={onExportXlsx}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /export excel/i }))
    expect(onExportXlsx).toHaveBeenCalled()
  })

  it('renders all-row export actions when server callbacks are provided', () => {
    const dispatch = vi.fn()
    const onExportAllCsv = vi.fn()
    const onExportAllXlsx = vi.fn()
    render(
      <DataGridToolbar
        columns={COLS}
        columnVisibility={{ account: true, arr: false }}
        globalFilter=""
        density="compact"
        dispatch={dispatch}
        enableExport
        onExportAllCsv={onExportAllCsv}
        onExportAllXlsx={onExportAllXlsx}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /export all csv/i }))
    fireEvent.click(screen.getByRole('button', { name: /export all excel/i }))
    expect(onExportAllCsv).toHaveBeenCalled()
    expect(onExportAllXlsx).toHaveBeenCalled()
  })
})
