import { useCallback, useRef, useState, type ReactNode } from 'react'
import { Toast } from './Toast'
import { ToastContext, type ToastTone } from './ToastContext'

interface ToastItem { id: number; tone: ToastTone; text: string }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const idRef = useRef(0)
  const push = useCallback((text: string, tone: ToastTone = 'accent') => {
    const id = idRef.current++
    setItems((p) => [...p, { id, tone, text }])
    setTimeout(() => setItems((p) => p.filter((t) => t.id !== id)), 4000) // spec §10: 4000ms
  }, [])
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {items.map((t) => <Toast key={t.id} tone={t.tone}>{t.text}</Toast>)}
      </div>
    </ToastContext.Provider>
  )
}
