import { Sidebar } from 'parts-bin'

// Sidebar (LeftNavigationDrawer) is hidden below the lg breakpoint, so the
// wrapper must be >=1024px wide for it to render. The sidebar itself is w-56.
export function Primary() {
  return (
    <div style={{ width: 1040, height: 460, display: 'flex', border: '1px solid var(--line)' }}>
      <Sidebar
        brand="parts-bin"
        items={[
          { label: 'Dashboard', href: '/dashboard', active: true },
          { label: 'Accounts', href: '/accounts', meta: '128' },
          { label: 'Reports', href: '/reports' },
          { label: 'Renewals', href: '/renewals', meta: '6' },
          { label: 'Settings', href: '/settings' },
        ]}
        footer={<span className="num text-[12px] text-muted">Demo workspace · v1.0</span>}
      />
      <div style={{ flex: 1, padding: 24, color: 'var(--muted)', fontSize: 13 }}>
        <div className="display" style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
          Dashboard
        </div>
        Page content sits to the right of the nav drawer.
      </div>
    </div>
  )
}
