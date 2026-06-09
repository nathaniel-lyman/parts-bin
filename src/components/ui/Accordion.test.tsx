import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { Accordion } from './Accordion'

const items = [
  { id: 'general', title: 'General', content: 'General settings body' },
  { id: 'billing', title: 'Billing', content: 'Billing details body' },
  { id: 'danger', title: 'Danger', content: 'Danger zone body', disabled: true },
]

test('sections start collapsed and toggle via the header button', () => {
  render(<Accordion items={items} />)
  const trigger = screen.getByRole('button', { name: 'General' })
  expect(trigger).toHaveAttribute('aria-expanded', 'false')
  expect(screen.queryByText('General settings body')).not.toBeInTheDocument()

  fireEvent.click(trigger)
  expect(trigger).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getByRole('region', { name: 'General' })).toHaveTextContent('General settings body')

  fireEvent.click(trigger)
  expect(trigger).toHaveAttribute('aria-expanded', 'false')
  expect(screen.queryByText('General settings body')).not.toBeInTheDocument()
})

test('single mode closes the open section when another opens', () => {
  render(<Accordion items={items} defaultOpenIds={['general']} />)
  expect(screen.getByText('General settings body')).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Billing' }))
  expect(screen.getByText('Billing details body')).toBeInTheDocument()
  expect(screen.queryByText('General settings body')).not.toBeInTheDocument()
})

test('multiple mode keeps several sections open', () => {
  render(<Accordion multiple items={items} defaultOpenIds={['general']} />)
  fireEvent.click(screen.getByRole('button', { name: 'Billing' }))
  expect(screen.getByText('General settings body')).toBeInTheDocument()
  expect(screen.getByText('Billing details body')).toBeInTheDocument()
})

test('disabled items do not expand', () => {
  render(<Accordion items={items} />)
  const trigger = screen.getByRole('button', { name: 'Danger' })
  expect(trigger).toBeDisabled()
  fireEvent.click(trigger)
  expect(screen.queryByText('Danger zone body')).not.toBeInTheDocument()
})
