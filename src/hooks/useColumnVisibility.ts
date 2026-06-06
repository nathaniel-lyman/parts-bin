import { useCallback, useEffect, useState } from 'react'

// 'name' = the Account column. It is hideable via the columns menu (matching the demo, which
// writes a `name` key to localStorage when toggled) but VISIBLE by default. 'arr' and 'since'
// are the secondary columns hidden by default.
export type OptionalColumn = 'name' | 'arr' | 'since'
export type ColumnVisibility = Record<OptionalColumn, boolean>

export const DEFAULT_COLUMNS: ColumnVisibility = { name: true, arr: false, since: false }
const KEY = 'ledger.cols'

function load(): ColumnVisibility {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_COLUMNS
    return { ...DEFAULT_COLUMNS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_COLUMNS
  }
}

export function useColumnVisibility() {
  const [visibility, setVisibility] = useState<ColumnVisibility>(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(visibility))
  }, [visibility])

  const toggle = useCallback((col: OptionalColumn) => {
    setVisibility((v) => ({ ...v, [col]: !v[col] }))
  }, [])

  return { visibility, toggle }
}
