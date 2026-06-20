import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { seedAccounts } from '../../../data/accounts'
import { accountGridColumns } from '../../accountGridColumns'
import { GRID_STORAGE_KEY, GRID_VIEW_VERSION } from '../persistence'
import { DataGrid } from '../DataGrid'

describe('DataGrid persistence integration', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('boots from ledger.accounts.grid when persistenceKey is provided', () => {
    localStorage.setItem(
      GRID_STORAGE_KEY,
      JSON.stringify({ version: GRID_VIEW_VERSION, columnVisibility: { arr: true } }),
    )

    render(
      <DataGrid
        rows={seedAccounts}
        columns={accountGridColumns({ onEdit: vi.fn(), onDelete: vi.fn() })}
        getRowId={(row) => row.id}
        persistenceKey="ledger.accounts.grid"
      />,
    )

    expect(screen.getByRole('columnheader', { name: /ARR/ })).toBeInTheDocument()
  })

  it('uses initialState when no persisted or legacy view exists', () => {
    render(
      <DataGrid
        rows={seedAccounts}
        columns={accountGridColumns({ onEdit: vi.fn(), onDelete: vi.fn() })}
        getRowId={(row) => row.id}
        initialState={{ density: 'comfortable' }}
        persistenceKey="ledger.accounts.grid"
      />,
    )

    expect(screen.getByRole('combobox', { name: /Density/ })).toHaveValue('comfortable')
  })

  it('writes the grid projection through useGridPersistence', () => {
    vi.useFakeTimers()
    render(
      <DataGrid
        rows={seedAccounts}
        columns={accountGridColumns({ onEdit: vi.fn(), onDelete: vi.fn() })}
        getRowId={(row) => row.id}
        initialState={{ density: 'comfortable' }}
        persistenceKey="ledger.accounts.grid"
      />,
    )

    act(() => vi.advanceTimersByTime(500))
    const saved = JSON.parse(localStorage.getItem(GRID_STORAGE_KEY)!)
    expect(saved.version).toBe(GRID_VIEW_VERSION)
    expect(saved.density).toBe('comfortable')
  })

  it('writes the grid projection to the provided persistence key', () => {
    vi.useFakeTimers()
    render(
      <DataGrid
        rows={seedAccounts}
        columns={accountGridColumns({ onEdit: vi.fn(), onDelete: vi.fn() })}
        getRowId={(row) => row.id}
        initialState={{ density: 'comfortable' }}
        persistenceKey="workspace.grid"
      />,
    )

    act(() => vi.advanceTimersByTime(500))
    expect(localStorage.getItem(GRID_STORAGE_KEY)).toBeNull()
    const saved = JSON.parse(localStorage.getItem('workspace.grid')!)
    expect(saved.version).toBe(GRID_VIEW_VERSION)
    expect(saved.density).toBe('comfortable')
  })
})
