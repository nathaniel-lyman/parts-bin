import { useState, type ReactNode } from 'react'
import type { Account, Segment, Status } from '../data/types'
import type { NewAccount } from '../hooks/useAccounts'
import { Modal } from './ui/Modal'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Button } from './ui/Button'

const SEGMENTS: Segment[] = ['Enterprise', 'Mid-market', 'Startup']
const STATUSES: Status[] = ['Active', 'At risk', 'Churned']

interface Props {
  account?: Account
  onClose: () => void
  onSubmit: (data: NewAccount) => void
  onInvalid?: (message: string) => void
}

// Numeric fields are kept as strings while editing (matching the prototype) so the user can
// clear them, type a leading '-', or a partial value without React coercing NaN back into the
// input. They are coerced to numbers only on submit.
interface FormState {
  name: string
  owner: string
  segment: Segment
  mrr: string
  growth: string
  status: Status
}

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block"><span className="micro mb-1 block">{label}</span>{children}</label>
)

const today = () => new Date().toISOString().slice(0, 10)

export function AccountFormModal({ account, onClose, onSubmit, onInvalid }: Props) {
  const [form, setForm] = useState<FormState>(() =>
    account
      ? { name: account.name, owner: account.owner, segment: account.segment, mrr: String(account.mrr), growth: String(account.growth), status: account.status }
      : { name: '', owner: '', segment: 'Mid-market', mrr: '', growth: '', status: 'Active' },
  )
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }))

  const submit = () => {
    const name = form.name.trim()
    if (!name) { onInvalid?.('Name is required'); return }
    const mrr = +form.mrr || 0
    const growth = +form.growth || 0
    onSubmit({
      name,
      owner: form.owner,
      segment: form.segment,
      status: form.status,
      mrr,
      growth,
      arr: mrr * 12,
      since: account ? account.since : today(),
    })
  }

  return (
    <Modal
      title={account ? 'Edit account' : 'New account'}
      onClose={onClose}
      footer={<>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={submit}>{account ? 'Save changes' : 'Create account'}</Button>
      </>}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><Field label="Account name"><Input autoFocus value={form.name} onChange={(e) => set('name', e.target.value)} /></Field></div>
        <Field label="Owner"><Input value={form.owner} onChange={(e) => set('owner', e.target.value)} /></Field>
        <Field label="Segment"><Select value={form.segment} onChange={(e) => set('segment', e.target.value as Segment)}>{SEGMENTS.map((s) => <option key={s}>{s}</option>)}</Select></Field>
        <Field label="Value ($)"><Input type="number" value={form.mrr} onChange={(e) => set('mrr', e.target.value)} /></Field>
        <Field label="Growth (%)"><Input type="number" step="0.1" value={form.growth} onChange={(e) => set('growth', e.target.value)} /></Field>
        <div className="col-span-2"><Field label="Status"><Select value={form.status} onChange={(e) => set('status', e.target.value as Status)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</Select></Field></div>
      </div>
    </Modal>
  )
}
