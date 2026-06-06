import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { Toast } from './Toast'

type Tone = 'accent' | 'pos' | 'neg' | 'warn'
interface ToastItem { id: number; tone: Tone; text: string }
const Ctx = createContext<(text: string, tone?: Tone) => void>(() => {})
export const useToast = () => useContext(Ctx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const idRef = useRef(0)
  const push = useCallback((text: string, tone: Tone = 'accent') => {
    const id = idRef.current++
    setItems((p) => [...p, { id, tone, text }])
    setTimeout(() => setItems((p) => p.filter((t) => t.id !== id)), 4000) // spec §10: 4000ms
  }, [])
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {items.map((t) => <Toast key={t.id} tone={t.tone}>{t.text}</Toast>)}
      </div>
    </Ctx.Provider>
  )
}
