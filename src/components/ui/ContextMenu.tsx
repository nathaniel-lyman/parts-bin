import { useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import type { DropdownMenuItem } from './DropdownMenu'
import { cx } from './utils'

export interface ContextMenuProps {
  /** Same item shape as DropdownMenu. */
  items: DropdownMenuItem[]
  /** The right-clickable target. */
  children: ReactNode
  className?: string
}

/**
 * Right-click menu for a wrapped target (rows, cards, canvas regions). Opens
 * at the pointer position with the WAI-ARIA menu pattern: focus moves into the
 * menu, arrows skip disabled items, Escape and outside clicks close.
 */
export function ContextMenu({ items, children, className }: ContextMenuProps) {
  const menuId = useId()
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const open = position !== null
  const menuRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const enabledItems = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !item.disabled)

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setPosition(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // Move focus into the menu on open (items carry their own keyboard handling).
  useEffect(() => {
    if (!open) return undefined
    const firstEnabled = items.findIndex((item) => !item.disabled)
    if (firstEnabled !== -1) requestAnimationFrame(() => itemRefs.current[firstEnabled]?.focus())
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps -- engage once per open; see DropdownMenu
  }, [open])

  const onContextMenu = (event: MouseEvent) => {
    event.preventDefault()
    setPosition({ x: event.clientX, y: event.clientY })
  }

  const focusRelativeItem = (fromIndex: number, direction: 1 | -1) => {
    if (enabledItems.length === 0) return
    const currentEnabledIndex = enabledItems.findIndex(({ index }) => index === fromIndex)
    const nextEnabledIndex = currentEnabledIndex === -1
      ? 0
      : (currentEnabledIndex + direction + enabledItems.length) % enabledItems.length
    itemRefs.current[enabledItems[nextEnabledIndex].index]?.focus()
  }

  const onItemKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number, item: DropdownMenuItem) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusRelativeItem(index, 1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      focusRelativeItem(index, -1)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      item.onSelect?.()
      setPosition(null)
    }
  }

  return (
    <div onContextMenu={onContextMenu} className={className}>
      {children}
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          style={{ left: `${position.x}px`, top: `${position.y}px` }}
          onKeyDown={(event) => {
            if (event.key !== 'Escape') return
            event.preventDefault()
            setPosition(null)
          }}
          className="fixed z-50 w-56 rounded-md border border-line bg-surface p-1 shadow-dropdown"
        >
          {items.map((item, index) => {
            const descriptionId = item.description ? `${menuId}-${item.id}-description` : undefined
            return (
              <button
                key={item.id}
                ref={(node) => { itemRefs.current[index] = node }}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                aria-describedby={descriptionId}
                onClick={() => {
                  item.onSelect?.()
                  setPosition(null)
                }}
                onKeyDown={(event) => onItemKeyDown(event, index, item)}
                className={cx(
                  'grid w-full gap-0.5 px-2 py-1.5 text-left text-[14px] text-ink hover:bg-surface-2 disabled:text-faint',
                  item.destructive && 'text-neg',
                )}
              >
                <span>{item.label}</span>
                {item.description && <span id={descriptionId} className="text-[12px] text-muted">{item.description}</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
