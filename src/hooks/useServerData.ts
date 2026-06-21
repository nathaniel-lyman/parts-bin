import { useCallback, useEffect, useRef, useState } from 'react'
import { serializeGridQuery, type DataGridDataSource, type GridQuery } from '../components/DataGrid/query'

export type ServerStatus = 'idle' | 'loading' | 'error'

interface Options {
  enabled: boolean
  debounceMs?: number
}

interface ServerData<TData> {
  rows: TData[]
  totalRowCount: number
  status: ServerStatus
  error?: unknown
  refetch: () => void
}

export function useServerData<TData>(adapter: DataGridDataSource<TData>, query: GridQuery, opts: Options): ServerData<TData> {
  const { enabled, debounceMs = 250 } = opts
  const [rows, setRows] = useState<TData[]>([])
  const [totalRowCount, setTotalRowCount] = useState(0)
  const [status, setStatus] = useState<ServerStatus>('idle')
  const [error, setError] = useState<unknown>(undefined)
  const [reloadToken, setReloadToken] = useState(0)
  const serialized = serializeGridQuery(query)
  const reqId = useRef(0)

  useEffect(() => {
    if (!enabled) return
    const id = ++reqId.current
    const controller = new AbortController()
    const timer = setTimeout(() => {
      if (id !== reqId.current) return
      setStatus('loading')
      adapter.fetch(query, { signal: controller.signal, requestId: id })
        .then((result) => {
          if (id !== reqId.current || controller.signal.aborted) return
          setRows(result.rows)
          setTotalRowCount(result.totalRowCount)
          setStatus('idle')
          setError(undefined)
        })
        .catch((err: unknown) => {
          if (id !== reqId.current || controller.signal.aborted) return
          setStatus('error')
          setError(err)
        })
    }, debounceMs)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
    // serialized is the stable change key for query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adapter, debounceMs, enabled, reloadToken, serialized])

  const refetch = useCallback(() => setReloadToken((token) => token + 1), [])
  const effectiveStatus = !enabled ? 'idle' : enabled && status === 'idle' && rows.length === 0 ? 'loading' : status
  return {
    rows,
    totalRowCount,
    status: effectiveStatus,
    error: enabled ? error : undefined,
    refetch,
  }
}
