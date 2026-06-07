import { useEffect, useRef } from 'react'

interface RowCheckboxProps {
  rowId: string
  rowLabel: string
  checked: boolean
  onToggle: (id: string) => void
}

export function DataGridRowCheckbox({ rowId, rowLabel, checked, onToggle }: RowCheckboxProps) {
  return (
    <input
      type="checkbox"
      className="accent-accent"
      aria-label={`Select ${rowLabel}`}
      checked={checked}
      onChange={() => onToggle(rowId)}
      onClick={(event) => event.stopPropagation()}
    />
  )
}

interface SelectAllProps {
  state: 'none' | 'some' | 'all'
  label?: string
  onChange: (select: boolean) => void
}

export function DataGridSelectAllCheckbox({ state, label = 'Select all rows', onChange }: SelectAllProps) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = state === 'some'
  }, [state])

  return (
    <input
      ref={ref}
      type="checkbox"
      className="accent-accent"
      aria-label={label}
      checked={state === 'all'}
      onChange={() => onChange(state !== 'all')}
    />
  )
}
