import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { useChat } from './useChat'
import type { ChatAdapter, ChatMessageData } from './types'

/** Adapter that yields fixed tokens; records each send()'s history. */
function scriptedAdapter(tokens: string[], opts?: { throwAfter?: number }) {
  const calls: ChatMessageData[][] = []
  const adapter: ChatAdapter = {
    async *send(messages, { signal }) {
      calls.push(messages)
      let yielded = 0
      for (const t of tokens) {
        if (signal.aborted) return
        if (opts?.throwAfter !== undefined && yielded >= opts.throwAfter) throw new Error('boom')
        yielded += 1
        yield t
      }
    },
  }
  return { adapter, calls }
}

/** Adapter that yields one token, then blocks until release() — lets tests act mid-stream. */
function gatedAdapter() {
  let release!: () => void
  const gate = new Promise<void>((resolve) => { release = resolve })
  const adapter: ChatAdapter = {
    async *send(_messages, { signal }) {
      yield 'partial '
      await gate
      if (signal.aborted) return
      yield 'rest'
    },
  }
  return { adapter, release: () => release() }
}

describe('useChat', () => {
  test('send appends user message and streams assistant tokens to done', async () => {
    const { adapter } = scriptedAdapter(['Hello', ' world'])
    const { result } = renderHook(() => useChat(adapter))

    act(() => result.current.send('  hi there  '))
    await waitFor(() => expect(result.current.status).toBe('idle'))

    expect(result.current.messages).toHaveLength(2)
    const [user, assistant] = result.current.messages
    expect(user).toMatchObject({ role: 'user', content: 'hi there', status: 'done' })
    expect(assistant).toMatchObject({ role: 'assistant', content: 'Hello world', status: 'done' })
  })

  test('empty or whitespace send is a no-op', () => {
    const { adapter, calls } = scriptedAdapter(['x'])
    const { result } = renderHook(() => useChat(adapter))
    act(() => result.current.send('   '))
    expect(result.current.messages).toEqual([])
    expect(calls).toHaveLength(0)
  })

  test('send while streaming is a no-op', async () => {
    const { adapter, release } = gatedAdapter()
    const { result } = renderHook(() => useChat(adapter))

    act(() => result.current.send('first'))
    await waitFor(() => expect(result.current.status).toBe('streaming'))
    act(() => result.current.send('second'))
    expect(result.current.messages.filter((m) => m.role === 'user')).toHaveLength(1)

    act(() => release())
    await waitFor(() => expect(result.current.status).toBe('idle'))
  })

  test('stop keeps partial text and marks the message done, not error', async () => {
    const { adapter, release } = gatedAdapter()
    const { result } = renderHook(() => useChat(adapter))

    act(() => result.current.send('q'))
    await waitFor(() => expect(result.current.messages[1]?.content).toBe('partial '))
    act(() => result.current.stop())
    act(() => release())
    await waitFor(() => expect(result.current.status).toBe('idle'))

    const assistant = result.current.messages[1]
    expect(assistant.content).toBe('partial ')
    expect(assistant.status).toBe('done')
  })

  test('adapter throw marks the message error and keeps partial text', async () => {
    const { adapter } = scriptedAdapter(['some ', 'text'], { throwAfter: 1 })
    const { result } = renderHook(() => useChat(adapter))

    act(() => result.current.send('q'))
    await waitFor(() => expect(result.current.status).toBe('idle'))

    const assistant = result.current.messages[1]
    expect(assistant.status).toBe('error')
    expect(assistant.content).toBe('some ')
  })

  test('regenerate drops the assistant turn and re-streams from the same user message', async () => {
    const { adapter, calls } = scriptedAdapter(['answer'])
    const { result } = renderHook(() => useChat(adapter))

    act(() => result.current.send('q'))
    await waitFor(() => expect(result.current.status).toBe('idle'))
    act(() => result.current.regenerate())
    await waitFor(() => expect(result.current.status).toBe('idle'))

    expect(calls).toHaveLength(2)
    // Both sends got the same history: just the user message.
    expect(calls[1].map((m) => m.role)).toEqual(['user'])
    expect(result.current.messages).toHaveLength(2)
    expect(result.current.messages[1].status).toBe('done')
  })

  test('regenerate with no history is a no-op', () => {
    const { adapter, calls } = scriptedAdapter(['x'])
    const { result } = renderHook(() => useChat(adapter))
    act(() => result.current.regenerate())
    expect(calls).toHaveLength(0)
  })
})
