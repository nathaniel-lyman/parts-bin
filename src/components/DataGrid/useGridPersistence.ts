import { useEffect } from 'react'
import {
  GRID_STORAGE_KEY,
  LEGACY_GRID_STORAGE_KEY,
  hydrateView,
  migrateLegacy,
  project,
} from './persistence'
import { hydrate } from './state'
import type { DataGridState } from './types'

const WRITE_DEBOUNCE_MS = 400
const LEGACY_COLS_KEY = 'ledger.cols'
const LEGACY_ORDER_KEY = 'ledger.colOrder'

function hasLegacyGridKeys(): boolean {
  return localStorage.getItem(LEGACY_COLS_KEY) !== null || localStorage.getItem(LEGACY_ORDER_KEY) !== null
}

export function bootGridSeed(initialState?: Partial<DataGridState>, storageKey = GRID_STORAGE_KEY): DataGridState {
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) return hydrateView(JSON.parse(raw), initialState)
  } catch {
    /* fall through to migration */
  }
  return storageKey === LEGACY_GRID_STORAGE_KEY && hasLegacyGridKeys()
    ? hydrateView(migrateLegacy(), initialState)
    : hydrate({ initialState })
}

export function useGridPersistence(state: DataGridState, enabled: boolean, storageKey = GRID_STORAGE_KEY): void {
  useEffect(() => {
    if (!enabled) return
    const id = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(project(state)))
      } catch {
        /* ignore quota / serialization errors */
      }
    }, WRITE_DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [state, enabled, storageKey])
}
