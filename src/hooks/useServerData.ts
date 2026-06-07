import { useEffect, useRef, useState } from 'react'
import type { Account } from '../data/types'
import { serializeGridQuery, type GridQuery } from '../components/DataGrid/query'

export type ServerStatus = 'idle' | 'loading' | 'error'

interface Adapter {
  fetch: (query: GridQuery) => Promise<{ rows: Account[]; totalRowCount: number }>
}

interface Options {
  enabled: boolean
  debounceMs?: number
}

interface ServerData {
  rows: Account[]
  totalRowCount: number
  status: ServerStatus
  error?: unknown
}

export function useServerData(adapter: Adapter, query: GridQuery, opts: Options): ServerData {
  const { enabled, debounceMs = 250 } = opts
  const [rows, setRows] = useState<Account[]>([])
  const [totalRowCount, setTotalRowCount] = useState(0)
  const [status, setStatus] = useState<ServerStatus>('idle')
  const [error, setError] = useState<unknown>(undefined)
  const serialized = serializeGridQuery(query)
  const reqId = useRef(0)

  useEffect(() => {
    if (!enabled) return
    const id = ++reqId.current
    const timer = setTimeout(() => {
      if (id !== reqId.current) return
      setStatus('loading')
      adapter.fetch(query)
        .then((result) => {
          if (id !== reqId.current) return
          setRows(result.rows)
          setTotalRowCount(result.totalRowCount)
          setStatus('idle')
          setError(undefined)
        })
        .catch((err: unknown) => {
          if (id !== reqId.current) return
          setStatus('error')
          setError(err)
        })
    }, debounceMs)
    return () => clearTimeout(timer)
    // serialized is the stable change key for query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adapter, debounceMs, enabled, serialized])

  const effectiveStatus = enabled && status === 'idle' && rows.length === 0 ? 'loading' : status
  return { rows, totalRowCount, status: effectiveStatus, error }
}
