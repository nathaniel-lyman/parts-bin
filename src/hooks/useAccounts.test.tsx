import { expect, test } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useAccounts } from './useAccounts'

test('seeds with 8 accounts', () => {
  const { result } = renderHook(() => useAccounts())
  expect(result.current.accounts.length).toBe(8)
})

test('create adds a row with a generated id', () => {
  const { result } = renderHook(() => useAccounts())
  act(() => result.current.create({ name: 'Zephyr', owner: 'T. Vance', segment: 'Mid-market', mrr: 12345, growth: 7.7, status: 'Active', arr: 148140, since: '2025-01-01' }))
  expect(result.current.accounts.length).toBe(9)
  expect(result.current.accounts.some(a => a.name === 'Zephyr' && a.id)).toBe(true)
})

test('update mutates the matching account', () => {
  const { result } = renderHook(() => useAccounts())
  const id = result.current.accounts[0].id
  act(() => result.current.update(id, { mrr: 99999 }))
  expect(result.current.accounts.find(a => a.id === id)?.mrr).toBe(99999)
})

test('remove deletes the matching account', () => {
  const { result } = renderHook(() => useAccounts())
  const id = result.current.accounts[0].id
  act(() => result.current.remove(id))
  expect(result.current.accounts.length).toBe(7)
  expect(result.current.accounts.some(a => a.id === id)).toBe(false)
})
