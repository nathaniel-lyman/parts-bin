import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { ToastContext } from '../ui/ToastContext'
import { MessageActions } from './MessageActions'

afterEach(() => vi.unstubAllGlobals())

describe('MessageActions', () => {
  test('copy success writes the clipboard and toasts', async () => {
    // Order matters: userEvent.setup() installs its own clipboard stub on
    // window.navigator; stubGlobal AFTER setup so our spy wins.
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })
    const toast = vi.fn()
    render(
      <ToastContext.Provider value={toast}>
        <MessageActions content="the answer" />
      </ToastContext.Provider>,
    )
    await user.click(screen.getByRole('button', { name: 'Copy message' }))
    expect(writeText).toHaveBeenCalledWith('the answer')
    expect(toast).toHaveBeenCalledWith('Copied message')
  })

  test('clipboard rejection toasts a failure', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })
    const toast = vi.fn()
    render(
      <ToastContext.Provider value={toast}>
        <MessageActions content="the answer" />
      </ToastContext.Provider>,
    )
    await user.click(screen.getByRole('button', { name: 'Copy message' }))
    expect(toast).toHaveBeenCalledWith('Copy failed')
  })

  test('missing clipboard API toasts a failure', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('navigator', { ...navigator, clipboard: undefined })
    const toast = vi.fn()
    render(
      <ToastContext.Provider value={toast}>
        <MessageActions content="the answer" />
      </ToastContext.Provider>,
    )
    await user.click(screen.getByRole('button', { name: 'Copy message' }))
    expect(toast).toHaveBeenCalledWith('Copy failed')
  })

  test('feedback buttons report up and down', async () => {
    const user = userEvent.setup()
    const onFeedback = vi.fn()
    render(<MessageActions content="x" onFeedback={onFeedback} />)
    await user.click(screen.getByRole('button', { name: 'Good response' }))
    expect(onFeedback).toHaveBeenCalledWith('up')
    await user.click(screen.getByRole('button', { name: 'Bad response' }))
    expect(onFeedback).toHaveBeenCalledWith('down')
  })

  test('regenerate button renders only when onRegenerate is provided', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<MessageActions content="x" />)
    expect(screen.queryByRole('button', { name: 'Regenerate response' })).not.toBeInTheDocument()

    const onRegenerate = vi.fn()
    rerender(<MessageActions content="x" onRegenerate={onRegenerate} />)
    await user.click(screen.getByRole('button', { name: 'Regenerate response' }))
    expect(onRegenerate).toHaveBeenCalled()
  })
})
