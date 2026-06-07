import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DataGridToolbar } from '../DataGridToolbar'

const baseProps = {
  columns: [],
  columnVisibility: {},
  globalFilter: '',
  density: 'compact' as const,
  dispatch: vi.fn(),
}

describe('DataGridToolbar saved views', () => {
  it('lists and applies saved views', async () => {
    const onApplyView = vi.fn()
    render(
      <DataGridToolbar
        {...baseProps}
        savedViews={[{ id: 'v1', name: 'Risk view' }]}
        onApplyView={onApplyView}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: /views/i }))
    await userEvent.click(screen.getByRole('button', { name: /apply risk view/i }))

    expect(onApplyView).toHaveBeenCalledWith('v1')
  })

  it('saves, deletes, resets, and exports', async () => {
    const onSaveView = vi.fn()
    const onDeleteView = vi.fn()
    const onResetView = vi.fn()
    const onExportCsv = vi.fn()
    render(
      <DataGridToolbar
        {...baseProps}
        enableExport
        onExportCsv={onExportCsv}
        savedViews={[{ id: 'v2', name: 'Revenue view' }]}
        onSaveView={onSaveView}
        onDeleteView={onDeleteView}
        onResetView={onResetView}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: /export csv/i }))
    expect(onExportCsv).toHaveBeenCalledTimes(1)

    await userEvent.click(screen.getByRole('button', { name: /views/i }))
    await userEvent.type(screen.getByPlaceholderText(/view name/i), 'Snapshot')
    await userEvent.click(screen.getByRole('button', { name: /save current/i }))
    expect(onSaveView).toHaveBeenCalledWith('Snapshot')

    await userEvent.click(screen.getByRole('button', { name: /delete revenue view/i }))
    expect(onDeleteView).toHaveBeenCalledWith('v2')

    await userEvent.click(screen.getByRole('button', { name: /reset to default/i }))
    expect(onResetView).toHaveBeenCalledTimes(1)
  })
})
