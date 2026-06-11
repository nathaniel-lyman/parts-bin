import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cx } from './utils'
import { useAnchoredPosition } from './useAnchoredPosition'

export interface DropdownMenuItem {
  id: string
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
  destructive?: boolean
  onSelect?: () => void
}

export interface DropdownMenuProps {
  label: ReactNode
  items: DropdownMenuItem[]
  align?: 'start' | 'end'
}

export function DropdownMenu({ label, items, align = 'start' }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const menuStyle = useAnchoredPosition(open, triggerRef, menuRef, { align })
  const enabledItems = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !item.disabled)

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // Read items through a ref so the open-focus effect fires only when the menu
  // opens — inline `items` arrays change identity every parent render, and the
  // rAF re-focus would otherwise snap focus back to the first item mid-navigation.
  const itemsRef = useRef(items)
  useEffect(() => {
    itemsRef.current = items
  })

  useEffect(() => {
    if (!open) return undefined
    const firstEnabled = itemsRef.current.findIndex((item) => !item.disabled)
    if (firstEnabled !== -1) requestAnimationFrame(() => itemRefs.current[firstEnabled]?.focus())
    return undefined
  }, [open])

  const close = (returnFocus = true) => {
    setOpen(false)
    if (returnFocus) requestAnimationFrame(() => triggerRef.current?.focus())
  }

  const focusItem = (index: number) => {
    itemRefs.current[index]?.focus()
  }

  const focusRelativeItem = (fromIndex: number, direction: 1 | -1) => {
    if (enabledItems.length === 0) return
    const currentEnabledIndex = enabledItems.findIndex(({ index }) => index === fromIndex)
    const nextEnabledIndex = currentEnabledIndex === -1
      ? 0
      : (currentEnabledIndex + direction + enabledItems.length) % enabledItems.length
    focusItem(enabledItems[nextEnabledIndex].index)
  }

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setOpen(true)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      requestAnimationFrame(() => {
        const lastEnabled = enabledItems[enabledItems.length - 1]
        if (lastEnabled) focusItem(lastEnabled.index)
      })
    }
  }

  const onItemKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number, item: DropdownMenuItem) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
    } else if (event.key === 'Tab') {
      // The menu renders in a portal, so letting Tab proceed would drop focus
      // somewhere unrelated in the document — close and return to the trigger.
      event.preventDefault()
      close()
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusRelativeItem(index, 1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      focusRelativeItem(index, -1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      if (enabledItems[0]) focusItem(enabledItems[0].index)
    } else if (event.key === 'End') {
      event.preventDefault()
      const lastEnabled = enabledItems[enabledItems.length - 1]
      if (lastEnabled) focusItem(lastEnabled.index)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      item.onSelect?.()
      close()
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onTriggerKeyDown}
        className="inline-flex h-8 items-center justify-center rounded-[2px] border border-line bg-surface px-3 text-[13px] font-medium text-ink hover:bg-surface-2"
      >
        {label}
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          style={menuStyle}
          className="z-50 w-56 border border-line bg-surface p-1 shadow-dropdown"
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
              tabIndex={item.disabled ? -1 : 0}
              onClick={() => {
                item.onSelect?.()
                close()
              }}
              onKeyDown={(event) => onItemKeyDown(event, index, item)}
              className={cx(
                'grid w-full gap-0.5 px-2 py-1.5 text-left text-[13px] text-ink hover:bg-surface-2 disabled:text-faint',
                item.destructive && 'text-neg',
              )}
            >
              <span>{item.label}</span>
              {item.description && <span id={descriptionId} className="text-[12px] text-muted">{item.description}</span>}
            </button>
            )
          })}
        </div>,
        document.body,
      )}
    </>
  )
}
