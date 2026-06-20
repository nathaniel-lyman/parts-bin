import { ChatMarkdown } from 'parts-bin'

export function AssistantAnswer() {
  return (
    <div
      style={{
        width: 440,
        padding: 16,
        borderRadius: 2,
        border: '1px solid var(--line)',
        background: 'var(--surface)',
      }}
    >
      <ChatMarkdown
        content={[
          "Here's where **active MRR** stands for the current row scope:",
          '',
          '- **Enterprise** — $128.4K (62% share)',
          '- **Mid-market** — $54.1K (26% share)',
          '- **SMB** — $24.8K (12% share)',
          '',
          'Totals exclude `Churned` accounts, matching the KPI cards above. To change the scope, adjust the grid filters and ask again.',
        ].join('\n')}
      />
    </div>
  )
}

export function WithTableAndQuote() {
  return (
    <div
      style={{
        width: 440,
        padding: 16,
        borderRadius: 2,
        border: '1px solid var(--line)',
        background: 'var(--surface)',
      }}
    >
      <ChatMarkdown
        content={[
          '### Renewal risk this quarter',
          '',
          '| Account | Status | MRR |',
          '| --- | --- | --- |',
          '| Initech | At risk | $4,200 |',
          '| Globex Corp | At risk | $7,800 |',
          '',
          '> Both renew within 30 days — prioritize the executive check-ins.',
        ].join('\n')}
      />
    </div>
  )
}
