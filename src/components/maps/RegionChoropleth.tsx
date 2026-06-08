import { useId, type KeyboardEvent } from 'react'
import { cx } from '../ui/utils'
import { normalizeValue } from './mapMath'
import { ledgerMapViewport, ledgerRegions } from './demoData'
import type { MapRegion, MapViewport } from './types'

export interface RegionChoroplethProps {
  regions?: MapRegion[]
  viewport?: MapViewport
  selectedRegionId?: string
  ariaLabel?: string
  valueLabel?: string
  onRegionSelect?: (region: MapRegion) => void
  className?: string
}

export function RegionChoropleth({
  regions = ledgerRegions,
  viewport = ledgerMapViewport,
  selectedRegionId,
  ariaLabel = 'Regional performance map',
  valueLabel = 'score',
  onRegionSelect,
  className,
}: RegionChoroplethProps) {
  const titleId = useId()
  const values = regions.map((region) => region.value)
  const interactive = Boolean(onRegionSelect)

  const handleKeyDown = (event: KeyboardEvent<SVGPathElement>, region: MapRegion) => {
    if (!onRegionSelect) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onRegionSelect(region)
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
        {regions.map((region) => {
          const weight = normalizeValue(region.value, values)
          const selected = region.id === selectedRegionId
          return (
            <path
              key={region.id}
              d={region.path}
              tabIndex={interactive ? 0 : undefined}
              role={interactive ? 'button' : undefined}
              aria-label={`${region.label}: ${region.value} ${valueLabel}`}
              aria-pressed={interactive ? selected : undefined}
              className={cx(
                'outline-none transition-opacity focus-visible:opacity-100 focus-visible:drop-shadow-sm',
                interactive && 'cursor-pointer',
              )}
              fill={selected ? 'var(--intel)' : 'var(--accent)'}
              opacity={selected ? 1 : 0.28 + weight * 0.56}
              stroke="var(--surface)"
              strokeWidth="1.25"
              vectorEffect="non-scaling-stroke"
              onClick={() => onRegionSelect?.(region)}
              onKeyDown={(event) => handleKeyDown(event, region)}
            >
              <title>{`${region.label}: ${region.detail ?? `${region.value} ${valueLabel}`}`}</title>
            </path>
          )
        })}
      </svg>
      <figcaption className="grid gap-2 sm:grid-cols-2">
        {regions.map((region) => (
          <button
            key={region.id}
            type="button"
            className={cx(
              'flex min-w-0 items-center justify-between gap-3 border border-line bg-surface-2 px-3 py-2 text-left text-[12px] text-muted',
              region.id === selectedRegionId && 'border-accent bg-accent-soft text-ink',
            )}
            onClick={() => onRegionSelect?.(region)}
            disabled={!onRegionSelect}
          >
            <span className="truncate font-semibold text-ink">{region.label}</span>
            <span className="num shrink-0">{region.detail ?? region.value}</span>
          </button>
        ))}
      </figcaption>
    </figure>
  )
}
