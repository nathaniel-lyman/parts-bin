import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { generateAccounts } from '../components/DataGrid/mockServerAdapter'
import { useServerData } from './useServerData'

const query = {
  version: 1 as const,
  sorting: [],
  columnFilters: [],
  globalFilter: '',
  pagination: { pageIndex: 0, pageSize: 2 },
}

describe('useServerData', () => {
  it('debounces fetches and returns rows', async () => {
    const rows = generateAccounts(2)
    const adapter = {
      fetch: vi.fn().mockResolvedValue({ rows, totalRowCount: 2 }),
    }

    const { result } = renderHook(() => useServerData(adapter, query, { enabled: true, debounceMs: 0 }))
    expect(result.current.status).toBe('loading')

    await waitFor(() => expect(result.current.status).toBe('idle'))
    expect(adapter.fetch).toHaveBeenCalledWith(query, expect.objectContaining({ requestId: 1, signal: expect.any(AbortSignal) }))
    expect(result.current.rows).toEqual(rows)
  })

  it('aborts stale requests and ignores their results', async () => {
    const firstRows = generateAccounts(1)
    const secondRows = generateAccounts(2)
    const signals: AbortSignal[] = []
    let resolveFirst: ((value: { rows: typeof firstRows; totalRowCount: number }) => void) | undefined
    let resolveSecond: ((value: { rows: typeof secondRows; totalRowCount: number }) => void) | undefined
    const adapter = {
      fetch: vi.fn()
        .mockImplementationOnce((_query, context: { signal: AbortSignal }) => {
          signals.push(context.signal)
          return new Promise((resolve) => { resolveFirst = resolve })
        })
        .mockImplementationOnce((_query, context: { signal: AbortSignal }) => {
          signals.push(context.signal)
          return new Promise((resolve) => { resolveSecond = resolve })
        }),
    }

    const { result, rerender } = renderHook(
      ({ globalFilter }) => useServerData(adapter, { ...query, globalFilter }, { enabled: true, debounceMs: 0 }),
      { initialProps: { globalFilter: 'first' } },
    )

    await waitFor(() => expect(adapter.fetch).toHaveBeenCalledTimes(1))
    rerender({ globalFilter: 'second' })
    await waitFor(() => expect(adapter.fetch).toHaveBeenCalledTimes(2))

    resolveSecond?.({ rows: secondRows, totalRowCount: 2 })
    await waitFor(() => expect(result.current.rows).toEqual(secondRows))
    resolveFirst?.({ rows: firstRows, totalRowCount: 1 })
    expect(signals[0].aborted).toBe(true)
    expect(result.current.totalRowCount).toBe(2)
  })

  it('exposes a refetch handle for the current query', async () => {
    const rows = generateAccounts(1)
    const adapter = {
      fetch: vi.fn().mockResolvedValue({ rows, totalRowCount: 1 }),
    }

    const { result } = renderHook(() => useServerData(adapter, query, { enabled: true, debounceMs: 0 }))
    await waitFor(() => expect(result.current.status).toBe('idle'))

    result.current.refetch()
    await waitFor(() => expect(adapter.fetch).toHaveBeenCalledTimes(2))
  })
})
