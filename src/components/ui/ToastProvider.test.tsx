import { act, render, screen } from '@testing-library/react'
import { useContext } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ToastContext } from './ToastContext'
import { ToastProvider } from './ToastProvider'

function PushButton() {
  const push = useContext(ToastContext)
  return <button type="button" onClick={() => push('Saved')}>push</button>
}

describe('ToastProvider', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('shows a toast and dismisses it after 4000ms (spec §10)', () => {
    render(<ToastProvider><PushButton /></ToastProvider>)
    act(() => screen.getByText('push').click())
    expect(screen.getByText('Saved')).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(4000))
    expect(screen.queryByText('Saved')).not.toBeInTheDocument()
  })

  it('clears pending dismiss timers on unmount', () => {
    const { unmount } = render(<ToastProvider><PushButton /></ToastProvider>)
    act(() => screen.getByText('push').click())
    expect(vi.getTimerCount()).toBe(1)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
