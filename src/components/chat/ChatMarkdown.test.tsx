import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { ToastContext } from '../ui/ToastContext'
import { ChatMarkdown } from './ChatMarkdown'

afterEach(() => vi.unstubAllGlobals())

describe('ChatMarkdown', () => {
  test('renders GFM tables as real table elements', () => {
    const md = '| Segment | MRR |\n| --- | --- |\n| Enterprise | $1,000 |'
    render(<ChatMarkdown content={md} />)
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Enterprise')).toBeInTheDocument()
  })

  test('renders fenced code through CodeBlock with language label and copy', () => {
    render(<ChatMarkdown content={'```ts\nconst x = 1\n```'} />)
    expect(screen.getByText('ts')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument()
    expect(screen.getByText('const x = 1')).toBeInTheDocument()
  })

  test('renders inline code without a copy button', () => {
    render(<ChatMarkdown content={'use `npm test` here'} />)
    expect(screen.getByText('npm test')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Copy code' })).not.toBeInTheDocument()
  })

  test('links open in a new tab', () => {
    render(<ChatMarkdown content={'[docs](https://example.com)'} />)
    const link = screen.getByRole('link', { name: 'docs' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noreferrer')
  })

  test('copying a code block writes the clipboard and toasts', async () => {
    // Order matters: userEvent.setup() installs its own clipboard stub on
    // window.navigator; stubGlobal AFTER setup so our spy wins.
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })
    const toast = vi.fn()
    render(
      <ToastContext.Provider value={toast}>
        <ChatMarkdown content={'```ts\nconst x = 1\n```'} />
      </ToastContext.Provider>,
    )
    await user.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(writeText).toHaveBeenCalledWith('const x = 1')
    expect(toast).toHaveBeenCalledWith('Copied code')
  })
})
