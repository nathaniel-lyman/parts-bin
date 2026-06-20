import { TopNav, Button, IconButton } from 'parts-bin'

// TopNav is the sticky top bar: breadcrumbs + title on the left, actions right.
export function WithActions() {
  return (
    <div style={{ width: 900, border: '1px solid var(--line)' }}>
      <TopNav
        breadcrumbs={[
          { label: 'parts-bin', href: '/' },
          { label: 'Accounts', href: '/accounts' },
          { label: 'Cobalt Freight' },
        ]}
        title="Cobalt Freight"
        actions={
          <>
            <Button variant="secondary" size="compact">Filter</Button>
            <Button variant="primary" size="compact">New account</Button>
            <IconButton aria-label="Notifications">{'☆'}</IconButton>
          </>
        }
      />
    </div>
  )
}

export function TitleOnly() {
  return (
    <div style={{ width: 720, border: '1px solid var(--line)' }}>
      <TopNav
        title="Revenue overview"
        actions={<Button variant="primary" size="compact">Export</Button>}
      />
    </div>
  )
}
