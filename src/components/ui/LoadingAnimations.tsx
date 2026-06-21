import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { cx } from './utils'

export type LoadingAnimationSize = 'sm' | 'default' | 'lg'
export type LoadingTone = 'accent' | 'pos' | 'intel' | 'warn' | 'neg' | 'muted'

interface LoadingAnimationProps {
  label?: string
  className?: string
}

interface TonedLoadingAnimationProps extends LoadingAnimationProps {
  tone?: LoadingTone
}

const toneClasses: Record<LoadingTone, string> = {
  accent: 'text-accent',
  pos: 'text-pos',
  intel: 'text-intel',
  warn: 'text-warn',
  neg: 'text-neg',
  muted: 'text-muted',
}

const sizeClasses: Record<LoadingAnimationSize, string> = {
  sm: 'scale-75',
  default: 'scale-100',
  lg: 'scale-125',
}

function LoadingStatus({ label, className, children }: LoadingAnimationProps & { children: ReactNode }) {
  const decorative = label === ''
  return (
    <div
      role={decorative ? undefined : 'status'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      className={className}
    >
      {children}
    </div>
  )
}

function delayStyle(ms: number): CSSProperties {
  return { animationDelay: `${ms}ms` }
}

export function LoadingKpiSkeleton({ label = 'Loading KPI', className }: LoadingAnimationProps) {
  return (
    <LoadingStatus label={label} className={cx('grid w-full max-w-[220px] gap-3', className)}>
      <div className="ledger-loading-shimmer h-2.5 w-[55%] rounded-sm" />
      <div className="ledger-loading-shimmer h-8 w-[78%] rounded-sm" />
      <div className="ledger-loading-shimmer mt-1 h-9 w-full rounded-sm" />
      <div className="ledger-loading-shimmer h-2.5 w-[42%] rounded-sm" />
    </LoadingStatus>
  )
}

export function LoadingChartDrawIn({ label = 'Loading chart', className }: TonedLoadingAnimationProps) {
  return (
    <LoadingStatus label={label} className={cx('h-24 w-full min-w-40', className)}>
      <svg viewBox="0 0 280 150" preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
        <line className="text-line" stroke="currentColor" strokeWidth="1" x1="0" y1="40" x2="280" y2="40" />
        <line className="text-line" stroke="currentColor" strokeWidth="1" x1="0" y1="80" x2="280" y2="80" />
        <line className="text-line" stroke="currentColor" strokeWidth="1" x1="0" y1="120" x2="280" y2="120" />
        <path className="ledger-loading-line text-accent" d="M0,118 C40,110 60,70 100,72 S160,40 200,30 240,20 280,14" />
        <path className="ledger-loading-line ledger-loading-line-secondary text-pos" d="M0,128 C50,124 90,118 130,112 S210,104 280,96" />
      </svg>
    </LoadingStatus>
  )
}

export function LoadingDonut({ label = 'Loading donut chart', className, tone = 'accent' }: TonedLoadingAnimationProps) {
  return (
    <LoadingStatus label={label} className={cx('inline-flex items-center justify-center', sizeClasses.default, className)}>
      <svg className={cx('h-24 w-24', toneClasses[tone])} viewBox="0 0 120 120" aria-hidden="true">
        <circle className="text-surface-2" cx="60" cy="60" r="48" fill="none" stroke="currentColor" strokeWidth="13" />
        <g className="ledger-loading-donut-spin">
          <circle className="ledger-loading-donut-segment" cx="60" cy="60" r="48" fill="none" stroke="currentColor" strokeWidth="13" strokeLinecap="round" />
        </g>
      </svg>
    </LoadingStatus>
  )
}

export function LoadingBars({ label = 'Loading activity', className }: LoadingAnimationProps) {
  const bars = [
    { tone: 'accent', delay: 0 },
    { tone: 'accent', delay: 120 },
    { tone: 'pos', delay: 240 },
    { tone: 'pos', delay: 360 },
    { tone: 'intel', delay: 480 },
    { tone: 'intel', delay: 600 },
  ] as const

  return (
    <LoadingStatus label={label} className={cx('flex h-28 items-end justify-center gap-2.5', className)}>
      {bars.map((bar, index) => (
        <span
          key={`${bar.tone}-${bar.delay}-${index}`}
          className={cx('ledger-loading-bar block w-3.5 rounded-t-[2px] bg-current', toneClasses[bar.tone])}
          style={delayStyle(bar.delay)}
          aria-hidden="true"
        />
      ))}
    </LoadingStatus>
  )
}

export function LoadingSparkline({ label = 'Loading sparkline', className }: LoadingAnimationProps) {
  return (
    <LoadingStatus label={label} className={cx('grid justify-items-center gap-4', className)}>
      <div className="ledger-loading-shimmer h-4 w-24 rounded-sm" aria-hidden="true" />
      <svg className="h-12 w-44 text-accent" viewBox="0 0 170 48" aria-hidden="true">
        <path className="ledger-loading-sparkline" d="M2,40 L24,34 46,38 68,24 90,30 112,14 134,20 168,6" />
        <circle className="ledger-loading-sparkline-dot" cx="168" cy="6" r="4" />
      </svg>
    </LoadingStatus>
  )
}

export function LoadingDots({ label = 'Loading', className }: LoadingAnimationProps) {
  const dots = [
    { tone: 'accent', delay: 0 },
    { tone: 'pos', delay: 180 },
    { tone: 'intel', delay: 360 },
  ] as const

  return (
    <LoadingStatus label={label} className={cx('inline-flex items-center gap-3', className)}>
      {dots.map((dot) => (
        <span
          key={dot.tone}
          className={cx('ledger-loading-dot h-3.5 w-3.5 rounded-full bg-current', toneClasses[dot.tone])}
          style={delayStyle(dot.delay)}
          aria-hidden="true"
        />
      ))}
    </LoadingStatus>
  )
}

export interface LoadingProgressProps extends LoadingAnimationProps {
  detail?: string
}

export function LoadingProgress({ label = 'Loading', detail = 'Syncing records', className }: LoadingProgressProps) {
  return (
    <LoadingStatus label={label} className={cx('grid w-full max-w-sm gap-3', className)}>
      <div className="micro flex items-center justify-between gap-3">
        <span>{detail}</span>
        <span className="num text-faint" aria-hidden="true">...</span>
      </div>
      <div className="ledger-loading-progress h-1.5 overflow-hidden rounded-full bg-surface-2" aria-hidden="true" />
    </LoadingStatus>
  )
}

export interface LoadingCountingMetricProps extends LoadingAnimationProps {
  metricLabel?: string
  target?: number
  formatValue?: (value: number) => string
}

export function LoadingCountingMetric({
  label = 'Loading metric',
  metricLabel = 'Total value',
  target = 78300,
  formatValue = (value) => `$${Math.round(value).toLocaleString()}`,
  className,
}: LoadingCountingMetricProps) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let frame = 0
    let timeout = 0
    let stopped = false

    const run = () => {
      const start = performance.now()
      const duration = 1540

      const step = (now: number) => {
        if (stopped) return
        const progress = Math.min(1, (now - start) / duration)
        const eased = 1 - Math.pow(1 - progress, 3)
        setValue(target * eased)

        if (progress < 1) {
          frame = requestAnimationFrame(step)
        } else {
          timeout = window.setTimeout(() => {
            setValue(0)
            timeout = window.setTimeout(run, 180)
          }, 660)
        }
      }

      frame = requestAnimationFrame(step)
    }

    run()

    return () => {
      stopped = true
      cancelAnimationFrame(frame)
      window.clearTimeout(timeout)
    }
  }, [target])

  return (
    <LoadingStatus label={label} className={cx('grid justify-items-center gap-2', className)}>
      <div className="display num text-[42px] font-bold leading-none tracking-normal text-ink">{formatValue(value)}</div>
      <div className="micro">{metricLabel}</div>
      <div className="ledger-loading-count-track mt-1 h-1 w-28 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
        <i className="block h-full rounded-full bg-accent" />
      </div>
    </LoadingStatus>
  )
}

export function LoadingConcentricArcs({ label = 'Loading', className }: LoadingAnimationProps) {
  return (
    <LoadingStatus label={label} className={cx('relative h-20 w-20', className)}>
      <svg className="absolute inset-0 text-accent" viewBox="0 0 78 78" aria-hidden="true">
        <g className="ledger-loading-arc ledger-loading-arc-one">
          <circle cx="39" cy="39" r="34" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        </g>
      </svg>
      <svg className="absolute inset-0 text-pos" viewBox="0 0 78 78" aria-hidden="true">
        <g className="ledger-loading-arc ledger-loading-arc-two">
          <circle cx="39" cy="39" r="25" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        </g>
      </svg>
      <svg className="absolute inset-0 text-intel" viewBox="0 0 78 78" aria-hidden="true">
        <g className="ledger-loading-arc ledger-loading-arc-three">
          <circle cx="39" cy="39" r="16" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        </g>
      </svg>
    </LoadingStatus>
  )
}
