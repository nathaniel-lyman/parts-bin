const LABEL_HORIZONTAL_PADDING = 8
const LABEL_VERTICAL_PADDING = 6
const MIN_LABEL_WIDTH = 16
const MIN_LABEL_HEIGHT = 14

export interface BarLabelBox {
  x: number
  y: number
  width: number
  height: number
}

export type BarLabelOrientation = 'horizontal' | 'vertical'

export function toFiniteNumber(value: unknown): number | null {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

export function formatBarLabelValue(value: unknown): string {
  const numberValue = toFiniteNumber(value)
  if (numberValue === null || numberValue === 0) return ''

  const absolute = Math.abs(numberValue)
  const formatted = absolute >= 10 || Number.isInteger(absolute) ? absolute.toFixed(0) : absolute.toFixed(1)
  return numberValue > 0 ? `+${formatted}` : `-${formatted}`
}

export function getBarLabelOrientation(box: BarLabelBox, label: string): BarLabelOrientation | null {
  if (!label) return null

  const estimatedTextWidth = label.length * 6.4
  const hasHorizontalRoom = box.width >= estimatedTextWidth + LABEL_HORIZONTAL_PADDING && box.height >= MIN_LABEL_HEIGHT
  if (hasHorizontalRoom) return 'horizontal'

  const hasVerticalRoom = box.width >= MIN_LABEL_WIDTH && box.height >= estimatedTextWidth + LABEL_VERTICAL_PADDING
  if (hasVerticalRoom) return 'vertical'

  return null
}
