import { isValidElement, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CodeBlock } from './CodeBlock'

export interface ChatMarkdownProps {
  content: string
}

/** Recursively flatten a React node tree to its text content (survives nested spans, e.g. from rehype-highlight). */
function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement(node)) return textOf((node.props as { children?: ReactNode }).children)
  return ''
}

/** Pull the code text + language out of the single <code> child of a <pre>. */
function extractCode(children: ReactNode): { code: string; language?: string } | null {
  if (!isValidElement(children)) return null
  const props = children.props as { className?: string; children?: ReactNode }
  const language = /language-(\w+)/.exec(props.className ?? '')?.[1]
  return { code: textOf(props.children).replace(/\n$/, ''), language }
}

/**
 * Token-styled markdown for assistant messages. Every element maps to theme
 * utilities so re-skinning tokens re-skins chat output too. Fenced blocks
 * render through CodeBlock; user content never goes through this component.
 */
export function ChatMarkdown({ content }: ChatMarkdownProps) {
  return (
    <div className="grid gap-2 text-[13px] leading-relaxed text-ink">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="m-0">{children}</p>,
          // Mirrors Link's accent variant (Link expects no markdown-injected props, so classes are inlined).
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer" className="text-accent underline underline-offset-2 hover:opacity-80">
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="m-0 grid list-disc gap-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="m-0 grid list-decimal gap-1 pl-5">{children}</ol>,
          li: ({ children }) => <li className="m-0">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
          em: ({ children }) => <em>{children}</em>,
          h1: ({ children }) => <h3 className="display m-0 text-[15px] font-semibold text-ink">{children}</h3>,
          h2: ({ children }) => <h4 className="display m-0 text-[14px] font-semibold text-ink">{children}</h4>,
          h3: ({ children }) => <h5 className="display m-0 text-[13px] font-semibold text-ink">{children}</h5>,
          hr: () => <hr className="m-0 border-line" />,
          blockquote: ({ children }) => (
            <blockquote className="m-0 border-l-2 border-line pl-3 text-muted">{children}</blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[12.5px]">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="micro border-b border-line px-2 py-1 text-left text-muted">{children}</th>
          ),
          td: ({ children }) => <td className="border-b border-line px-2 py-1">{children}</td>,
          pre: ({ children }) => {
            const extracted = extractCode(children)
            if (!extracted) return <pre className="m-0 overflow-x-auto">{children}</pre>
            return <CodeBlock code={extracted.code} language={extracted.language} />
          },
          code: ({ children }) => (
            <code className="rounded-[2px] bg-surface-2 px-1 py-0.5 text-[12px] text-ink">{children}</code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
