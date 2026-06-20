import { Accordion } from 'parts-bin'

export function Settings() {
  return (
    <div style={{ width: 420 }}>
      <Accordion
        defaultOpenIds={['general']}
        items={[
          { id: 'general', title: 'General', content: 'Workspace name, locale, and default currency.' },
          { id: 'billing', title: 'Billing', content: 'Plan, payment method, and invoice history.' },
          { id: 'security', title: 'Security', content: 'SSO, session policy, and audit log retention.' },
        ]}
      />
    </div>
  )
}

export function MultipleOpen() {
  return (
    <div style={{ width: 420 }}>
      <Accordion
        multiple
        defaultOpenIds={['shipping', 'returns']}
        items={[
          { id: 'shipping', title: 'How fast is delivery?', content: 'Orders ship within 2 business days; Enterprise plans get priority dispatch.' },
          { id: 'returns', title: 'What is the return window?', content: '30 days from delivery for a full refund, no questions asked.' },
          { id: 'support', title: 'Is support included?', content: 'All paid plans include email support; Pro and above add a shared Slack channel.', disabled: true },
        ]}
      />
    </div>
  )
}
