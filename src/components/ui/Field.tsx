import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react'
import { cx } from './utils'

export interface FieldProps {
  label: ReactNode
  children: ReactNode
  id?: string
  hint?: ReactNode
  error?: ReactNode
  required?: boolean
  disabled?: boolean
  layout?: 'vertical' | 'horizontal'
}

export function Field({
  label,
  children,
  id,
  hint,
  error,
  required = false,
  disabled = false,
  layout = 'vertical',
}: FieldProps) {
  const generatedId = useId()
  const controlId = id ?? generatedId
  const hintId = hint ? `${controlId}-hint` : undefined
  const errorId = error ? `${controlId}-error` : undefined
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined
  const control = isValidElement<Record<string, unknown>>(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
      id: children.props.id ?? controlId,
      'aria-describedby': [children.props['aria-describedby'], describedBy].filter(Boolean).join(' ') || undefined,
      'aria-invalid': error ? true : undefined,
      required: children.props.required ?? required,
      disabled: children.props.disabled ?? disabled,
    })
    : children

  return (
    <div
      className={cx(
        'gap-2',
        layout === 'horizontal' ? 'grid items-start sm:grid-cols-[160px_1fr]' : 'grid',
        disabled && 'opacity-60',
      )}
    >
      <label htmlFor={controlId} className="micro pt-1">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <div className="grid gap-1.5">
        {control}
        {hint && !error && <p id={hintId} className="m-0 text-[12px] text-muted">{hint}</p>}
        {error && <p id={errorId} className="m-0 text-[12px] font-medium text-neg">{error}</p>}
      </div>
    </div>
  )
}
