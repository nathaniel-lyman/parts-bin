import { Modal, Button } from 'parts-bin'

export function EditAccount() {
  return (
    <Modal
      title="Edit account"
      onClose={() => {}}
      footer={
        <>
          <Button variant="ghost" onClick={() => {}}>Cancel</Button>
          <Button variant="primary" onClick={() => {}}>Save changes</Button>
        </>
      }
    >
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gap: 4 }}>
          <span className="micro">Account name</span>
          <div className="text-[13px] text-ink">Northwind Logistics</div>
        </div>
        <div style={{ display: 'grid', gap: 4 }}>
          <span className="micro">Plan</span>
          <div className="text-[13px] text-ink">Pro — $1,840 / mo</div>
        </div>
        <p className="text-[13px] text-muted">
          Changes to the plan take effect on the next billing cycle (Jul 1).
        </p>
      </div>
    </Modal>
  )
}
