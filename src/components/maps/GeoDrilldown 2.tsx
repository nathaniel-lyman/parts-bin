import { useMemo, useState } from 'react'
import { cx } from '../ui/utils'
import { RegionChoropleth } from './RegionChoropleth'
import { ledgerMapViewport, ledgerRegions } from './demoData'
import type { MapMetric, MapRegion, MapViewport } from './types'

export interface GeoDrilldownProps {
  regions?: MapRegion[]
  viewport?: MapViewport
  initialRegionId?: string
  title?: string
  description?: string
  onRegionChange?: (region: MapRegion) => void
  className?: string
}

const metricToneClass: Record<NonNullable<MapMetric['tone']>, string> = {
  neutral: 'text-muted',
  positive: 'text-pos',
  negative: 'text-neg',
  warning: 'text-warn',
  accent: 'text-accent',
  intelligence: 'text-intel',
}

export function GeoDrilldown({
  regions = ledgerRegions,
  viewport = ledgerMapViewport,
  initialRegionId,
  title = 'Regional drilldown',
  description = 'Use the map as a filter surface for KPIs, charts, and grid rows.',
  onRegionChange,
  className,
}: GeoDrilldownProps) {
  const [selectedRegionId, setSelectedRegionId] = useState(initialRegionId ?? regions[0]?.id)
  const selectedRegion = useMemo(
    () => regions.find((region) => region.id === selectedRegionId) ?? regions[0],
    [regions, selectedRegionId],
  )

  const selectRegion = (region: MapRegion) => {
    setSelectedRegionId(region.id)
    onRegionChange?.(region)
  }

  if (!selectedRegion) return null

  return (
    <section className={cx('grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]', className)}>
      <div className="min-w-0">
        <RegionChoropleth
          regions={regions}
          viewport={viewport}
          selectedRegionId={selectedRegion.id}
          valueLabel="regional score"
          onRegionSelect={selectRegion}
          ariaLabel={title}
        />
      </div>
      <aside className="grid content-start gap-3 border border-line bg-surface-2 p-3">
        <div className="grid gap-1">
          <p className="micro m-0">{title}</p>
          <h3 className="m-0 text-[18px] font-semibold text-ink">{selectedRegion.label}</h3>
          <p className="m-0 text-[12px] text-muted">{description}</p>
        </div>
        <dl className="m-0 grid gap-2">
          {(selectedRegion.metrics ?? [{ label: 'Value', value: selectedRegion.detail ?? selectedRegion.value, tone: 'accent' as const }]).map((metric) => (
            <div key={String(metric.label)} className="flex items-center justify-between gap-3 border border-line bg-surface px-3 py-2">
              <dt className="micro min-w-0 truncate">{metric.label}</dt>
              <dd className={cx('num m-0 shrink-0 font-semibold', metricToneClass[metric.tone ?? 'neutral'])}>{metric.value}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </section>
  )
}

