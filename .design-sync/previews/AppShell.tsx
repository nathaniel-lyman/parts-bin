import { AppShell, Sidebar, TopNav, KpiCard, Button } from 'parts-bin'

// AppShell is the flagship dashboard frame: sidebar + topnav + content.
// The sidebar (LeftNavigationDrawer) only renders at >=1024px, so the
// wrapper must be wide. We give it a realistic account/MRR dashboard body.
export function Dashboard() {
  const sidebar = (
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
  )
  const topNav = (
    <TopNav
      breadcrumbs={[
        { label: 'parts-bin', href: '/' },
        { label: 'Dashboard' },
      ]}
      title="Revenue overview"
      actions={
        <>
          <Button variant="secondary" size="compact">Export</Button>
          <Button variant="primary" size="compact">New account</Button>
        </>
      }
    />
  )
  return (
    <div style={{ width: 1040, height: 600, overflow: 'hidden', border: '1px solid var(--line)' }}>
      <AppShell sidebar={sidebar} topNav={topNav}>
        <div style={{ padding: 20, display: 'grid', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <KpiCard label="Total MRR" value="$248.4k" delta={4.2} spark={[180, 190, 205, 212, 224, 233, 248]} />
            <KpiCard label="Active accounts" value="112" delta={1.8} spark={[101, 104, 106, 108, 109, 110, 112]} />
            <KpiCard label="At risk" value="9" delta={-2.1} negSpark spark={[14, 13, 12, 11, 11, 10, 9]} />
            <KpiCard label="Avg growth" value="6.4%" delta={0.6} spark={[4.1, 4.8, 5.2, 5.6, 5.9, 6.1, 6.4]} />
          </div>
          <div style={{ border: '1px solid var(--line)', borderRadius: 4, padding: 16, background: 'var(--surface)' }}>
            <div className="display" style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Accounts by segment</div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
              Enterprise expansions drove a 4.2% lift in MRR this quarter across 112 active accounts.
            </p>
          </div>
        </div>
      </AppShell>
    </div>
  )
}
