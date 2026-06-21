import { IconButton } from '../ui/IconButton'
import { useToast } from '../ui/ToastContext'

export interface CodeBlockProps {
  code: string
  language?: string
}

/**
 * Themed monospace code block with a copy affordance. No syntax highlighting
 * by design: highlighters ship their own color palettes, which fights the
 * token boundary. Wire one up downstream if you need it.
 */
export function CodeBlock({ code, language }: CodeBlockProps) {
  const toast = useToast()
  const copy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(code).then(
        () => toast('Copied code'),
        () => toast('Copy failed'),
      )
    } else {
      toast('Copy failed')
    }
  }
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface-2">
      <div className="flex items-center justify-between border-b border-line px-2 py-0.5">
        <span className="micro text-muted">{language ?? 'code'}</span>
        <IconButton size="compact" aria-label="Copy code" onClick={copy}>⧉</IconButton>
      </div>
      <pre className="m-0 overflow-x-auto px-3 py-2 text-[12px] leading-relaxed text-ink">
        <code>{code}</code>
      </pre>
    </div>
  )
}
