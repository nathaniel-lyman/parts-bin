import { LoadingProgress } from '../ui'

export function DataGridLoadingState() {
  return (
    <div className="grid justify-items-center px-3 py-8 text-muted" aria-live="polite">
      <LoadingProgress label="Loading rows" detail="Loading grid rows" />
    </div>
  )
}
