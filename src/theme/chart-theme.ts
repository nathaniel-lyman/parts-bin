// Chart styling derived from tokens. Recharts reads CSS vars via var(--…) at render,
// so dark mode + re-skin apply automatically.
// Series tokens track the default palette: primary action, recommendation intelligence,
// success, review, and reject/blocker.
export const SERIES = ['var(--accent)', 'var(--intel)', 'var(--pos)', 'var(--warn)', 'var(--neg)', '#0d9488', '#64748b', '#84cc16']

export const axisProps = {
  tick: { fill: 'var(--muted)', fontSize: 11, fontFamily: '"JetBrains Mono", monospace' },
  axisLine: { stroke: 'var(--line)' },
  tickLine: false as const,
}
export const gridProps = { stroke: 'var(--line)', strokeDasharray: '3 3', vertical: false }
export const semantic = { accent: 'var(--accent)', intel: 'var(--intel)', cyan: '#00a6c2', pos: 'var(--pos)', neg: 'var(--neg)', muted: 'var(--muted)' }

// Themed tooltip (surface + hairline + dropdown shadow, mono values) — THEME-SPEC §6.
export const tooltipProps = {
  contentStyle: {
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    borderRadius: 2,
    boxShadow: '0 4px 16px rgb(0 0 0 / .10)',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12,
    color: 'var(--ink)',
  },
  labelStyle: { color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '.06em' },
  cursor: { fill: 'var(--surface-2)' },
}

// Top-right micro-label legend with small square swatches — THEME-SPEC §6.
export const legendProps = {
  align: 'right' as const,
  verticalAlign: 'top' as const,
  iconType: 'square' as const,
  iconSize: 8,
  wrapperStyle: { fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '.06em', color: 'var(--muted)' },
}
