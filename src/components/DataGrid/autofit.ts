export interface FitColumnOptions {
  /** Extra space added to the widest content (cell horizontal padding + breathing room). */
  padding?: number
  min?: number
  max?: number
}

/** Pure: pick a column width that fits the widest measured content, clamped to [min, max]. */
export function fitColumnWidth(contentWidths: number[], opts: FitColumnOptions = {}): number {
  const { padding = 24, min = 48, max = 600 } = opts
  const widest = contentWidths.length ? Math.max(...contentWidths) : 0
  return Math.min(Math.max(Math.ceil(widest + padding), min), max)
}

/** Extra room reserved in a header so the sort glyph and column-menu button stay visible. */
const HEADER_AFFORDANCE = 44

/**
 * Measure the intrinsic content width of every rendered cell in a column, independent of the
 * column's current (constrained) width — so autofit can both grow and shrink a column.
 *
 * Text is measured with an off-screen probe using the font of the element that holds it.
 * Block/flex wrappers stretch to fill the cell and are ignored; only inline content
 * (badges, sparklines, pills) contributes its own laid-out width on top of the text.
 */
export function measureColumnContentWidths(scrollEl: HTMLElement, columnId: string): number[] {
  const cells = scrollEl.querySelectorAll<HTMLElement>(`[data-column-id="${CSS.escape(columnId)}"]`)
  if (cells.length === 0) return []

  const probe = document.createElement('span')
  probe.style.position = 'absolute'
  probe.style.visibility = 'hidden'
  probe.style.whiteSpace = 'nowrap'
  probe.style.pointerEvents = 'none'
  probe.style.left = '-9999px'
  probe.style.top = '0'
  scrollEl.appendChild(probe)

  const widths: number[] = []
  cells.forEach((cell) => {
    const isHeader = cell.tagName === 'TH'
    const textHolder = (cell.firstElementChild as HTMLElement | null) ?? cell
    probe.style.font = getComputedStyle(textHolder).font
    probe.textContent = (cell.textContent ?? '').trim()
    let width = probe.getBoundingClientRect().width

    if (isHeader) {
      width += HEADER_AFFORDANCE
    } else {
      // Inline content has an intrinsic width the text probe can't see; block/flex
      // wrappers fill the cell and would falsely anchor the result to the current width.
      const child = cell.firstElementChild as HTMLElement | null
      if (child && getComputedStyle(child).display.startsWith('inline')) {
        width = Math.max(width, child.getBoundingClientRect().width)
      }
    }

    widths.push(width)
  })

  scrollEl.removeChild(probe)
  return widths
}
