import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { cx } from './utils'

export interface TabItem {
  id: string
  label: ReactNode
  content: ReactNode
  disabled?: boolean
}

export interface TabsProps {
  items: TabItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  className?: string
  label?: string
}

export function Tabs({ items, value, defaultValue, onValueChange, className, label }: TabsProps) {
  const tabsId = useId()
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const firstEnabled = useMemo(() => items.find((item) => !item.disabled)?.id ?? items[0]?.id, [items])
  const [internalValue, setInternalValue] = useState(defaultValue ?? firstEnabled)
  const activeValue = value ?? internalValue
  const activeItem = items.find((item) => item.id === activeValue) ?? items.find((item) => !item.disabled) ?? items[0]

  const select = (nextValue: string) => {
    setInternalValue(nextValue)
    onValueChange?.(nextValue)
  }

  const enabledIndexes = items.map((item, index) => ({ item, index })).filter(({ item }) => !item.disabled)

  const selectIndex = (index: number) => {
    const item = items[index]
    if (!item || item.disabled) return
    select(item.id)
    tabRefs.current[index]?.focus()
  }

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const currentEnabledIndex = enabledIndexes.findIndex((item) => item.index === index)
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      const next = enabledIndexes[(currentEnabledIndex + 1 + enabledIndexes.length) % enabledIndexes.length]
      if (next) selectIndex(next.index)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      const previous = enabledIndexes[(currentEnabledIndex - 1 + enabledIndexes.length) % enabledIndexes.length]
      if (previous) selectIndex(previous.index)
    } else if (event.key === 'Home') {
      event.preventDefault()
      if (enabledIndexes[0]) selectIndex(enabledIndexes[0].index)
    } else if (event.key === 'End') {
      event.preventDefault()
      const last = enabledIndexes[enabledIndexes.length - 1]
      if (last) selectIndex(last.index)
    }
  }

  return (
    <div className={cx('grid min-w-0 gap-3', className)}>
      <div role="tablist" aria-label={label} className="inline-flex w-fit border border-line bg-surface">
        {items.map((item, index) => {
          const selected = item.id === activeItem?.id
          const tabId = `${tabsId}-tab-${item.id}`
          const panelId = `${tabsId}-panel-${item.id}`
          return (
          <button
            key={item.id}
            ref={(node) => { tabRefs.current[index] = node }}
            id={tabId}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            disabled={item.disabled}
            onClick={() => select(item.id)}
            onKeyDown={(event) => onTabKeyDown(event, index)}
            className={cx(
              'h-8 border-r border-line px-3 text-[13px] font-medium text-muted last:border-r-0 hover:bg-surface-2 hover:text-ink disabled:text-faint',
              selected && 'bg-accent-soft text-accent',
            )}
          >
            {item.label}
          </button>
          )
        })}
      </div>
      {activeItem && (
        <div
          id={`${tabsId}-panel-${activeItem.id}`}
          role="tabpanel"
          aria-labelledby={`${tabsId}-tab-${activeItem.id}`}
          tabIndex={0}
          className="min-w-0 text-[13px] text-ink"
        >
          {activeItem.content}
        </div>
      )}
    </div>
  )
}
