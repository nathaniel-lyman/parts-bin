import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import { useDialogFocusTrap } from './useDialogFocusTrap'
import { cx } from './utils'

export interface CommandPaletteItem {
  id: string
  label: ReactNode
  description?: ReactNode
  shortcut?: ReactNode
  disabled?: boolean
  keywords?: string[]
  onSelect?: () => void
}

export interface CommandPaletteGroup {
  id: string
  label: ReactNode
  items: CommandPaletteItem[]
}

export interface CommandPaletteProps {
  groups: CommandPaletteGroup[]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: ReactNode
  placeholder?: string
  emptyMessage?: ReactNode
  label?: string
  shortcutLabel?: ReactNode
  className?: string
}

interface CommandMatch {
  group: CommandPaletteGroup
  item: CommandPaletteItem
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
}

// useDialogFocusTrap engages once per mount, so it must live in a component
// that mounts with the dialog — CommandPalette itself stays mounted while closed.
function PaletteFocusTrap({ dialogRef, onClose }: { dialogRef: RefObject<HTMLDivElement | null>; onClose: () => void }) {
  useDialogFocusTrap(dialogRef, onClose)
  return null
}

function getSearchText(item: CommandPaletteItem) {
  return [
    typeof item.label === 'string' ? item.label : '',
    typeof item.description === 'string' ? item.description : '',
    ...(item.keywords ?? []),
  ].join(' ').toLowerCase()
}

export function CommandPalette({
  groups,
  open,
  defaultOpen = false,
  onOpenChange,
  trigger = 'Command',
  placeholder = 'Search commands',
  emptyMessage = 'No commands found',
  label = 'Command palette',
  shortcutLabel = 'Ctrl K',
  className,
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const dialogId = useId()
  const titleId = `${dialogId}-title`
  const inputId = `${dialogId}-input`
  const listboxId = `${dialogId}-listbox`
  const dialogRef = useRef<HTMLDivElement>(null)

  const isOpen = open ?? internalOpen
  const setPaletteOpen = useCallback((next: boolean) => {
    setInternalOpen(next)
    onOpenChange?.(next)
    if (!next) {
      setQuery('')
      setActiveIndex(0)
    }
  }, [onOpenChange])

  const matches = useMemo<CommandMatch[]>(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const all = groups.flatMap((group) => group.items.map((item) => ({ group, item })))
    if (normalizedQuery === '') return all
    return all.filter(({ item }) => getSearchText(item).includes(normalizedQuery))
  }, [groups, query])

  const enabledMatches = matches
    .map((match, index) => ({ match, index }))
    .filter(({ match }) => !match.item.disabled)
  const clampedActiveIndex = activeIndex < matches.length ? activeIndex : 0
  const activeId = isOpen && matches[clampedActiveIndex] ? `${listboxId}-option-${clampedActiveIndex}` : undefined

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && !isEditableTarget(event.target)) {
        event.preventDefault()
        setPaletteOpen(!isOpen)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, setPaletteOpen])

  // PaletteFocusTrap (mounted with the dialog below) moves focus to the first
  // focusable element on open — the search input — so no focus effect is needed here.
  const closePalette = useCallback(() => setPaletteOpen(false), [setPaletteOpen])

  const moveActive = (direction: 1 | -1) => {
    if (enabledMatches.length === 0) return
    const enabledIndex = enabledMatches.findIndex(({ index }) => index === clampedActiveIndex)
    const nextEnabledIndex = enabledIndex === -1
      ? 0
      : (enabledIndex + direction + enabledMatches.length) % enabledMatches.length
    setActiveIndex(enabledMatches[nextEnabledIndex].index)
  }

  const runCommand = (match: CommandMatch | undefined) => {
    if (!match || match.item.disabled) return
    match.item.onSelect?.()
    setPaletteOpen(false)
  }

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveActive(1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveActive(-1)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      runCommand(matches[clampedActiveIndex])
    }
  }

  return (
    <>
      {trigger && (
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={isOpen ? dialogId : undefined}
          onClick={() => setPaletteOpen(true)}
          className="inline-flex h-8 items-center justify-center gap-2 rounded-[2px] border border-line bg-surface px-3 text-[13px] font-medium text-ink hover:bg-surface-2"
        >
          <span>{trigger}</span>
          {shortcutLabel && <span className="num text-[11px] text-muted">{shortcutLabel}</span>}
        </button>
      )}
      {isOpen && (
        <div className="scrim-backdrop fixed inset-0 z-50 grid place-items-start px-4 pt-[12vh]" onClick={() => setPaletteOpen(false)}>
          <PaletteFocusTrap dialogRef={dialogRef} onClose={closePalette} />
          <div
            ref={dialogRef}
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className={cx(
              'mx-auto grid w-[640px] max-w-full overflow-hidden rounded-[4px] border border-line bg-surface shadow-modal',
              className,
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-line px-3 py-2">
              <h2 id={titleId} className="sr-only">{label}</h2>
              <input
                id={inputId}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls={listboxId}
                aria-activedescendant={activeId}
                aria-label={placeholder}
                value={query}
                placeholder={placeholder}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setActiveIndex(0)
                }}
                onKeyDown={onInputKeyDown}
                className="h-10 w-full border-0 bg-surface px-1 text-[15px] text-ink outline-none placeholder:text-faint"
              />
            </div>
            <div id={listboxId} role="listbox" className="max-h-[420px] overflow-y-auto p-2">
              {matches.length === 0 ? (
                <div className="px-3 py-8 text-center text-[13px] text-muted">{emptyMessage}</div>
              ) : (
                groups.map((group) => {
                  const groupMatches = matches
                    .map((match, index) => ({ match, index }))
                    .filter(({ match }) => match.group.id === group.id)
                  if (groupMatches.length === 0) return null
                  return (
                    <section key={group.id} aria-label={typeof group.label === 'string' ? group.label : undefined} className="grid gap-1 py-1">
                      <div className="micro px-2 py-1">{group.label}</div>
                      {groupMatches.map(({ match, index }) => {
                        const active = index === clampedActiveIndex
                        return (
                          // Plain element, not a <button>: role=listbox may only own
                          // non-interactive options — focus stays on the combobox input
                          // and the active option is tracked via aria-activedescendant.
                          <div
                            key={match.item.id}
                            id={`${listboxId}-option-${index}`}
                            role="option"
                            aria-selected={active}
                            aria-disabled={match.item.disabled || undefined}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => runCommand(match)}
                            onMouseEnter={() => !match.item.disabled && setActiveIndex(index)}
                            className={cx(
                              'grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-[2px] px-2 py-2 text-left text-[13px] text-ink hover:bg-surface-2',
                              active && 'bg-accent-soft text-accent',
                              match.item.disabled && 'cursor-default text-faint',
                            )}
                          >
                            <span className="grid min-w-0 gap-0.5">
                              <span className="truncate font-medium">{match.item.label}</span>
                              {match.item.description && <span className="truncate text-[12px] text-muted">{match.item.description}</span>}
                            </span>
                            {match.item.shortcut && <span className="num self-center text-[11px] text-muted">{match.item.shortcut}</span>}
                          </div>
                        )
                      })}
                    </section>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
