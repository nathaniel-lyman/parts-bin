import { useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react'

export interface AnchoredPositionOptions {
  align?: 'start' | 'end'
  /** Space between the trigger and the panel, px. */
  gap?: number
  /** Minimum distance from the viewport edges, px. */
  margin?: number
  /** Size the panel to the trigger's width (e.g. combobox listboxes). */
  matchWidth?: boolean
}

/**
 * Fixed-position coordinates for a floating panel anchored to a trigger.
 * Panels using this should render in a portal (document.body) so no
 * overflow-hidden/auto ancestor can clip them. Places the panel below the
 * trigger, flips above when the space below is too short (and above fits),
 * and clamps horizontally so the panel never leaves the viewport.
 * Recomputes on scroll and resize while open.
 */
export function useAnchoredPosition(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
  { align = 'start', gap = 8, margin = 8, matchWidth = false }: AnchoredPositionOptions = {},
): CSSProperties {
  const [style, setStyle] = useState<CSSProperties>({})

  useLayoutEffect(() => {
    if (!open) return undefined
    const update = () => {
      const trigger = triggerRef.current
      const panel = panelRef.current
      if (!trigger || !panel) return
      const triggerRect = trigger.getBoundingClientRect()
      const panelRect = panel.getBoundingClientRect()
      const fitsBelow = triggerRect.bottom + gap + panelRect.height <= window.innerHeight - margin
      const fitsAbove = triggerRect.top - gap - panelRect.height >= margin
      const top = fitsBelow || !fitsAbove
        ? triggerRect.bottom + gap
        : triggerRect.top - gap - panelRect.height
      const panelWidth = matchWidth ? triggerRect.width : panelRect.width
      const preferredLeft = align === 'end' ? triggerRect.right - panelWidth : triggerRect.left
      const left = Math.max(margin, Math.min(preferredLeft, window.innerWidth - margin - panelWidth))
      setStyle(matchWidth
        ? { position: 'fixed', top, left, width: panelWidth }
        : { position: 'fixed', top, left })
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, align, gap, margin, matchWidth, triggerRef, panelRef])

  return style
}
