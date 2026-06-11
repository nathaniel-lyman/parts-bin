import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { ChatComposer } from './ChatComposer'

const noop = () => {}

describe('ChatComposer', () => {
  test('Enter sends the trimmed text and clears the input', async () => {
    const onSend = vi.fn()
    const user = userEvent.setup()
    render(<ChatComposer onSend={onSend} streaming={false} onStop={noop} />)
    const input = screen.getByRole('textbox', { name: 'Message the assistant' })
    await user.type(input, '  hello  {Enter}')
    expect(onSend).toHaveBeenCalledWith('hello')
    expect(input).toHaveValue('')
  })

  test('Shift+Enter inserts a newline instead of sending', async () => {
    const onSend = vi.fn()
    const user = userEvent.setup()
    render(<ChatComposer onSend={onSend} streaming={false} onStop={noop} />)
    const input = screen.getByRole('textbox', { name: 'Message the assistant' })
    await user.type(input, 'line1{Shift>}{Enter}{/Shift}line2')
    expect(onSend).not.toHaveBeenCalled()
    expect(input).toHaveValue('line1\nline2')
  })

  test('send button is disabled while the input is empty', () => {
    render(<ChatComposer onSend={noop} streaming={false} onStop={noop} />)
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()
  })

  test('streaming swaps send for stop and fires onStop', async () => {
    const onStop = vi.fn()
    const user = userEvent.setup()
    render(<ChatComposer onSend={noop} streaming onStop={onStop} />)
    expect(screen.queryByRole('button', { name: 'Send message' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Stop generating' }))
    expect(onStop).toHaveBeenCalled()
  })

  test('Enter while streaming does not send', async () => {
    const onSend = vi.fn()
    const user = userEvent.setup()
    render(<ChatComposer onSend={onSend} streaming onStop={noop} />)
    await user.type(screen.getByRole('textbox', { name: 'Message the assistant' }), 'queued{Enter}')
    expect(onSend).not.toHaveBeenCalled()
  })
})
