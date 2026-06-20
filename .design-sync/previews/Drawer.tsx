import { Drawer, Button } from 'parts-bin'

export function AccountDetail() {
  return (
    <Drawer
      title="Northwind Logistics"
      onClose={() => {}}
      footer={
        <>
          <Button variant="ghost" onClick={() => {}}>Close</Button>
          <Button variant="primary" onClick={() => {}}>Open account</Button>
        </>
      }
    >
      <div style={{ display: 'grid', gap: 14 }}>
        <div style={{ display: 'grid', gap: 4 }}>
          <span className="micro">Monthly recurring revenue</span>
          <div className="num text-[22px] font-semibold text-ink">$1,840</div>
        </div>
        <div style={{ display: 'grid', gap: 4 }}>
          <span className="micro">Status</span>
          <div className="text-[13px] text-pos">Active</div>
        </div>
        <div style={{ display: 'grid', gap: 4 }}>
          <span className="micro">Segment</span>
          <div className="text-[13px] text-ink">Mid-Market</div>
        </div>
        <div style={{ display: 'grid', gap: 4 }}>
          <span className="micro">Owner</span>
          <div className="text-[13px] text-ink">Dana Reyes</div>
        </div>
      </div>
    </Drawer>
  )
}
