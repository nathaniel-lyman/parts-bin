import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatAdapter, ChatMessageData } from './types'

let counter = 0
const genId = () => `msg_${Date.now().toString(36)}_${(counter++).toString(36)}`

export type ChatStatus = 'idle' | 'streaming'

/**
 * Chat state machine over any ChatAdapter. One in-flight stream at a time;
 * stop() aborts it keeping partial text as a completed message; regenerate()
 * re-streams the last user turn (also the retry path for errored messages).
 */
export function useChat(adapter: ChatAdapter) {
  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const [status, setStatus] = useState<ChatStatus>('idle')
  const controllerRef = useRef<AbortController | null>(null)
  const disposedRef = useRef(false)
  const adapterRef = useRef(adapter)
  adapterRef.current = adapter
  const messagesRef = useRef(messages)
  messagesRef.current = messages
  const statusRef = useRef(status)
  statusRef.current = status

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
    if (statusRef.current === 'streaming') return
    const history = [...messagesRef.current]
    while (history.length && history[history.length - 1].role === 'assistant') history.pop()
    if (!history.length) return
    void stream(history)
  }, [stream])

  return { messages, status, send, stop, regenerate }
}
