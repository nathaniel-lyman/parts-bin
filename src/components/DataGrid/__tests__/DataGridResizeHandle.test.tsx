import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DataGridResizeHandle } from '../DataGridResizeHandle'

describe('DataGridResizeHandle', () => {
  it('renders a separator with a column-scoped aria-label', () => {
    render(<DataGridResizeHandle columnId="mrr" header="MRR" currentWidth={120} onResize={() => {}} onAutofit={() => {}} />)
    expect(screen.getByRole('separator', { name: /resize mrr column/i })).toBeInTheDocument()
  })

  it('emits onResize with raw start+delta width while dragging', async () => {
    const onResize = vi.fn()
    render(<DataGridResizeHandle columnId="mrr" header="MRR" currentWidth={120} onResize={onResize} onAutofit={() => {}} />)
    const handle = screen.getByRole('separator', { name: /resize mrr column/i })
    fireEvent.pointerDown(handle, { clientX: 200, button: 0 })
    fireEvent.pointerMove(window, { clientX: 230 })
    // Pointermove resizing is rAF-throttled, so the dispatch lands on the next frame.
    await waitFor(() => expect(onResize).toHaveBeenLastCalledWith('mrr', 150))
    fireEvent.pointerUp(window)
  })

  it('flushes the final drag position on pointerup even if the frame has not fired', () => {
    const onResize = vi.fn()
    render(<DataGridResizeHandle columnId="mrr" header="MRR" currentWidth={120} onResize={onResize} onAutofit={() => {}} />)
    const handle = screen.getByRole('separator', { name: /resize mrr column/i })
    fireEvent.pointerDown(handle, { clientX: 200, button: 0 })
    fireEvent.pointerMove(window, { clientX: 280 })
    // Release immediately, before the rAF tick — the last position must still commit (120 + 80).
    fireEvent.pointerUp(window)
    expect(onResize).toHaveBeenLastCalledWith('mrr', 200)
  })

  it('locks the body cursor and text selection during a drag and restores them after', () => {
    render(<DataGridResizeHandle columnId="mrr" header="MRR" currentWidth={120} onResize={() => {}} onAutofit={() => {}} />)
    const handle = screen.getByRole('separator', { name: /resize mrr column/i })
    fireEvent.pointerDown(handle, { clientX: 200, button: 0 })
    expect(document.body.style.cursor).toBe('col-resize')
    expect(document.body.style.userSelect).toBe('none')
    fireEvent.pointerUp(window)
    expect(document.body.style.cursor).toBe('')
    expect(document.body.style.userSelect).toBe('')
  })

  it('double-click autofits the column to its content', () => {
    const onAutofit = vi.fn()
    render(<DataGridResizeHandle columnId="mrr" header="MRR" currentWidth={120} onResize={() => {}} onAutofit={onAutofit} />)
    fireEvent.doubleClick(screen.getByRole('separator', { name: /resize mrr column/i }))
    expect(onAutofit).toHaveBeenCalledWith('mrr')
  })

  it('Ctrl+Arrow keys resize from the keyboard', () => {
    const onResize = vi.fn()
    render(<DataGridResizeHandle columnId="mrr" header="MRR" currentWidth={120} onResize={onResize} onAutofit={() => {}} />)
    const handle = screen.getByRole('separator', { name: /resize mrr column/i })

    fireEvent.keyDown(handle, { key: 'ArrowRight', ctrlKey: true })
    expect(onResize).toHaveBeenLastCalledWith('mrr', 136)

    fireEvent.keyDown(handle, { key: 'ArrowLeft', ctrlKey: true })
    expect(onResize).toHaveBeenLastCalledWith('mrr', 104)
  })

  it('stops pointerdown from reaching the draggable header (no drag-on-resize)', () => {
    const onParentPointerDown = vi.fn()
    render(
      <div onPointerDown={onParentPointerDown}>
        <DataGridResizeHandle columnId="mrr" header="MRR" currentWidth={120} onResize={() => {}} onAutofit={() => {}} />
      </div>,
    )
    fireEvent.pointerDown(screen.getByRole('separator', { name: /resize mrr column/i }), { clientX: 100 })
    expect(onParentPointerDown).not.toHaveBeenCalled()
  })

  it('does not call onResize after pointerup ends the drag', () => {
    const onResize = vi.fn()
    render(<DataGridResizeHandle columnId="mrr" header="MRR" currentWidth={120} onResize={onResize} onAutofit={() => {}} />)
    const handle = screen.getByRole('separator', { name: /resize mrr column/i })
    fireEvent.pointerDown(handle, { clientX: 100, button: 0 })
    fireEvent.pointerUp(window)
    onResize.mockClear()
    fireEvent.pointerMove(window, { clientX: 300 })
    expect(onResize).not.toHaveBeenCalled()
  })
})
