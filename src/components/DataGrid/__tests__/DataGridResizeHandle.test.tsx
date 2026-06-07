import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DataGridResizeHandle } from '../DataGridResizeHandle'

describe('DataGridResizeHandle', () => {
  it('renders a separator with a column-scoped aria-label', () => {
    render(<DataGridResizeHandle columnId="mrr" header="MRR" currentWidth={120} onResize={() => {}} onReset={() => {}} />)
    expect(screen.getByRole('separator', { name: /resize mrr column/i })).toBeInTheDocument()
  })

  it('emits onResize with raw start+delta width while dragging', () => {
    const onResize = vi.fn()
    render(<DataGridResizeHandle columnId="mrr" header="MRR" currentWidth={120} onResize={onResize} onReset={() => {}} />)
    const handle = screen.getByRole('separator', { name: /resize mrr column/i })
    fireEvent.mouseDown(handle, { clientX: 200 })
    fireEvent.mouseMove(window, { clientX: 230 })
    expect(onResize).toHaveBeenLastCalledWith('mrr', 150)
    fireEvent.mouseUp(window)
  })

  it('double-click resets the width', () => {
    const onReset = vi.fn()
    render(<DataGridResizeHandle columnId="mrr" header="MRR" currentWidth={120} onResize={() => {}} onReset={onReset} />)
    fireEvent.doubleClick(screen.getByRole('separator', { name: /resize mrr column/i }))
    expect(onReset).toHaveBeenCalledWith('mrr')
  })

  it('Ctrl+Arrow keys resize from the keyboard', () => {
    const onResize = vi.fn()
    render(<DataGridResizeHandle columnId="mrr" header="MRR" currentWidth={120} onResize={onResize} onReset={() => {}} />)
    const handle = screen.getByRole('separator', { name: /resize mrr column/i })

    fireEvent.keyDown(handle, { key: 'ArrowRight', ctrlKey: true })
    expect(onResize).toHaveBeenLastCalledWith('mrr', 136)

    fireEvent.keyDown(handle, { key: 'ArrowLeft', ctrlKey: true })
    expect(onResize).toHaveBeenLastCalledWith('mrr', 104)
  })

  it('does not call onResize after mouseup ends the drag', () => {
    const onResize = vi.fn()
    render(<DataGridResizeHandle columnId="mrr" header="MRR" currentWidth={120} onResize={onResize} onReset={() => {}} />)
    const handle = screen.getByRole('separator', { name: /resize mrr column/i })
    fireEvent.mouseDown(handle, { clientX: 100 })
    fireEvent.mouseUp(window)
    onResize.mockClear()
    fireEvent.mouseMove(window, { clientX: 300 })
    expect(onResize).not.toHaveBeenCalled()
  })
})
