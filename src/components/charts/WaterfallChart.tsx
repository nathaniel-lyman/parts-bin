import { useMemo, type ReactElement } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
  type TooltipContentProps,
} from 'recharts'
import { axisProps, gridProps, semantic, tooltipProps } from '../../theme/chart-theme'
import { getBarLabelOrientation, type BarLabelBox } from './barLabelUtils'
import { buildWaterfallData, type WaterfallDatum, type WaterfallStepInput } from './waterfallData'

interface WaterfallChartProps {
  data: readonly WaterfallStepInput[]
  ariaLabel?: string
  height?: number
  minWidth?: number
  barWidth?: number
  showLabels?: boolean
  valueFormatter?: (value: number) => string
  tickFormatter?: (value: number) => string
}

const DEFAULT_HEIGHT = 280
const DEFAULT_MIN_WIDTH = 420
const DEFAULT_BAR_WIDTH = 34

function defaultValueFormatter(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value)
}

function formatSignedValue(value: number, formatter: (value: number) => string) {
  if (value === 0) return formatter(0)
  return `${value > 0 ? '+' : '-'}${formatter(Math.abs(value))}`
}

function getDatumFill(kind: WaterfallDatum['kind']) {
  if (kind === 'increase') return semantic.pos
  if (kind === 'decrease') return semantic.neg
  if (kind === 'start') return semantic.muted
  return semantic.accent
}

function readWaterfallDatum(payload: unknown): WaterfallDatum | null {
  if (!payload || typeof payload !== 'object') return null
  const candidate = payload as Partial<WaterfallDatum>
  if (!Array.isArray(candidate.range)) return null
  if (typeof candidate.label !== 'string' || typeof candidate.kind !== 'string') return null
  return candidate as WaterfallDatum
}

function yForValue(datum: WaterfallDatum, shape: BarShapeProps, value: number) {
  const [low, high] = datum.range
  if (high === low || shape.height === 0) return shape.y
  const ratioFromTop = (high - value) / (high - low)
  return shape.y + ratioFromTop * shape.height
}

function WaterfallBarShape(props: BarShapeProps): ReactElement {
  const datum = readWaterfallDatum(props.payload)
  if (!datum || props.width <= 0 || props.height < 0) return <g />

  const fill = getDatumFill(datum.kind)
  const background = props.background
  const backgroundX = typeof background?.x === 'number' ? background.x : null
  const backgroundWidth = typeof background?.width === 'number' ? background.width : null
  const slotLeft = backgroundX ?? props.x
  const slotRight = backgroundX === null || backgroundWidth === null ? props.x + props.width : backgroundX + backgroundWidth
  const startY = yForValue(datum, props, datum.start)
  const endY = yForValue(datum, props, datum.end)
  const connectorBeforeY = datum.kind === 'total' || datum.kind === 'start' ? endY : startY
  const connectorAfterY = endY
  const connectorProps = {
    stroke: semantic.muted,
    strokeDasharray: '3 3',
    strokeOpacity: props.isActive ? 0.7 : 0.45,
    strokeWidth: 1,
    vectorEffect: 'non-scaling-stroke' as const,
  }

  return (
    <g>
      {datum.connectorBefore && slotLeft < props.x && (
        <line x1={slotLeft} x2={props.x} y1={connectorBeforeY} y2={connectorBeforeY} {...connectorProps} />
      )}
      {datum.connectorAfter && props.x + props.width < slotRight && (
        <line x1={props.x + props.width} x2={slotRight} y1={connectorAfterY} y2={connectorAfterY} {...connectorProps} />
      )}
      {props.height > 0 && (
        <Rectangle
          x={props.x}
          y={props.y}
          width={props.width}
          height={props.height}
          fill={fill}
          fillOpacity={props.isActive ? 1 : 0.9}
          stroke="var(--surface)"
          strokeWidth={1}
        />
      )}
    </g>
  )
}

