import { createContext, useContext } from 'react'

export type ToastTone = 'accent' | 'pos' | 'neg' | 'warn'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastOptions {
  tone?: ToastTone
  /** Bold heading above the message text. */
  title?: string
  /** Action button (e.g. Undo); clicking it dismisses the toast. */
  action?: ToastAction
  /** Auto-dismiss delay in ms; defaults to 4000 (spec §10). */
  duration?: number
}

/** Accepts the legacy `(text, tone)` shorthand or a full options object. */
export type ToastPush = (text: string, options?: ToastTone | ToastOptions) => void

export const ToastContext = createContext<ToastPush>(() => {})

export const useToast = () => useContext(ToastContext)
