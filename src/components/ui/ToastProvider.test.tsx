import { act, render, screen } from '@testing-library/react'
import { useContext } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ToastContext, type ToastOptions } from './ToastContext'
import { ToastProvider } from './ToastProvider'

function PushButton({ options, text = 'Saved' }: { options?: ToastOptions; text?: string }) {
  const push = useContext(ToastContext)
  return <button type="button" onClick={() => push(text, options)}>push</button>
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

  it('renders a title and an action button; the action runs and dismisses', () => {
    const onClick = vi.fn()
    render(
      <ToastProvider>
        <PushButton text="Account deleted" options={{ tone: 'neg', title: 'Deleted', action: { label: 'Undo', onClick } }} />
      </ToastProvider>,
    )
    act(() => screen.getByText('push').click())
    expect(screen.getByText('Deleted')).toBeInTheDocument()
    expect(screen.getByText('Account deleted')).toBeInTheDocument()

    act(() => screen.getByRole('button', { name: 'Undo' }).click())
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('Account deleted')).not.toBeInTheDocument()
    // its auto-dismiss timer is cancelled, not left running
    expect(vi.getTimerCount()).toBe(0)
  })

  it('dismiss button removes the toast and cancels its timer', () => {
    render(<ToastProvider><PushButton /></ToastProvider>)
    act(() => screen.getByText('push').click())
    act(() => screen.getByRole('button', { name: 'Dismiss notification' }).click())
    expect(screen.queryByText('Saved')).not.toBeInTheDocument()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('duration overrides the 4000ms default', () => {
    render(<ToastProvider><PushButton options={{ duration: 1000 }} /></ToastProvider>)
    act(() => screen.getByText('push').click())
    act(() => vi.advanceTimersByTime(1000))
    expect(screen.queryByText('Saved')).not.toBeInTheDocument()
  })

  it('still accepts the legacy (text, tone) signature', () => {
    function LegacyPush() {
      const push = useContext(ToastContext)
      return <button type="button" onClick={() => push('Legacy', 'warn')}>legacy</button>
    }
    const { container } = render(<ToastProvider><LegacyPush /></ToastProvider>)
    act(() => screen.getByText('legacy').click())
    expect(screen.getByText('Legacy')).toBeInTheDocument()
    expect(container.querySelector('.border-l-warn')).not.toBeNull()
  })
})
