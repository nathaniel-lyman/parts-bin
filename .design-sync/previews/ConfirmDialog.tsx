import { ConfirmDialog } from 'parts-bin'

export function DeleteAccount() {
  return (
    <ConfirmDialog
      title="Delete account"
      message="This permanently removes Northwind Logistics and its $1,840 MRR from all dashboards and saved views. This cannot be undone."
      confirmLabel="Delete account"
      onCancel={() => {}}
      onConfirm={() => {}}
    />
  )
}
