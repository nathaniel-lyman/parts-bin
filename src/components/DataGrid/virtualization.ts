export interface RangeInput {
  scrollOffset: number
  itemSize: number
  count: number
  viewport: number
  overscan: number
}

export interface Range {
  start: number
  end: number
}

const clamp = (value: number, min: number, max: number): number =>
  value < min ? min : value > max ? max : value

export function computeRange({ scrollOffset, itemSize, count, viewport, overscan }: RangeInput): Range {
  if (count <= 0 || itemSize <= 0 || viewport <= 0) return { start: 0, end: 0 }

  const firstVisible = Math.floor(Math.max(0, scrollOffset) / itemSize)
  const visibleCount = Math.ceil(viewport / itemSize)
  const start = clamp(firstVisible - overscan, 0, count)
  const end = clamp(firstVisible + visibleCount + overscan, 0, count)

  return { start, end }
}

export interface ColumnRangeInput {
  widths: number[]
  scrollOffset: number
  viewport: number
  overscan: number
}

export function computeColumnRange({ widths, scrollOffset, viewport, overscan }: ColumnRangeInput): Range {
  const count = widths.length
  if (count === 0 || viewport <= 0) return { start: 0, end: 0 }

  const left = Math.max(0, scrollOffset)
  const right = left + viewport
  let cursor = 0
  let firstVisible = count
  let endVisible = 0

  for (let index = 0; index < count; index += 1) {
    const width = Math.max(0, widths[index])
    const columnStart = cursor
    const columnEnd = cursor + width
    if (columnEnd > left && columnStart < right) {
      firstVisible = Math.min(firstVisible, index)
      endVisible = Math.max(endVisible, index + 1)
    }
    cursor = columnEnd
  }

  if (firstVisible === count) return { start: count, end: count }

  return {
    start: clamp(firstVisible - overscan, 0, count),
    end: clamp(endVisible + overscan, 0, count),
  }
}
