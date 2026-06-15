import { useCallback, useEffect, useState } from 'react'

/**
 * Workspace/user preferences for the Settings starter page. Like {@link useTheme},
 * this hook is the *sole* writer of its localStorage key. Color mode and theme
 * recipe are deliberately NOT stored here — those have their own owners
 * (`useTheme` → `parts-kit.theme`, `recipes.ts` → `parts-kit.theme.recipe`) and the
 * Appearance section composes all three. `density`/`reduceMotion` are applied as
 * `data-*` attributes on <html> (the same imperative idiom as `applyThemeRecipe`)
 * so CSS can consume them; see `src/theme/base.css` for the `data-density` hook.
 */
export interface LedgerSettings {
  // Appearance
  density: 'comfortable' | 'compact'
  reduceMotion: boolean
  // Profile
  fullName: string
  email: string
  role: string
  timezone: string
  // Notifications
  emailDigest: boolean
  mentions: boolean
  weeklyReport: boolean
  channels: string[]
  // Preferences
  landingPage: '/' | '/templates/customer-success' | '/templates/recommendation-review' | '/docs'
  numberFormat: 'compact' | 'full'
}

export const SETTINGS_STORAGE_KEY = 'ledger.user.settings'

export const DEFAULT_SETTINGS: LedgerSettings = {
  density: 'comfortable',
  reduceMotion: false,
  fullName: 'Morgan Operator',
  email: 'morgan@ledger.demo',
  role: 'admin',
  timezone: 'America/New_York',
  emailDigest: true,
  mentions: true,
  weeklyReport: false,
  channels: ['in-app', 'email'],
  landingPage: '/',
  numberFormat: 'full',
}

function load(): LedgerSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<LedgerSettings>
    // Merge over defaults so a partial/older payload never yields undefined fields.
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function applyToDocument(settings: LedgerSettings) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (settings.density === 'compact') root.dataset.density = 'compact'
  else delete root.dataset.density
  if (settings.reduceMotion) root.dataset.reduceMotion = 'true'
  else delete root.dataset.reduceMotion
}

export function useSettings() {
  const [settings, setSettings] = useState<LedgerSettings>(load)

  useEffect(() => {
    applyToDocument(settings)
    try { localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings)) } catch { /* ignore */ }
  }, [settings])

  const update = useCallback((patch: Partial<LedgerSettings>) => {
    setSettings((current) => ({ ...current, ...patch }))
  }, [])

  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), [])

  return { settings, update, reset }
}
