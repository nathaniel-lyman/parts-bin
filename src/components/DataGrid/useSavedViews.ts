import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_PERSISTED_VIEW, LEGACY_GRID_STORAGE_KEY, type PersistedGridView } from './persistence'

export const LEGACY_SAVED_VIEWS_KEY = 'ledger.accounts.views'
export const SAVED_VIEWS_KEY = 'parts-bin.datagrid.views'

export interface SavedView {
  id: string
  name: string
  view: PersistedGridView
}

export function savedViewsKeyForGrid(persistenceKey: string): string {
  return `${persistenceKey}.views`
}

function readSavedViews(storageKey: string): SavedView[] {
  try {
    const raw = localStorage.getItem(storageKey) ?? (
      storageKey === savedViewsKeyForGrid(LEGACY_GRID_STORAGE_KEY)
        ? localStorage.getItem(LEGACY_SAVED_VIEWS_KEY)
        : null
    )
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed as SavedView[] : []
  } catch {
    return []
  }
}

function makeId(): string {
  return `view-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function useSavedViews(storageKey = SAVED_VIEWS_KEY) {
  const [views, setViews] = useState<SavedView[]>(() => readSavedViews(storageKey))

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(views))
    } catch {
      /* ignore storage errors */
    }
  }, [storageKey, views])

  const create = useCallback((name: string, view: PersistedGridView) => {
    const saved: SavedView = { id: makeId(), name, view }
    setViews((current) => [...current, saved])
    return saved.id
  }, [])

  const remove = useCallback((id: string) => {
    setViews((current) => current.filter((view) => view.id !== id))
  }, [])

  const rename = useCallback((id: string, name: string) => {
    setViews((current) => current.map((view) => view.id === id ? { ...view, name } : view))
  }, [])

  const apply = useCallback((id: string, applyFn: (view: PersistedGridView) => void) => {
    const found = views.find((view) => view.id === id)
    if (found) applyFn(found.view)
  }, [views])

  const reset = useCallback((applyFn: (view: PersistedGridView) => void) => {
    applyFn(DEFAULT_PERSISTED_VIEW)
  }, [])

  return { views, create, remove, rename, apply, reset }
}

export function exportViewsJson(views: SavedView[]): string {
  return JSON.stringify(views, null, 2)
}

export function importViewsJson(json: string): SavedView[] {
  try {
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) ? parsed as SavedView[] : []
  } catch {
    return []
  }
}
