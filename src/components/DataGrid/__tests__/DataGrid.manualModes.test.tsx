import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DataGrid } from '../DataGrid'
import { productColumns, productRows } from './fixtures'

const noop = vi.fn()

describe('DataGrid manual server modes', () => {
  it('does not client-filter in manualFiltering mode', async () => {
    const user = userEvent.setup()
    render(
      <DataGrid
        rows={productRows}
        columns={productColumns}
        getRowId={(row) => row.id}
        manualSorting
        manualFiltering
        manualPagination
        totalRowCount={productRows.length}
        onQueryChange={noop}
      />,
    )

    await user.type(screen.getByPlaceholderText(/search rows/i), 'widget')

    expect(screen.getByText('Gadget')).toBeInTheDocument()
  })

  it('emits query changes and labels select-all as loaded in server mode', async () => {
    const user = userEvent.setup()
    const onQueryChange = vi.fn()
    render(
      <DataGrid
        rows={productRows}
        columns={productColumns}
        getRowId={(row) => row.id}
        enableRowSelection
        manualSorting
        manualFiltering
        manualPagination
        totalRowCount={9999}
        onQueryChange={onQueryChange}
      />,
    )

    expect(screen.getByRole('checkbox', { name: /select all loaded/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /select all 9999/i })).toBeNull()
    await user.type(screen.getByPlaceholderText(/search rows/i), 'gdt')
    await waitFor(() => expect(onQueryChange).toHaveBeenLastCalledWith(expect.objectContaining({ globalFilter: 'gdt', scope: 'page' })))
  })

  it('offers an explicit all-matching selection action in server mode', async () => {
    const user = userEvent.setup()
    const onSelectAllMatching = vi.fn()
    render(
      <DataGrid
        rows={productRows.slice(0, 3)}
        columns={productColumns}
        getRowId={(row) => row.id}
        enableRowSelection
        manualSorting
        manualFiltering
        manualPagination
        totalRowCount={9999}
        onQueryChange={noop}
        onSelectAllMatching={onSelectAllMatching}
      />,
    )

    await user.click(screen.getByRole('checkbox', { name: /select all loaded/i }))
    await user.click(screen.getByRole('button', { name: /select all 9999 matching rows/i }))

    expect(onSelectAllMatching).toHaveBeenCalledWith(expect.objectContaining({ scope: 'allMatching' }))
  })

  it('surfaces consumer-owned all-matching selection and clear action', async () => {
    const user = userEvent.setup()
    const onClearAllMatching = vi.fn()
    render(
      <DataGrid
        rows={productRows.slice(0, 3)}
        columns={productColumns}
        getRowId={(row) => row.id}
        enableRowSelection
        manualSorting
        manualFiltering
        manualPagination
        totalRowCount={9999}
        allMatchingRowsSelected
        onClearAllMatching={onClearAllMatching}
        onQueryChange={noop}
      />,
    )

    expect(screen.getByText('9999 matching rows selected')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /clear selection/i }))
    expect(onClearAllMatching).toHaveBeenCalled()
  })

  it('delegates all-matching export actions to the server consumer', async () => {
    const user = userEvent.setup()
    const onExportAllCsv = vi.fn()
    const onExportAllXlsx = vi.fn()
    render(
      <DataGrid
        rows={productRows.slice(0, 3)}
        columns={productColumns}
        getRowId={(row) => row.id}
        enableExport
        enableExcelExport
        manualSorting
        manualFiltering
        manualPagination
        totalRowCount={9999}
        onQueryChange={noop}
        onExportAllCsv={onExportAllCsv}
        onExportAllXlsx={onExportAllXlsx}
      />,
    )

    await user.click(screen.getByRole('button', { name: /export all csv/i }))
    await user.click(screen.getByRole('button', { name: /export all excel/i }))

    expect(onExportAllCsv).toHaveBeenCalledWith(expect.objectContaining({ scope: 'allMatching' }))
    expect(onExportAllXlsx).toHaveBeenCalledWith(expect.objectContaining({ scope: 'allMatching' }))
  })
})
