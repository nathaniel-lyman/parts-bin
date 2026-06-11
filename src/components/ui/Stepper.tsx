import type { CSSProperties, ReactNode } from 'react'
import { Button } from './Button'
import { cx } from './utils'

export type StepState = 'complete' | 'current' | 'upcoming' | 'error'

export interface StepItem {
  id: string
  label: ReactNode
  description?: ReactNode
  state?: StepState
  optional?: boolean
}

const stepStateClasses: Record<StepState, string> = {
  complete: 'border-pos bg-pos-soft text-pos',
  current: 'border-accent bg-accent-soft text-accent',
  upcoming: 'border-line bg-surface-2 text-muted',
  error: 'border-neg bg-neg-soft text-neg',
}

export interface StepperProps {
  steps: StepItem[]
  currentStepId?: string
  onStepSelect?: (id: string) => void
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function Stepper({ steps, currentStepId, onStepSelect, orientation = 'horizontal', className }: StepperProps) {
  const currentIndex = currentStepId ? steps.findIndex((step) => step.id === currentStepId) : -1

  return (
    <ol
      className={cx(
        'm-0 list-none content-start gap-2 p-0',
        orientation === 'horizontal' ? 'grid sm:grid-cols-[repeat(var(--step-count),minmax(0,1fr))]' : 'grid',
        className,
      )}
      style={{ '--step-count': steps.length } as CSSProperties}
    >
      {steps.map((step, index) => {
        const inferredState: StepState = step.state ?? (step.id === currentStepId ? 'current' : currentIndex !== -1 && index < currentIndex ? 'complete' : 'upcoming')
        const content = (
          <>
            <span className={cx('grid h-7 w-7 shrink-0 place-items-center rounded-[2px] border text-[12px] font-semibold', stepStateClasses[inferredState])}>
              {inferredState === 'complete' ? '✓' : index + 1}
            </span>
            <span className="grid min-w-0 gap-0.5 text-left">
              <span className="text-[13px] font-semibold text-ink">{step.label}</span>
              {(step.description || step.optional) && (
                <span className="text-[12px] text-muted">{step.description ?? 'Optional'}</span>
              )}
            </span>
          </>
        )

        return (
          <li key={step.id} className="min-w-0">
            {onStepSelect ? (
              <button
                type="button"
                onClick={() => onStepSelect(step.id)}
                aria-current={inferredState === 'current' ? 'step' : undefined}
                className="flex min-h-12 w-full min-w-0 items-start gap-2 border border-line bg-surface px-3 py-2 text-left hover:bg-surface-2"
              >
                {content}
              </button>
            ) : (
              <div
                aria-current={inferredState === 'current' ? 'step' : undefined}
                className="flex min-h-12 min-w-0 items-start gap-2 border border-line bg-surface px-3 py-2"
              >
                {content}
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}

export interface WizardLayoutProps {
  steps: StepItem[]
  currentStepId: string
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  onStepSelect?: (id: string) => void
  onBack?: () => void
  onNext?: () => void
  backLabel?: ReactNode
  nextLabel?: ReactNode
  nextDisabled?: boolean
  className?: string
}

export function WizardLayout({
  steps,
  currentStepId,
  title,
  description,
  children,
  onStepSelect,
  onBack,
  onNext,
  backLabel = 'Back',
  nextLabel = 'Continue',
  nextDisabled = false,
  className,
}: WizardLayoutProps) {
  return (
    <section className={cx('grid gap-4 border border-line bg-surface p-4 lg:grid-cols-[260px_1fr]', className)}>
      <Stepper steps={steps} currentStepId={currentStepId} onStepSelect={onStepSelect} orientation="vertical" />
      <div className="grid min-w-0 content-start gap-4">
        <header className="grid gap-1 border-b border-line pb-3">
          <h2 className="m-0 text-[18px] font-semibold text-ink">{title}</h2>
          {description && <p className="m-0 text-[13px] text-muted">{description}</p>}
        </header>
        <div className="min-w-0">{children}</div>
        <footer className="flex items-center justify-between gap-2 border-t border-line pt-3">
          <Button type="button" variant="secondary" onClick={onBack} disabled={!onBack}>{backLabel}</Button>
          <Button type="button" variant="primary" onClick={onNext} disabled={nextDisabled || !onNext}>{nextLabel}</Button>
        </footer>
      </div>
    </section>
  )
}
