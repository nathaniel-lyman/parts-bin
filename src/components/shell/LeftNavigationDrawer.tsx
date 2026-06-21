import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { cx } from '../ui/utils'
import { AdminNavigationItem } from './AdminNavigationItem'
import { AdminSectionDivider } from './AdminSectionDivider'
import { BrandLockup } from './BrandLockup'
import { CollapseSidebarControl } from './CollapseSidebarControl'
import { NavigationItem, type NavigationItemProps } from './NavigationItem'

export type DrawerNavigationItem = Omit<NavigationItemProps, 'collapsed' | 'variant'>

export interface SidebarResizeConfig {
  width?: number
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  onWidthChange?: (width: number) => void
}

export interface LeftNavigationDrawerProps {
  brand: ReactNode
  brandHref?: string
  brandMark?: ReactNode
  items: DrawerNavigationItem[]
  adminItems?: DrawerNavigationItem[]
  footer?: ReactNode
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  resizable?: boolean | SidebarResizeConfig
}

const DEFAULT_WIDTH = 224
const DEFAULT_MIN_WIDTH = 192
const DEFAULT_MAX_WIDTH = 360
const COLLAPSED_WIDTH = 56
const RESIZE_STEP = 16

function clampWidth(width: number, minWidth: number, maxWidth: number) {
  return Math.min(maxWidth, Math.max(minWidth, Math.round(width)))
}

export function LeftNavigationDrawer({
  brand,
  brandHref,
  brandMark,
  items,
  adminItems = [],
  footer,
  collapsed = false,
  onCollapsedChange,
  resizable = false,
}: LeftNavigationDrawerProps) {
  const resizeEnabled = Boolean(resizable)
  const resizeOptions = typeof resizable === 'object' ? resizable : undefined
  const minWidth = resizeEnabled ? Math.max(COLLAPSED_WIDTH, resizeOptions?.minWidth ?? DEFAULT_MIN_WIDTH) : DEFAULT_MIN_WIDTH
  const maxWidth = resizeEnabled ? Math.max(minWidth, resizeOptions?.maxWidth ?? DEFAULT_MAX_WIDTH) : DEFAULT_MAX_WIDTH
  const controlledWidth = resizeOptions?.width
  const [internalWidth, setInternalWidth] = useState(() =>
    clampWidth(resizeOptions?.defaultWidth ?? DEFAULT_WIDTH, minWidth, maxWidth),
  )
  const currentWidth = clampWidth(controlledWidth ?? internalWidth, minWidth, maxWidth)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)
  const startWidth = useRef(currentWidth)
  const isControlled = controlledWidth !== undefined

  const commitWidth = useCallback((nextWidth: number) => {
    const clamped = clampWidth(nextWidth, minWidth, maxWidth)
    if (!isControlled) setInternalWidth(clamped)
    resizeOptions?.onWidthChange?.(clamped)
  }, [isControlled, maxWidth, minWidth, resizeOptions?.onWidthChange])

  const onResizePointerDown = useCallback((event: ReactPointerEvent<HTMLSpanElement>) => {
    if (!resizeEnabled || collapsed || event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    startX.current = event.clientX
    startWidth.current = currentWidth
    event.currentTarget.setPointerCapture?.(event.pointerId)
    setDragging(true)
  }, [collapsed, currentWidth, resizeEnabled])

  useEffect(() => {
    if (!dragging) return

    const prevCursor = document.body.style.cursor
    const prevUserSelect = document.body.style.userSelect
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const onMove = (event: PointerEvent) => {
      commitWidth(startWidth.current + event.clientX - startX.current)
    }
    const onUp = () => setDragging(false)

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      document.body.style.cursor = prevCursor
      document.body.style.userSelect = prevUserSelect
    }
  }, [commitWidth, dragging])

  const widthStyle: CSSProperties | undefined = resizeEnabled && !collapsed ? { width: currentWidth } : undefined

  return (
    <aside
      className={cx(
        'relative hidden min-h-screen shrink-0 border-r border-line bg-surface lg:flex lg:flex-col',
        collapsed ? 'w-14' : resizeEnabled ? undefined : 'w-56',
      )}
      style={widthStyle}
    >
      <div className={cx('border-b border-line', collapsed ? 'grid justify-items-center gap-2 p-2' : 'flex items-center justify-between gap-2 px-3 py-3')}>
        <BrandLockup href={brandHref} mark={brandMark} collapsed={collapsed}>
          {brand}
        </BrandLockup>
        {onCollapsedChange && (
          <CollapseSidebarControl collapsed={collapsed} onClick={() => onCollapsedChange(!collapsed)} />
        )}
      </div>
      <nav className="grid gap-1 p-2" aria-label="Primary">
        {items.map((item) => (
          <NavigationItem key={String(item.label)} {...item} collapsed={collapsed} />
        ))}
        {adminItems.length > 0 && (
          <>
            <AdminSectionDivider collapsed={collapsed} />
            {adminItems.map((item) => (
              <AdminNavigationItem key={String(item.label)} {...item} collapsed={collapsed} />
            ))}
          </>
        )}
      </nav>
      {!collapsed && footer && (
        <div className="mt-auto border-t border-line p-3">
          <div className="min-w-0">{footer}</div>
        </div>
      )}
      {resizeEnabled && !collapsed && (
        <span
          role="separator"
          tabIndex={0}
          aria-label="Resize sidebar"
          aria-orientation="vertical"
          aria-valuemin={minWidth}
          aria-valuemax={maxWidth}
          aria-valuenow={currentWidth}
          onPointerDown={onResizePointerDown}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault()
              commitWidth(currentWidth - RESIZE_STEP)
            } else if (event.key === 'ArrowRight') {
              event.preventDefault()
              commitWidth(currentWidth + RESIZE_STEP)
            } else if (event.key === 'Home') {
              event.preventDefault()
              commitWidth(minWidth)
            } else if (event.key === 'End') {
              event.preventDefault()
              commitWidth(maxWidth)
            }
          }}
          className={cx(
            'absolute inset-y-0 -right-1 z-10 w-2 cursor-col-resize touch-none select-none outline-none',
            'after:absolute after:right-1 after:top-0 after:h-full after:w-px after:bg-transparent hover:after:bg-accent focus-visible:after:bg-accent',
            dragging && 'after:bg-accent',
          )}
        />
      )}
    </aside>
  )
}
