import { expect, test } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { Button } from './Button'
import { Drawer } from './Drawer'

test('Drawer traps focus, closes on Escape, and restores opener focus', async () => {
  const user = userEvent.setup()

  function Harness() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open drawer</Button>
        {open && (
          <Drawer title="Filters" onClose={() => setOpen(false)} footer={<Button>Apply</Button>}>
            <Button>Reset</Button>
          </Drawer>
        )}
      </>
    )
  }

  render(<Harness />)
  const opener = screen.getByRole('button', { name: 'Open drawer' })
  opener.focus()
  await user.click(opener)

  const close = screen.getByRole('button', { name: 'Close' })
  await waitFor(() => expect(close).toHaveFocus())

  // Shift+Tab from the first focusable (Close) wraps to the last (Apply).
  await user.tab({ shift: true })
  expect(screen.getByRole('button', { name: 'Apply' })).toHaveFocus()

  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(opener).toHaveFocus()
})
