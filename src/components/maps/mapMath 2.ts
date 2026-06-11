export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function normalizeValue(value: number, values: number[]) {
  if (values.length === 0) return 0
  let min = values[0]
  let max = values[0]
  for (const next of values) {
    min = Math.min(min, next)
    max = Math.max(max, next)
  }
  if (max === min) return 1
  return (value - min) / (max - min)
}

export function scaleBetween(value: number, values: number[], min: number, max: number) {
  return min + normalizeValue(value, values) * (max - min)
}

export function arcPath(from: [number, number], to: [number, number]) {
  const [x1, y1] = from
  const [x2, y2] = to
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2
  const distance = Math.hypot(x2 - x1, y2 - y1)
  const bend = clamp(distance * 0.18, 4, 12)
  return `M ${x1} ${y1} Q ${midX} ${midY - bend} ${x2} ${y2}`
}

