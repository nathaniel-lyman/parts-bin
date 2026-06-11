import { useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from 'react'
import { Button } from './Button'
import { cx } from './utils'

export interface DropzoneProps {
  label?: ReactNode
  description?: ReactNode
  accept?: string
  multiple?: boolean
  disabled?: boolean
  onFilesSelected: (files: File[]) => void
  className?: string
}

export function Dropzone({
  label = 'Drop files here',
  description = 'or choose files',
  accept,
  multiple = true,
  disabled = false,
  onFilesSelected,
  className,
}: DropzoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectFiles = (fileList: FileList | null) => {
    if (!fileList || disabled) return
    onFilesSelected(Array.from(fileList))
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    selectFiles(event.dataTransfer.files)
  }

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    selectFiles(event.target.files)
    event.target.value = ''
  }

  return (
    <div
      onDragEnter={(event) => {
        event.preventDefault()
        if (!disabled) setDragging(true)
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        // dragleave also fires when entering a child; only clear when truly leaving
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false)
      }}
      onDrop={onDrop}
      className={cx(
        'grid min-h-36 place-items-center border border-dashed border-line bg-surface p-6 text-center',
        dragging && 'bg-surface-2',
        disabled && 'opacity-60',
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        aria-label={typeof label === 'string' ? label : 'Choose files'}
        className="sr-only"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={onInputChange}
      />
      <div className="grid justify-items-center gap-2">
        <div className="num text-[22px] text-faint" aria-hidden="true">[]</div>
        <div className="grid gap-1">
          <p className="m-0 text-[14px] font-semibold text-ink">{label}</p>
          <p className="m-0 text-[13px] text-muted">{description}</p>
        </div>
        <Button type="button" size="compact" onClick={() => inputRef.current?.click()} disabled={disabled}>
          Browse
        </Button>
      </div>
    </div>
  )
}

export interface FileUploadProps extends DropzoneProps {
  files?: File[]
}

export function FileUpload({ files = [], ...dropzoneProps }: FileUploadProps) {
  return (
    <div className="grid gap-3">
      <Dropzone {...dropzoneProps} />
      {files.length > 0 && <AttachmentList attachments={files.map((file) => ({ id: file.name, name: file.name, size: file.size }))} />}
    </div>
  )
}

export interface AttachmentItem {
  id: string
  name: ReactNode
  size?: number
  status?: ReactNode
  onRemove?: () => void
}

export interface AttachmentListProps {
  attachments: AttachmentItem[]
  emptyLabel?: ReactNode
  className?: string
}

export function AttachmentList({ attachments, emptyLabel = 'No attachments', className }: AttachmentListProps) {
  if (attachments.length === 0) {
    return <p className={cx('m-0 border border-line bg-surface px-3 py-2 text-[13px] text-muted', className)}>{emptyLabel}</p>
  }

  return (
    <ul className={cx('m-0 grid list-none gap-0 border border-line bg-surface p-0', className)}>
      {attachments.map((attachment) => (
        <li key={attachment.id} className="flex min-w-0 items-center justify-between gap-3 border-b border-line px-3 py-2 last:border-b-0">
          <span className="grid min-w-0 gap-0.5">
            <span className="truncate text-[13px] font-medium text-ink">{attachment.name}</span>
            {(typeof attachment.size === 'number' || attachment.status) && (
              <span className="text-[12px] text-muted">
                {typeof attachment.size === 'number' && formatFileSize(attachment.size)}
                {typeof attachment.size === 'number' && attachment.status ? ' · ' : ''}
                {attachment.status}
              </span>
            )}
          </span>
          {attachment.onRemove && (
            <Button type="button" size="compact" variant="ghost" onClick={attachment.onRemove}>
              Remove
            </Button>
          )}
        </li>
      ))}
    </ul>
  )
}

export interface ImportProgressProps {
  value: number
  label?: ReactNode
  detail?: ReactNode
  className?: string
}

export function ImportProgress({ value, label = 'Import progress', detail, className }: ImportProgressProps) {
  const safeValue = Math.min(100, Math.max(0, value))

  return (
    <div className={cx('grid gap-2 border border-line bg-surface px-3 py-2', className)}>
      <div className="flex items-center justify-between gap-3 text-[13px]">
        <span className="font-medium text-ink">{label}</span>
        <span className="num text-muted">{safeValue}%</span>
      </div>
      <div className="h-2 overflow-hidden bg-surface-2" role="progressbar" aria-label={String(label)} aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeValue}>
        <div className="h-full bg-accent" style={{ width: `${safeValue}%` }} />
      </div>
      {detail && <p className="m-0 text-[12px] text-muted">{detail}</p>}
    </div>
  )
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}
