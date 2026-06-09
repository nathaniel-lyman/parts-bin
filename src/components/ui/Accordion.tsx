import { useId, useState, type ReactNode } from 'react'
import { cx } from './utils'

export interface AccordionItem {
  id: string
  title: ReactNode
  content: ReactNode
  disabled?: boolean
}

export interface AccordionProps {
  items: AccordionItem[]
  /** Allow several sections open at once; default is one-at-a-time. */
  multiple?: boolean
  defaultOpenIds?: string[]
  className?: string
}

/**
 * Disclosure list following the WAI-ARIA accordion pattern: each header is a
 * button with aria-expanded/aria-controls, each panel a labelled region.
 * Uncontrolled; single-open by default.
 */
export function Accordion({ items, multiple = false, defaultOpenIds = [], className }: AccordionProps) {
  const baseId = useId()
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(defaultOpenIds))

  const toggle = (id: string) => {
    setOpenIds((current) => {
      const next = new Set(multiple ? current : [...current].filter((open) => open === id))
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className={cx('border border-line bg-surface', className)}>
      {items.map((item) => {
        const open = openIds.has(item.id)
        const headerId = `${baseId}-${item.id}-header`
        const panelId = `${baseId}-${item.id}-panel`
        return (
          <div key={item.id} className="border-b border-line last:border-b-0">
            <h3 className="m-0">
              <button
                type="button"
                id={headerId}
                aria-expanded={open}
                aria-controls={open ? panelId : undefined}
                disabled={item.disabled}
                onClick={() => toggle(item.id)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-[13px] font-medium text-ink hover:bg-surface-2 disabled:text-faint disabled:hover:bg-surface"
              >
                <span>{item.title}</span>
                <span aria-hidden="true" className={cx('text-faint transition-transform', open && 'rotate-180')}>⌄</span>
              </button>
            </h3>
            {open && (
              <div id={panelId} role="region" aria-labelledby={headerId} className="px-3 pb-3 text-[13px] text-muted">
                {item.content}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
