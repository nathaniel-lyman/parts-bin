import { beforeEach, expect, test } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { DEFAULT_COLUMN_ORDER, normalizeColumnOrder, useColumnOrder } from './useColumnOrder'

beforeEach(() => localStorage.clear())

test('defaults to the canonical order with actions pinned last', () => {
  const { result } = renderHook(() => useColumnOrder())
  expect(result.current.columnOrder).toEqual(DEFAULT_COLUMN_ORDER)
  expect(result.current.columnOrder.at(-1)).toBe('actions')
})

test('setColumnOrder persists to ledger.colOrder', () => {
  const { result } = renderHook(() => useColumnOrder())
  const next = ['owner', 'account', 'segment', 'mrr', 'growth', 'status', 'arr', 'since', 'actions']

  act(() => result.current.setColumnOrder(next))

  expect(result.current.columnOrder).toEqual(next)
  expect(JSON.parse(localStorage.getItem('ledger.colOrder')!)).toEqual(next)
})

test('reads persisted value on init', () => {
  const persisted = ['owner', 'account', 'segment', 'mrr', 'growth', 'status', 'arr', 'since', 'actions']
  localStorage.setItem('ledger.colOrder', JSON.stringify(persisted))

  const { result } = renderHook(() => useColumnOrder())

  expect(result.current.columnOrder).toEqual(persisted)
})

test('normalizes stale persisted order and keeps actions pinned', () => {
  expect(normalizeColumnOrder(['actions', 'owner', 'ghost', 'owner', 'account'])).toEqual([
    'owner',
    'account',
    'segment',
    'mrr',
    'growth',
    'status',
    'arr',
    'since',
    'actions',
  ])
})

test('reset restores the canonical order', () => {
  const { result } = renderHook(() => useColumnOrder())
  act(() => result.current.setColumnOrder(['owner', 'account', 'segment', 'mrr', 'growth', 'status', 'arr', 'since', 'actions']))

  act(() => result.current.reset())

  expect(result.current.columnOrder).toEqual(DEFAULT_COLUMN_ORDER)
})
