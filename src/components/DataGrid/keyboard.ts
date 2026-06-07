export type CopyIntent = 'cell' | 'selection'

export interface CopyKeyEvent {
  key: string
  ctrlKey: boolean
  metaKey: boolean
}

export interface CopyContext {
  hasSelection: boolean
  inEditableTarget?: boolean
}

export function resolveCopyIntent(event: CopyKeyEvent, context: CopyContext): CopyIntent | null {
  if (event.key.toLowerCase() !== 'c') return null
  if (!event.ctrlKey && !event.metaKey) return null
  if (context.inEditableTarget) return null
  return context.hasSelection ? 'selection' : 'cell'
}