interface WaterfallTooltipProps extends TooltipContentProps {
  valueFormatter: (value: number) => string
}

function WaterfallTooltip({ active, payload, valueFormatter }: WaterfallTooltipProps) {
  if (!active) return null
  const datum = readWaterfallDatum(payload?.[0]?.payload)
  if (!datum) return null

  return (
    <div className="shadow-dropdown min-w-48 border border-line bg-surface px-3 py-2 text-[12px] text-ink">
      <div className="micro mb-2">{datum.label}</div>
      <dl className="grid gap-1">
        <div className="flex items-center justify-between gap-6">
          <dt className="text-muted">Start</dt>
          <dd className="num m-0">{valueFormatter(datum.start)}</dd>
        </div>
        <div className="flex items-center justify-between gap-6">
          <dt className="text-muted">Change</dt>
          <dd className={`num m-0 ${datum.delta < 0 ? 'text-neg' : datum.delta > 0 ? 'text-pos' : 'text-muted'}`}>
            {formatSignedValue(datum.delta, valueFormatter)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-6">
          <dt className="text-muted">End</dt>
          <dd className="num m-0">{valueFormatter(datum.end)}</dd>
        </div>
      </dl>
      {datum.note && <p className="m-0 mt-2 max-w-56 text-[12px] text-muted">{datum.note}</p>}
    </div>
  )
}

function describeWaterfallDatum(datum: WaterfallDatum, valueFormatter: (value: number) => string) {
  if (datum.kind === 'start') {
    return `${datum.label}: starting total ${valueFormatter(datum.end)}.`
  }
  if (datum.kind === 'total') {
    const adjustment = datum.delta === 0 ? '' : `, adjusted ${formatSignedValue(datum.delta, valueFormatter)} from the prior bridge total`
    return `${datum.label}: total ${valueFormatter(datum.end)}${adjustment}.`
  }
  return `${datum.label}: changes by ${formatSignedValue(datum.delta, valueFormatter)}, moving from ${valueFormatter(datum.start)} to ${valueFormatter(datum.end)}.`
}

function formatWaterfallLabel(datum: WaterfallDatum, valueFormatter: (value: number) => string) {
  if (datum.kind === 'start' || datum.kind === 'total') return valueFormatter(datum.end)
  return formatSignedValue(datum.delta, valueFormatter)
}

function getInternalLabelFill(kind: WaterfallDatum['kind']) {
  if (kind === 'start') return 'var(--bg)'
  return 'var(--accent-fg)'
}

function WaterfallValueLabel({
  box,
  datum,
  zeroY,
  chartTop,
  chartBottom,
  valueFormatter,
}: {
  box: BarLabelBox
  datum: WaterfallDatum
  zeroY: number | null
  chartTop: number
  chartBottom: number
  valueFormatter: (value: number) => string
}) {
  const label = formatWaterfallLabel(datum, valueFormatter)
  const orientation = getBarLabelOrientation(box, label)
  const x = box.x + box.width / 2
  const barBottom = box.y + box.height
  const isAboveAxis = zeroY !== null && barBottom <= zeroY
  const isBelowAxis = zeroY !== null && box.y >= zeroY
  const placeBelow = orientation
    ? false
    : isBelowAxis || (!isAboveAxis && datum.delta < 0)
  const outsideY = placeBelow
    ? Math.min(chartBottom - 7, barBottom + 13)
    : Math.max(chartTop + 7, box.y - 7)
  const y = orientation ? box.y + box.height / 2 : outsideY
  const transform = orientation === 'vertical' ? `rotate(-90 ${x} ${y})` : undefined

  return (
    <text
      x={x}
      y={y}
      transform={transform}
      fill={orientation ? getInternalLabelFill(datum.kind) : getDatumFill(datum.kind)}
      fontFamily='"JetBrains Mono", monospace'
      fontSize={11}
      fontWeight={700}
      textAnchor="middle"
      dominantBaseline={orientation ? 'central' : placeBelow ? 'hanging' : 'auto'}
      pointerEvents="none"
    >
      {label}
    </text>
  )
}

function renderWaterfallBarShape(showLabels: boolean, valueFormatter: (value: number) => string) {
  return function WaterfallBarShapeWithLabels(props: BarShapeProps): ReactElement {
    const datum = readWaterfallDatum(props.payload)
    const shape = WaterfallBarShape(props)
    if (!showLabels || !datum || props.width <= 0 || props.height <= 0) return shape

    return (
      <g>
        {shape}
        <WaterfallValueLabel
          box={{ x: props.x, y: props.y, width: props.width, height: props.height }}
          datum={datum}
          zeroY={Number.isFinite(props.stackedBarStart) ? props.stackedBarStart : null}
          chartTop={props.parentViewBox.y}
          chartBottom={props.parentViewBox.y + props.parentViewBox.height}
          valueFormatter={valueFormatter}
        />
      </g>
    )
  }
}

const legendItems = [
  { label: 'Start', className: 'bg-muted' },
  { label: 'Increase', className: 'bg-pos' },
  { label: 'Decrease', className: 'bg-neg' },
  { label: 'Total', className: 'bg-accent' },
]

export function WaterfallChart({
  data,
  ariaLabel = 'Waterfall chart',
  height = DEFAULT_HEIGHT,
  minWidth = DEFAULT_MIN_WIDTH,
  barWidth = DEFAULT_BAR_WIDTH,
  showLabels = false,
  valueFormatter = defaultValueFormatter,
  tickFormatter = defaultValueFormatter,
}: WaterfallChartProps) {
  const { data: chartData, summary } = useMemo(() => buildWaterfallData(data), [data])
  const barShape = useMemo(() => renderWaterfallBarShape(showLabels, valueFormatter), [showLabels, valueFormatter])

  return (
    <figure className="m-0 grid gap-3" aria-label={ariaLabel}>
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="border border-line bg-surface-2 px-3 py-2">
          <div className="micro">Start</div>
          <div className="num text-[18px] text-muted">{valueFormatter(summary.start)}</div>
        </div>
        <div className="border border-line bg-surface-2 px-3 py-2">
          <div className="micro">Net</div>
          <div className={`num text-[18px] ${summary.delta < 0 ? 'text-neg' : summary.delta > 0 ? 'text-pos' : 'text-muted'}`}>
            {formatSignedValue(summary.delta, valueFormatter)}
          </div>
        </div>
        <div className="border border-line bg-surface-2 px-3 py-2">
          <div className="micro">End</div>
          <div className="num text-[18px] text-accent">{valueFormatter(summary.end)}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2" aria-hidden="true">
        {legendItems.map((item) => (
          <span key={item.label} className="micro inline-flex items-center gap-2">
            <span className={`h-2 w-2 shrink-0 ${item.className}`} />
            {item.label}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto">
        <div style={{ height, minWidth }}>
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: minWidth, height }}>
            <BarChart data={chartData} margin={{ top: 20, right: 12, bottom: 4, left: -16 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps} interval={0} tickMargin={8} />
              <YAxis {...axisProps} tickFormatter={(value) => tickFormatter(Number(value))} />
              <Tooltip
                wrapperStyle={tooltipProps.wrapperStyle}
                cursor={tooltipProps.cursor}
                content={(props) => <WaterfallTooltip {...props} valueFormatter={valueFormatter} />}
              />
              <ReferenceLine y={0} stroke={semantic.muted} />
              <Bar
                dataKey="range"
                barSize={barWidth}
                maxBarSize={barWidth}
                shape={barShape}
                background={{ fill: 'var(--surface)', fillOpacity: 0 }}
                isAnimationActive="auto"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <figcaption className="sr-only">
        {chartData.map((datum) => `${describeWaterfallDatum(datum, valueFormatter)} `)}
      </figcaption>
    </figure>
  )
}
