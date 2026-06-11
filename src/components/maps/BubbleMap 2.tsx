import { useId, type KeyboardEvent } from 'react'
import { cx } from '../ui/utils'
import { scaleBetween } from './mapMath'
import { ledgerMapViewport, ledgerPoints, ledgerRegions } from './demoData'
import { ledgerNationPath, ledgerStatePaths } from './usAtlas'
import type { MapFeature, MapPoint, MapRegion, MapViewport } from './types'

export interface BubbleMapProps {
  points?: MapPoint[]
  regions?: MapRegion[]
  features?: MapFeature[]
  outlinePath?: string
  viewport?: MapViewport
  selectedPointId?: string
  ariaLabel?: string
  valueLabel?: string
  onPointSelect?: (point: MapPoint) => void
  className?: string
}

export function BubbleMap({
  points = ledgerPoints,
  regions = ledgerRegions,
  features = ledgerStatePaths,
  outlinePath = ledgerNationPath,
  viewport = ledgerMapViewport,
  selectedPointId,
  ariaLabel = 'Account concentration map',
  valueLabel = 'accounts',
  onPointSelect,
  className,
}: BubbleMapProps) {
  const titleId = useId()
  const values = points.map((point) => point.value)
  const interactive = Boolean(onPointSelect)

  const handleKeyDown = (event: KeyboardEvent<SVGCircleElement>, point: MapPoint) => {
    if (!onPointSelect) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onPointSelect(point)
    }
  }

  return (
    <figure className={cx('m-0 grid gap-3', className)}>
      <svg
        role={interactive ? 'group' : 'img'}
        aria-labelledby={titleId}
        viewBox={`0 0 ${viewport.width} ${viewport.height}`}
        className="aspect-[25/16] w-full overflow-visible"
      >
        <title id={titleId}>{ariaLabel}</title>
        <rect width={viewport.width} height={viewport.height} rx="2" fill="var(--surface-2)" />
        {outlinePath && (
          <path
            d={outlinePath}
            fill="var(--surface)"
            stroke="var(--line)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {regions.map((region) => (
          <path
            key={region.id}
            d={region.path}
            fill="var(--accent-soft)"
            opacity="0.14"
            stroke="var(--line)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {features.map((feature) => (
          <path
            key={feature.id}
            d={feature.path}
            fill="none"
            stroke="var(--line)"
            strokeWidth="0.7"
            opacity="0.85"
            pointerEvents="none"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {points.map((point) => {
          const radius = scaleBetween(point.value, values, 2.5, 7.5)
          const selected = point.id === selectedPointId
          return (
            <g key={point.id}>
              <circle
                cx={point.x}
                cy={point.y}
                r={radius + 1.5}
                fill="var(--accent-soft)"
                opacity={selected ? 0.95 : 0.58}
              />
              <circle
                cx={point.x}
                cy={point.y}
                r={radius}
                tabIndex={interactive ? 0 : undefined}
                role={interactive ? 'button' : undefined}
                aria-label={`${point.label}: ${point.value} ${valueLabel}`}
                aria-pressed={interactive ? selected : undefined}
                className={cx('outline-none transition-opacity focus-visible:drop-shadow-sm', interactive && 'cursor-pointer')}
                fill={selected ? 'var(--intel)' : 'var(--accent)'}
                stroke="var(--surface)"
                strokeWidth="1.25"
                vectorEffect="non-scaling-stroke"
                onClick={() => onPointSelect?.(point)}
                onKeyDown={(event) => handleKeyDown(event, point)}
              >
                <title>{`${point.label}: ${point.detail ?? `${point.value} ${valueLabel}`}`}</title>
              </circle>
            </g>
          )
        })}
      </svg>
      <figcaption className="flex flex-wrap items-center gap-2 text-[12px] text-muted">
        {points.slice(0, 4).map((point) => (
          <span key={point.id} className="inline-flex items-center gap-1.5 border border-line bg-surface-2 px-2 py-1">
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            <span className="font-semibold text-ink">{point.label}</span>
            <span className="num">{point.value}</span>
          </span>
        ))}
      </figcaption>
    </figure>
  )
}
