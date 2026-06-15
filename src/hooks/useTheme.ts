import { useCallback, useEffect, useState } from 'react'

type Mode = 'light' | 'dark'
const KEY = 'parts-bin.theme'
const LEGACY_PARTS_KIT_KEY = 'parts-kit.theme'
const LEGACY_KEY = 'ledger.theme'

function load(): Mode {
  const saved = (() => {
    try {
      return localStorage.getItem(KEY)
        ?? localStorage.getItem(LEGACY_PARTS_KIT_KEY)
        ?? localStorage.getItem(LEGACY_KEY)
    } catch {
      return null
    }
  })()
  if (saved === 'dark' || saved === 'light') return saved
  return 'light'
}

export function useTheme() {
  const [mode, setMode] = useState<Mode>(load)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark')
    try { localStorage.setItem(KEY, mode) } catch { /* ignore */ }
  }, [mode])

  const toggle = useCallback(() => setMode((m) => (m === 'dark' ? 'light' : 'dark')), [])

  return { mode, toggle }
}
