import { Copy, RotateCcw, ThumbsDown, ThumbsUp } from 'lucide-react'
import { IconButton } from '../ui/IconButton'
import { useToast } from '../ui/ToastContext'

export interface MessageActionsProps {
  /** The message text the copy action writes to the clipboard. */
  content: string
  onRegenerate?: () => void
  onFeedback?: (kind: 'up' | 'down') => void
}

/** Compact action row under a completed assistant message. */
export function MessageActions({ content, onRegenerate, onFeedback }: MessageActionsProps) {
  const toast = useToast()
  const copy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(content).then(() => toast('Copied message'), () => toast('Copy failed'))
    } else {
      toast('Copy failed')
    }
  }
  return (
    <div className="mt-1 flex items-center gap-1">
      <IconButton size="compact" aria-label="Copy message" onClick={copy}>
        <Copy className="h-4 w-4" />
      </IconButton>
      {onRegenerate && (
        <IconButton size="compact" aria-label="Regenerate response" onClick={onRegenerate}>
          <RotateCcw className="h-4 w-4" />
        </IconButton>
      )}
      {onFeedback && (
        <>
          <IconButton size="compact" aria-label="Good response" onClick={() => onFeedback('up')}>
            <ThumbsUp className="h-4 w-4" />
          </IconButton>
          <IconButton size="compact" aria-label="Bad response" onClick={() => onFeedback('down')}>
            <ThumbsDown className="h-4 w-4" />
          </IconButton>
        </>
      )}
    </div>
  )
}
