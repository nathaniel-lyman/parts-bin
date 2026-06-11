import type { ReactElement } from 'react'
import type { LabelProps } from 'recharts'
import { formatBarLabelValue, getBarLabelOrientation, toFiniteNumber, type BarLabelBox } from './barLabelUtils'

const LABEL_FONT_SIZE = 11

function readBox(props: LabelProps): BarLabelBox | null {
  const viewBox = props.viewBox as Partial<BarLabelBox> | undefined
  const x = toFiniteNumber(viewBox?.x ?? props.x)
  const y = toFiniteNumber(viewBox?.y ?? props.y)
  const width = toFiniteNumber(viewBox?.width ?? props.width)
  const height = toFiniteNumber(viewBox?.height ?? props.height)

  if (x === null || y === null || width === null || height === null) return null
  if (width <= 0 || height <= 0) return null
  return { x, y, width, height }
}

export interface SmartBarValueLabelProps extends LabelProps {
  dataKey?: string
}

function readLabelValue(props: SmartBarValueLabelProps): unknown {
  const runtimeProps = props as SmartBarValueLabelProps & { payload?: Record<string, unknown> }
  if (typeof runtimeProps.dataKey === 'string' && runtimeProps.payload && runtimeProps.dataKey in runtimeProps.payload) {
    return runtimeProps.payload[runtimeProps.dataKey]
  }
  return props.value
}

export function SmartBarValueLabel(props: SmartBarValueLabelProps): ReactElement {
  const box = readBox(props)
  const label = formatBarLabelValue(readLabelValue(props))
  const orientation = box ? getBarLabelOrientation(box, label) : null

  if (!box || !orientation) return <g />

  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  const transform = orientation === 'vertical' ? `rotate(-90 ${x} ${y})` : undefined

  return (
    <text
      x={x}
      y={y}
      transform={transform}
      fill="var(--accent-fg)"
      fontFamily='"JetBrains Mono", monospace'
      fontSize={LABEL_FONT_SIZE}
      fontWeight={700}
      textAnchor="middle"
      dominantBaseline="central"
      pointerEvents="none"
    >
      {label}
    </text>
  )
}
