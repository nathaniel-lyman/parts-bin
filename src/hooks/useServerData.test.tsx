import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { generateAccounts } from '../components/DataGrid/mockServerAdapter'
import { useServerData } from './useServerData'

const query = {
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
    expect(adapter.fetch).toHaveBeenCalledWith(query)
    expect(result.current.rows).toEqual(rows)
  })
})
