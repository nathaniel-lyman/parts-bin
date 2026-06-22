import type { ReactNode } from 'react'
import { Avatar } from '../ui/Avatar'
import { ChatMarkdown } from './ChatMarkdown'
import { TypingIndicator } from './TypingIndicator'
import type { ChatMessageData } from './types'

export interface ChatMessageBubbleProps {
  message: ChatMessageData
  /** Rendered under assistant content — MessageActions, a retry button, etc. */
  actions?: ReactNode
}

export function ChatMessageBubble({ message, actions }: ChatMessageBubbleProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-sm bg-accent-soft px-3 py-2 text-[14px] text-ink">
          {message.content}
        </div>
      </div>
    )
  }

  const thinking = message.status === 'streaming' && !message.content
  return (
    <div className="flex gap-2">
      <Avatar name="Assistant" initials="AI" size="sm" className="mt-0.5" />
      <div className="min-w-0 flex-1">
        {thinking ? <TypingIndicator /> : <ChatMarkdown content={message.content} />}
        {/* Streaming cursor renders below the markdown block — known visual compromise; inlining through react-markdown isn't worth the complexity. */}
        {message.status === 'streaming' && message.content !== '' && (
          <span className="mt-1 inline-block h-3.5 w-1.5 animate-pulse bg-accent" aria-hidden="true" />
        )}
        {message.status === 'error' && (
          <p className="micro m-0 mt-1 text-neg">Something went wrong generating this answer.</p>
        )}
        {message.status !== 'streaming' && actions}
      </div>
    </div>
  )
}
