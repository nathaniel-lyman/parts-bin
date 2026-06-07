import { useEffect } from 'react'
import {
  GRID_STORAGE_KEY,
  hydrateView,
  migrateLegacy,
  project,
} from '../components/DataGrid/persistence'
import type { LedgerGridState } from '../components/DataGrid/types'

const WRITE_DEBOUNCE_MS = 400

export function bootGridSeed(): LedgerGridState {
  try {
    const raw = localStorage.getItem(GRID_STORAGE_KEY)
    if (raw) return hydrateView(JSON.parse(raw))
  } catch {
    /* fall through to migration */
  }
  return hydrateView(migrateLegacy())
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

