import { FileUpload } from 'parts-bin'

const noop = () => {}

const csvFile = new File(['id,title,status'], 'records-import.csv', { type: 'text/csv' })
const pdfFile = new File(['%PDF-1.7'], 'contract-q2.pdf', { type: 'application/pdf' })

export function Empty() {
  return (
    <div style={{ width: 420 }}>
      <FileUpload
        label="Attachments"
        description="CSV, PDF, or images up to 10 MB"
        files={[]}
        onFilesSelected={noop}
      />
    </div>
  )
}

export function WithFile() {
  return (
    <div style={{ width: 420 }}>
      <FileUpload
        label="Import file"
        description="Choose a customer import file"
        accept=".csv"
        files={[csvFile]}
        onFilesSelected={noop}
      />
    </div>
  )
}

export function MultipleFiles() {
  return (
    <div style={{ width: 420 }}>
      <FileUpload
        label="Attachments"
        description="Add up to 5 files"
        multiple
        files={[csvFile, pdfFile]}
        onFilesSelected={noop}
      />
    </div>
  )
}
