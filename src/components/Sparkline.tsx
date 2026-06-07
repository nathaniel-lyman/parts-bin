interface Props {
  data: number[]
  /** use the negative/destructive token instead of accent */
  neg?: boolean
  width?: number
  height?: number
}

/**
 * Minimal inline-SVG sparkline (THEME-SPEC §6 KPI card).
 * Stroke uses theme tokens (var(--accent) / var(--neg)) so it re-skins and adapts
 * to dark mode automatically. No raw colors — stays inside the swappable boundary.
 */
export function Sparkline({ data, neg = false, width = 96, height = 28 }: Props) {
  if (data.length < 2) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const span = max - min || 1
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / span) * (height - 4) - 2
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg width={width} height={height} className="block" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={neg ? 'var(--neg)' : 'var(--accent)'}
        strokeWidth="1.5"
        opacity="0.65"
      />
    </svg>
  )
}
