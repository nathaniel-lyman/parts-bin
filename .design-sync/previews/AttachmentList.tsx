import { AttachmentList } from 'parts-bin'

const noop = () => {}

export function Files() {
  return (
    <div style={{ width: 420 }}>
      <AttachmentList
        attachments={[
          { id: 'f1', name: 'Q2-revenue-report.pdf', size: 248000, onRemove: noop },
          { id: 'f2', name: 'account-export.csv', size: 18400, onRemove: noop },
          { id: 'f3', name: 'contract-northwind.docx', size: 92000, status: 'Uploading…' },
        ]}
      />
    </div>
  )
}

export function Empty() {
  return (
    <div style={{ width: 420 }}>
      <AttachmentList attachments={[]} emptyLabel="No files attached yet" />
    </div>
  )
}
