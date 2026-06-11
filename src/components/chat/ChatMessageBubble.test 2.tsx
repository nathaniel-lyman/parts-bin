import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { ChatMessageBubble } from './ChatMessageBubble'
import type { ChatMessageData } from './types'

const msg = (over: Partial<ChatMessageData>): ChatMessageData => ({
  id: 'm1', role: 'assistant', content: 'hello', status: 'done', ...over,
})

describe('ChatMessageBubble', () => {
  test('user content renders as plain text, never markdown', () => {
    render(<ChatMessageBubble message={msg({ role: 'user', content: '**not bold**' })} />)
    expect(screen.getByText('**not bold**')).toBeInTheDocument()
  })

  test('assistant content renders markdown', () => {
    render(<ChatMessageBubble message={msg({ content: '**bold**' })} />)
    expect(screen.getByText('bold').tagName).toBe('STRONG')
  })

  test('empty streaming message shows the typing indicator', () => {
    render(<ChatMessageBubble message={msg({ content: '', status: 'streaming' })} />)
    // LoadingDots exposes the label via aria-label on a role="status" div, not as text.
    expect(screen.getByRole('status', { name: 'Assistant is thinking' })).toBeInTheDocument()
  })

  test('error status shows the failure note', () => {
    render(<ChatMessageBubble message={msg({ status: 'error' })} />)
    expect(screen.getByText(/went wrong/i)).toBeInTheDocument()
  })

  test('actions render only when provided', () => {
    render(<ChatMessageBubble message={msg({})} actions={<button>Retry</button>} />)
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })
})
