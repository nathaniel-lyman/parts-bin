import type { Status } from '../../data/types'

const styles: Record<Status, string> = {
  'Active': 'bg-pos-soft text-pos',
  'At risk': 'bg-warn-soft text-warn',
  'Churned': 'bg-neg-soft text-neg',
}
const dot: Record<Status, string> = { 'Active': 'bg-pos', 'At risk': 'bg-warn', 'Churned': 'bg-neg' }

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`micro inline-flex items-center gap-1.5 rounded-[2px] px-1.5 py-0.5 ${styles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot[status]}`} />
      {status}
    </span>
  )
}
