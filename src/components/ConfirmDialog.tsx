import { Modal } from './ui/Modal'
import { Button } from './ui/Button'

interface Props { title: string; message: string; confirmLabel?: string; onCancel: () => void; onConfirm: () => void }
export function ConfirmDialog({ title, message, confirmLabel = 'Delete', onCancel, onConfirm }: Props) {
  return (
    <Modal title={title} onClose={onCancel} footer={<>
      <Button onClick={onCancel}>Cancel</Button>
      <Button variant="destructive" onClick={onConfirm}>{confirmLabel}</Button>
    </>}>
      <p className="text-[14px] text-muted">{message}</p>
    </Modal>
  )
}
