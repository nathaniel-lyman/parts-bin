import { useEffect } from 'react'
import {
  GRID_STORAGE_KEY,
  hydrateView,
  migrateLegacy,
  project,
} from '../components/DataGrid/persistence'
import { hydrate } from '../components/DataGrid/state'
import type { LedgerGridState } from '../components/DataGrid/types'

const WRITE_DEBOUNCE_MS = 400
const LEGACY_COLS_KEY = 'ledger.cols'
const LEGACY_ORDER_KEY = 'ledger.colOrder'

function hasLegacyGridKeys(): boolean {
  return localStorage.getItem(LEGACY_COLS_KEY) !== null || localStorage.getItem(LEGACY_ORDER_KEY) !== null
}

export function bootGridSeed(initialState?: Partial<LedgerGridState>): LedgerGridState {
  try {
    const raw = localStorage.getItem(GRID_STORAGE_KEY)
    if (raw) return hydrateView(JSON.parse(raw), initialState)
  } catch {
    /* fall through to migration */
  }
  return hasLegacyGridKeys() ? hydrateView(migrateLegacy(), initialState) : hydrate({ initialState })
}

export function useGridPersistence(state: LedgerGridState, enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return
    const id = setTimeout(() => {
      try {
        localStorage.setItem(GRID_STORAGE_KEY, JSON.stringify(project(state)))
      } catch {
        /* ignore quota / serialization errors */
      }
    }, WRITE_DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [state, enabled])
}
