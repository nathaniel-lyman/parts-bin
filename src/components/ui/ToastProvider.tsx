import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Toast } from './Toast'
import { ToastContext, type ToastOptions, type ToastTone } from './ToastContext'

interface ToastItem extends ToastOptions { id: number; text: string }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const idRef = useRef(0)
  const timersRef = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const dismiss = useCallback((id: number) => {
    const timer = timersRef.current.get(id)
    if (timer !== undefined) clearTimeout(timer)
    timersRef.current.delete(id)
    setItems((p) => p.filter((t) => t.id !== id))
  }, [])

  const push = useCallback((text: string, toneOrOptions: ToastTone | ToastOptions = {}) => {
    const options = typeof toneOrOptions === 'string' ? { tone: toneOrOptions } : toneOrOptions
    const id = idRef.current++
    setItems((p) => [...p, { id, text, ...options }])
    const timer = setTimeout(() => {
      timersRef.current.delete(id)
      setItems((p) => p.filter((t) => t.id !== id))
    }, options.duration ?? 4000) // spec §10: 4000ms default
    timersRef.current.set(id, timer)
  }, [])

  // Cancel pending dismiss timers so unmount doesn't leave them firing into a dead tree.
  useEffect(() => {
    const timers = timersRef.current
    return () => {
      for (const timer of timers.values()) clearTimeout(timer)
      timers.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {items.map((t) => (
          <Toast
            key={t.id}
            tone={t.tone}
            title={t.title}
            onDismiss={() => dismiss(t.id)}
            action={t.action ? { ...t.action, onClick: () => { t.action!.onClick(); dismiss(t.id) } } : undefined}
          >
            {t.text}
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
