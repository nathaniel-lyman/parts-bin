import { CodeBlock } from 'parts-bin'

export function TypeScript() {
  return (
    <div style={{ width: 440 }}>
      <CodeBlock
        language="ts"
        code={[
          'export const claudeAdapter: ChatAdapter = {',
          '  async *send(messages, { signal }) {',
          '    const stream = client.messages.stream(',
          '      { model: "claude-sonnet-4-6", max_tokens: 1024, messages },',
          '      { signal },',
          '    )',
          '    for await (const event of stream) {',
          '      if (event.type === "content_block_delta") {',
          '        yield event.delta.text',
          '      }',
          '    }',
          '  },',
          '}',
        ].join('\n')}
      />
    </div>
  )
}

export function Json() {
  return (
    <div style={{ width: 440 }}>
      <CodeBlock
        language="json"
        code={[
          '{',
          '  "account": "Northwind Traders",',
          '  "status": "Active",',
          '  "mrr": 12400,',
          '  "growth": 0.18,',
          '  "owner": "Priya Nair"',
          '}',
        ].join('\n')}
      />
    </div>
  )
}
