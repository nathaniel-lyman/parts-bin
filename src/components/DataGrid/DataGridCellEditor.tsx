import { useLayoutEffect, useRef, type KeyboardEvent } from 'react'
import type { EditorType } from './editing'

interface Props {
  columnId: string
  editorType: EditorType
  options?: string[]
  value: string
  error?: string
  align?: 'left' | 'right' | 'center'
  onChange: (value: string) => void
  onCommit: (move?: 'next' | 'prev') => void
  onCancel: () => void
}

export function DataGridCellEditor({
  columnId,
  editorType,
  options = [],
  value,
  error,
  align,
  onChange,
  onCommit,
  onCancel,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const selectRef = useRef<HTMLSelectElement | null>(null)

  useLayoutEffect(() => {
    const el = editorType === 'select' ? selectRef.current : inputRef.current
    el?.focus()
    if (el instanceof HTMLInputElement && editorType === 'text') el.select()
  }, [editorType])

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      onCommit()
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onCancel()
      return
    }
    if (event.key === 'Tab') {
      event.preventDefault()
      event.stopPropagation()
      onCommit(event.shiftKey ? 'prev' : 'next')
      return
    }
    // Keep arrow keys & co. inside the editor instead of moving grid focus.
    event.stopPropagation()
  }

  const fieldClass = `h-7 w-full min-w-0 rounded-[2px] border bg-surface px-1.5 text-[13px] text-ink focus:outline-none ${
    error ? 'border-neg ring-1 ring-neg' : 'border-accent ring-1 ring-accent'
  } ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`

  return (
    <span className="relative block" data-grid-editor={columnId}>
      {editorType === 'select' ? (
        <select
          ref={selectRef}
          aria-label={`Edit ${columnId}`}
          aria-invalid={error ? true : undefined}
          className={fieldClass}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
        >
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          ref={inputRef}
          aria-label={`Edit ${columnId}`}
          aria-invalid={error ? true : undefined}
          type={editorType === 'number' ? 'number' : editorType === 'date' ? 'date' : 'text'}
          className={fieldClass}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
        />
      )}
      {error && (
        <span
          role="alert"
          className="micro shadow-dropdown absolute left-0 top-full z-30 mt-1 whitespace-nowrap rounded-[2px] border border-neg bg-surface px-1.5 py-0.5 text-neg"
        >
          {error}
        </span>
      )}
    </span>
  )
}
