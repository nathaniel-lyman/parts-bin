import type { ReactNode } from 'react'

interface Props {
  side: 'left' | 'center' | 'right'
  children: ReactNode
}

export function DataGridPinnedSection({ side, children }: Props) {
  const sticky =
    side === 'left'
      ? 'sticky left-0 z-10 shadow-pinned bg-surface'
      : side === 'right'
        ? 'sticky right-0 z-10 shadow-pinned bg-surface'
        : ''

  return (
    <td data-pinned={side} className={`p-0 ${sticky}`}>
      <div className="contents">{children}</div>
    </td>
  )
}

