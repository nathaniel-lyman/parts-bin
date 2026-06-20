import { Drawer } from '../ui/Drawer'
import { EmptyState } from '../ui/EmptyState'
import { Button } from '../ui/Button'
import { useToast } from '../ui/ToastContext'
import { useChat, type ChatController } from './useChat'
import { ChatMessageList } from './ChatMessageList'
import { ChatMessageBubble } from './ChatMessageBubble'
import { MessageActions } from './MessageActions'
import { ChatComposer } from './ChatComposer'
import { SuggestedPrompts } from './SuggestedPrompts'
import type { ChatAdapter } from './types'

export interface AssistantPanelProps {
  adapter: ChatAdapter
  onClose: () => void
  title?: string
  suggestions?: string[]
  chat?: ChatController
}

/**
 * Slide-over AI chat composed from the chat primitives. Conditionally render
 * it like Drawer/Modal: `{open && <AssistantPanel … />}`. Pass a lifted
 * `chat={useChat(adapter)}` controller when close/reopen should preserve the
 * conversation.
 */
export function AssistantPanel({ adapter, onClose, title = 'Assistant', suggestions = [], chat }: AssistantPanelProps) {
  const internalChat = useChat(adapter)
  const { messages, status, send, stop, regenerate } = chat ?? internalChat
  const toast = useToast()

  return (
    <Drawer title={title} onClose={onClose} bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden">
      {messages.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-4 overflow-y-auto px-4 py-6">
          <EmptyState
            glyph="✳"
            title="Ask about this screen"
            description="The assistant reads the active screen, selected rows, filters, saved views, and route context."
          />
          {suggestions.length > 0 && <SuggestedPrompts prompts={suggestions} onSelect={send} />}
        </div>
      ) : (
        <ChatMessageList className="px-4 py-4">
          {messages.map((message, index) => {
            const isLast = index === messages.length - 1
            const actions =
              message.role !== 'assistant' ? undefined
              : message.status === 'done' ? (
                <MessageActions
                  content={message.content}
                  onRegenerate={isLast ? regenerate : undefined}
                  onFeedback={() => toast('Thanks for the feedback')}
                />
              ) : message.status === 'error' && isLast ? (
                // isLast gate: regenerate() pops the LATEST assistant turn and
                // re-streams the LATEST user question — a Retry on a non-last
                // errored message would destroy the newer answer instead.
                <div className="mt-1">
                  <Button size="compact" variant="secondary" onClick={regenerate}>Retry</Button>
                </div>
              ) : undefined
            return <ChatMessageBubble key={message.id} message={message} actions={actions} />
          })}
        </ChatMessageList>
      )}
      <ChatComposer onSend={send} streaming={status === 'streaming'} onStop={stop} autoFocus />
    </Drawer>
  )
}
