import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DataGridContextMenu } from '../DataGridContextMenu'

function setup(extra: Partial<React.ComponentProps<typeof DataGridContextMenu>> = {}) {
  const onCopyCell = vi.fn()
  const onCopyRow = vi.fn()
  const onCopySelection = vi.fn()
  const onClose = vi.fn()
  render(
    <DataGridContextMenu
      x={120}
      y={80}
      onCopyCell={onCopyCell}
      onCopyRow={onCopyRow}
      onCopySelection={onCopySelection}
      onClose={onClose}
      {...extra}
    />,
  )
  return { onCopyCell, onCopyRow, onCopySelection, onClose }
}

describe('DataGridContextMenu', () => {
  it('renders copy-cell and copy-row items', () => {
    setup()
    expect(screen.getByRole('menuitem', { name: /copy cell/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /copy row/i })).toBeInTheDocument()
  })

  it('runs actions then closes', async () => {
    const { onCopyCell, onClose } = setup()
    await userEvent.click(screen.getByRole('menuitem', { name: /copy cell/i }))
    expect(onCopyCell).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes on Escape and backdrop click', async () => {
    const { onClose } = setup()
    await userEvent.keyboard('{Escape}')
    await userEvent.click(screen.getByTestId('contextmenu-backdrop'))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('shows copy selection only when a selection is active', () => {
    const { rerender } = render(
      <DataGridContextMenu x={0} y={0} onCopyCell={vi.fn()} onCopyRow={vi.fn()} onClose={vi.fn()} />,
    )
    expect(screen.queryByRole('menuitem', { name: /copy selection/i })).toBeNull()
    rerender(
      <DataGridContextMenu
        x={0}
        y={0}
        selectionCount={2}
        onCopyCell={vi.fn()}
        onCopyRow={vi.fn()}
        onCopySelection={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByRole('menuitem', { name: /copy selection \(2\)/i })).toBeInTheDocument()
  })
})
