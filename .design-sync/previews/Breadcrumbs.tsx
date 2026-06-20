import { Breadcrumbs } from 'parts-bin'

// Breadcrumbs: a path of links, last item (no href) is the current page.
export function Path() {
  return (
    <div style={{ width: 480, padding: 12 }}>
      <Breadcrumbs
        items={[
          { label: 'Accounts', href: '/accounts' },
          { label: 'Cobalt Freight', href: '/accounts/cobalt-freight' },
          { label: 'Overview' },
        ]}
      />
    </div>
  )
}

export function TwoLevel() {
  return (
    <div style={{ width: 480, padding: 12 }}>
      <Breadcrumbs
        items={[
          { label: 'Reports', href: '/reports' },
          { label: 'MRR by segment' },
        ]}
      />
    </div>
  )
}
