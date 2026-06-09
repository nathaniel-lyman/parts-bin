import { render, fireEvent } from '@testing-library/react'
import { useRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useDialogFocusTrap } from './useDialogFocusTrap'

function Dialog({ label, onClose }: { label: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useDialogFocusTrap(ref, onClose)
  return (
    <div ref={ref} role="dialog" tabIndex={-1}>
      <button type="button">first</button>
      <button type="button">second</button>
      <span data-testid="label">{label}</span>
    </div>
  )
}

describe('useDialogFocusTrap', () => {
  it('moves focus to the first focusable element on open', () => {
    const { getByText } = render(<Dialog label="a" onClose={vi.fn()} />)
    expect(document.activeElement).toBe(getByText('first'))
  })

  it('does not steal focus back when the parent re-renders with an inline onClose', () => {
    // Inline arrow = new onClose identity every render, the common call-site shape.
    const { getByText, rerender } = render(<Dialog label="a" onClose={() => {}} />)
    getByText('second').focus()
    rerender(<Dialog label="b" onClose={() => {}} />)
    expect(document.activeElement).toBe(getByText('second'))
  })

  it('calls the latest onClose on Escape after re-renders', () => {
    const first = vi.fn()
    const second = vi.fn()
    const { rerender } = render(<Dialog label="a" onClose={first} />)
    rerender(<Dialog label="b" onClose={second} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })

  it('restores focus to the opener on close even after re-renders while open', () => {
    function Harness() {
      const [open, setOpen] = useState(false)
      const [tick, setTick] = useState(0)
      return (
        <div>
          <button type="button" onClick={() => setOpen(true)}>open</button>
          <button type="button" onClick={() => setTick((t) => t + 1)}>tick</button>
          {open && <Dialog label={String(tick)} onClose={() => setOpen(false)} />}
        </div>
      )
    }
    const { getByText } = render(<Harness />)
    const opener = getByText('open')
    opener.focus()
    fireEvent.click(opener)
    // Re-render while the dialog is open (inline onClose changes identity).
    fireEvent.click(getByText('tick'))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(document.activeElement).toBe(opener)
  })
})
