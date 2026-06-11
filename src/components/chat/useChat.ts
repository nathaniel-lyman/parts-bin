import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ChatAdapter, ChatMessageData } from './types'

let counter = 0
const genId = () => `msg_${Date.now().toString(36)}_${(counter++).toString(36)}`

export type ChatStatus = 'idle' | 'streaming'

export interface ChatController {
  messages: ChatMessageData[]
  status: ChatStatus
  send: (text: string) => void
  stop: () => void
  regenerate: () => void
}

/**
 * Chat state machine over any ChatAdapter. One in-flight stream at a time;
 * stop() aborts it keeping partial text as a completed message; regenerate()
 * re-streams the last user turn (also the retry path for errored messages).
 */
export function useChat(adapter: ChatAdapter): ChatController {
  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const [status, setStatus] = useState<ChatStatus>('idle')
  const controllerRef = useRef<AbortController | null>(null)
  const disposedRef = useRef(false)
  const adapterRef = useRef(adapter)
  const messagesRef = useRef(messages)
  const statusRef = useRef(status)
  // Keep refs in sync with latest values so callbacks capture fresh state
  // without stale closures. useLayoutEffect (not render-body assignment) to
  // satisfy react-hooks/refs; layout timing ensures they're updated before any
  // async continuations that run after the same paint.
  useLayoutEffect(() => { adapterRef.current = adapter })
  useLayoutEffect(() => { messagesRef.current = messages })
  useLayoutEffect(() => { statusRef.current = status })

  useEffect(() => {
    disposedRef.current = false // reset for StrictMode re-mount
    return () => {
      disposedRef.current = true
      controllerRef.current?.abort()
    }
  }, [])

  const stream = useCallback(async (history: ChatMessageData[]) => {
    const controller = new AbortController()
    controllerRef.current = controller
    const { signal } = controller
    const assistantId = genId()
    const patch = (p: Partial<ChatMessageData>) => {
      if (disposedRef.current) return
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, ...p } : m)))
    }

    setMessages([...history, { id: assistantId, role: 'assistant', content: '', status: 'streaming' }])
    setStatus('streaming')
    try {
      for await (const token of adapterRef.current.send(history, { signal })) {
        if (signal.aborted || disposedRef.current) break
        // Token appends bypass patch(): they must compose m.content + token.
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + token } : m)),
        )
      }
      patch({ status: 'done' })
    } catch {
      // Our own stop() (or unmount) aborts the signal; that is a completed
      // answer, not an error. Anything else is a real adapter failure.
      patch({ status: signal.aborted ? 'done' : 'error' })
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null
      if (!disposedRef.current) setStatus('idle')
    }
  }, [])

  const send = useCallback((text: string) => {
    const trimmed = text.trim()
    // controllerRef closes the same-tick race: statusRef only updates on re-render.
    if (!trimmed || statusRef.current === 'streaming' || controllerRef.current !== null) return
    const history: ChatMessageData[] = [
      ...messagesRef.current,
      { id: genId(), role: 'user', content: trimmed, status: 'done' },
    ]
    void stream(history)
  }, [stream])

  const stop = useCallback(() => {
    controllerRef.current?.abort()
  }, [])

  const regenerate = useCallback(() => {
    // controllerRef closes the same-tick race: statusRef only updates on re-render.
    if (statusRef.current === 'streaming' || controllerRef.current !== null) return
    const history = [...messagesRef.current]
    while (history.length && history[history.length - 1].role === 'assistant') history.pop()
    if (!history.length) return
    void stream(history)
  }, [stream])

  return { messages, status, send, stop, regenerate }
}
