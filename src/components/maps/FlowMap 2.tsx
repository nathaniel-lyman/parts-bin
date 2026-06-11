import { useId, type KeyboardEvent } from 'react'
import { cx } from '../ui/utils'
import { arcPath, scaleBetween } from './mapMath'
import { ledgerFlows, ledgerMapViewport, ledgerRegions } from './demoData'
import { ledgerNationPath, ledgerStatePaths } from './usAtlas'
import type { MapFeature, MapFlow, MapRegion, MapViewport } from './types'

export interface FlowMapProps {
  flows?: MapFlow[]
  regions?: MapRegion[]
  features?: MapFeature[]
  outlinePath?: string
  viewport?: MapViewport
  selectedFlowId?: string
  ariaLabel?: string
  valueLabel?: string
  onFlowSelect?: (flow: MapFlow) => void
  className?: string
}

export function FlowMap({
  flows = ledgerFlows,
  regions = ledgerRegions,
  features = ledgerStatePaths,
  outlinePath = ledgerNationPath,
  viewport = ledgerMapViewport,
  selectedFlowId,
  ariaLabel = 'Regional flow map',
  valueLabel = 'movement',
  onFlowSelect,
  className,
}: FlowMapProps) {
  const titleId = useId()
  const markerId = `${titleId.replace(/:/g, '')}-arrow`
  const values = flows.map((flow) => flow.value)
  const interactive = Boolean(onFlowSelect)

  const handleKeyDown = (event: KeyboardEvent<SVGPathElement>, flow: MapFlow) => {
    if (!onFlowSelect) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onFlowSelect(flow)
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
        <defs>
          <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)" />
          </marker>
        </defs>
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
            opacity="0.12"
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
        {flows.map((flow) => {
          const selected = flow.id === selectedFlowId
          const strokeWidth = scaleBetween(flow.value, values, 1.5, 5)
          return (
            <path
              key={flow.id}
              d={arcPath(flow.from, flow.to)}
              tabIndex={interactive ? 0 : undefined}
              role={interactive ? 'button' : undefined}
              aria-label={`${flow.label}: ${flow.value} ${valueLabel}`}
              aria-pressed={interactive ? selected : undefined}
              fill="none"
              stroke={selected ? 'var(--intel)' : 'var(--accent)'}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              opacity={selected ? 1 : 0.7}
              markerEnd={`url(#${markerId})`}
              className={cx('outline-none focus-visible:drop-shadow-sm', interactive && 'cursor-pointer')}
              vectorEffect="non-scaling-stroke"
              onClick={() => onFlowSelect?.(flow)}
              onKeyDown={(event) => handleKeyDown(event, flow)}
            >
              <title>{`${flow.label}: ${flow.detail ?? `${flow.value} ${valueLabel}`}`}</title>
            </path>
          )
        })}
        {flows.flatMap((flow) => [flow.from, flow.to]).map(([x, y], index) => (
          <circle key={`${x}-${y}-${index}`} cx={x} cy={y} r="1.5" fill="var(--ink)" opacity="0.72" />
        ))}
      </svg>
      <figcaption className="grid gap-2 sm:grid-cols-2">
        {flows.map((flow) => (
          <button
            key={flow.id}
            type="button"
            className={cx(
              'flex min-w-0 items-center justify-between gap-3 border border-line bg-surface-2 px-3 py-2 text-left text-[12px] text-muted',
              flow.id === selectedFlowId && 'border-accent bg-accent-soft text-ink',
            )}
            onClick={() => onFlowSelect?.(flow)}
            disabled={!onFlowSelect}
          >
            <span className="truncate font-semibold text-ink">{flow.label}</span>
            <span className="num shrink-0">{flow.detail ?? flow.value}</span>
          </button>
        ))}
      </figcaption>
    </figure>
  )
}
