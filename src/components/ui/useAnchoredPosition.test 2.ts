import { expect, test } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { RefObject } from 'react'
import { useAnchoredPosition } from './useAnchoredPosition'

function fakeElement(rect: Partial<DOMRect>): RefObject<HTMLElement | null> {
  const full: DOMRect = {
    x: rect.left ?? 0, y: rect.top ?? 0,
    top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0,
    ...rect,
    toJSON: () => ({}),
  }
  return { current: { getBoundingClientRect: () => full } as HTMLElement }
}

// jsdom viewport defaults: 1024 × 768.

test('places the panel below the trigger when it fits', () => {
  const trigger = fakeElement({ top: 100, bottom: 132, left: 40, right: 160 })
  const panel = fakeElement({ width: 288, height: 200 })

  const { result } = renderHook(() => useAnchoredPosition(true, trigger, panel))
  expect(result.current).toMatchObject({ position: 'fixed', top: 140, left: 40 })
})

test('flips above the trigger when the space below is too short', () => {
  const trigger = fakeElement({ top: 700, bottom: 732, left: 40, right: 160 })
  const panel = fakeElement({ width: 288, height: 200 })

  const { result } = renderHook(() => useAnchoredPosition(true, trigger, panel))
  expect(result.current.top).toBe(700 - 8 - 200)
})

test('keeps the panel below when it fits neither side', () => {
  const trigger = fakeElement({ top: 380, bottom: 412, left: 40, right: 160 })
  const panel = fakeElement({ width: 288, height: 600 })

  const { result } = renderHook(() => useAnchoredPosition(true, trigger, panel))
  expect(result.current.top).toBe(420)
})

test('align end anchors the panel to the trigger right edge', () => {
  const trigger = fakeElement({ top: 100, bottom: 132, left: 500, right: 620 })
  const panel = fakeElement({ width: 288, height: 200 })

  const { result } = renderHook(() => useAnchoredPosition(true, trigger, panel, { align: 'end' }))
  expect(result.current.left).toBe(620 - 288)
})

test('clamps the panel inside the viewport horizontally', () => {
  const nearRightEdge = fakeElement({ top: 100, bottom: 132, left: 900, right: 1010 })
  const panel = fakeElement({ width: 288, height: 200 })

  const { result } = renderHook(() => useAnchoredPosition(true, nearRightEdge, panel))
  expect(result.current.left).toBe(1024 - 8 - 288)

  const nearLeftEdge = fakeElement({ top: 100, bottom: 132, left: 4, right: 100 })
  const { result: clampedLeft } = renderHook(() =>
    useAnchoredPosition(true, nearLeftEdge, panel, { align: 'end' }))
  expect(clampedLeft.current.left).toBe(8)
})

test('matchWidth sizes the panel to the trigger width', () => {
  const trigger = fakeElement({ top: 100, bottom: 132, left: 40, right: 360, width: 320 })
  const panel = fakeElement({ width: 288, height: 200 })

  const { result } = renderHook(() => useAnchoredPosition(true, trigger, panel, { matchWidth: true }))
  expect(result.current).toMatchObject({ position: 'fixed', top: 140, left: 40, width: 320 })
})

test('returns no coordinates while closed', () => {
  const trigger = fakeElement({ top: 100, bottom: 132, left: 40, right: 160 })
  const panel = fakeElement({ width: 288, height: 200 })

  const { result } = renderHook(() => useAnchoredPosition(false, trigger, panel))
  expect(result.current).toEqual({})
})
