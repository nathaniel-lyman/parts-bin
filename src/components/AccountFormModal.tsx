import { useState, type ReactNode } from 'react'
import type { Account, Segment, Status } from '../data/types'
import type { NewAccount } from '../hooks/useAccounts'
import { Modal } from './ui/Modal'
import { Input } from './ui/Input'
import { Select } from './ui/Select'
import { Button } from './ui/Button'

const SEGMENTS: Segment[] = ['Enterprise', 'Mid-market', 'Startup']
const STATUSES: Status[] = ['Active', 'At risk', 'Churned']

interface Props { account?: Account; onClose: () => void; onSubmit: (data: NewAccount) => void }
const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block"><span className="micro mb-1 block">{label}</span>{children}</label>
)

export function AccountFormModal({ account, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<NewAccount>(() => account ?? {
    name: '', owner: '', segment: 'Mid-market', mrr: 0, growth: 0, status: 'Active', arr: 0, since: '2025-01-01',
  })
  const set = <K extends keyof NewAccount>(k: K, v: NewAccount[K]) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <Modal
      title={account ? 'Edit account' : 'New account'}
      onClose={onClose}
      footer={<>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={() => onSubmit({ ...form, arr: form.mrr * 12 })}>{account ? 'Save changes' : 'Create account'}</Button>
      </>}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><Field label="Account name"><Input value={form.name} onChange={(e) => set('name', e.target.value)} /></Field></div>
        <Field label="Owner"><Input value={form.owner} onChange={(e) => set('owner', e.target.value)} /></Field>
        <Field label="Segment"><Select value={form.segment} onChange={(e) => set('segment', e.target.value as Segment)}>{SEGMENTS.map((s) => <option key={s}>{s}</option>)}</Select></Field>
        <Field label="MRR ($)"><Input type="number" value={form.mrr} onChange={(e) => set('mrr', Number(e.target.value))} /></Field>
        <Field label="Growth (%)"><Input type="number" value={form.growth} onChange={(e) => set('growth', Number(e.target.value))} /></Field>
        <div className="col-span-2"><Field label="Status"><Select value={form.status} onChange={(e) => set('status', e.target.value as Status)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</Select></Field></div>
      </div>
    </Modal>
  )
}
