export type ChatRole = 'user' | 'assistant'
export type ChatMessageStatus = 'streaming' | 'done' | 'error'

export interface ChatMessageData {
  id: string
  role: ChatRole
  content: string
  status: ChatMessageStatus
}

/**
 * The transport seam. Implement this to go live: call any streaming LLM API
 * and yield text deltas. Must stop yielding promptly when `signal` aborts.
 * Everything in the chat UI (streaming cursor, stop, markdown, actions) is
 * adapter-agnostic.
 */
export interface ChatAdapter {
  send(messages: ChatMessageData[], opts: { signal: AbortSignal }): AsyncIterable<string>
}
