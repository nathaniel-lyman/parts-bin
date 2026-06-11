import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Button } from '../ui/Button'

export interface ChatComposerProps {
  onSend: (text: string) => void
  /** While true, the send button becomes Stop; typing stays enabled, sending doesn't. */
  streaming: boolean
  onStop: () => void
  placeholder?: string
  autoFocus?: boolean
}

const MAX_HEIGHT = 132 // ~6 rows

export function ChatComposer({ onSend, streaming, onStop, placeholder = 'Ask anything…', autoFocus }: ChatComposerProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow: reset then clamp to content height (scrollHeight is 0 in jsdom — harmless).
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`
  }, [value])

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || streaming) return
    onSend(trimmed)
    setValue('')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form
      className="flex items-end gap-2 border-t border-line bg-surface px-3 py-3"
      onSubmit={(event) => { event.preventDefault(); submit() }}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label="Message the assistant"
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={onKeyDown}
        className="min-h-8 flex-1 resize-none rounded-[2px] border border-line bg-surface px-2.5 py-1.5 text-[13px] text-ink outline-none placeholder:text-faint focus:border-accent"
      />
      {streaming ? (
        <Button type="button" variant="secondary" onClick={onStop} aria-label="Stop generating">Stop</Button>
      ) : (
        <Button type="submit" variant="primary" disabled={!value.trim()} aria-label="Send message">Send</Button>
      )}
    </form>
  )
}
