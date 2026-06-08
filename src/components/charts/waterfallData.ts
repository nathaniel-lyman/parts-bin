export type WaterfallStepKind = 'start' | 'increase' | 'decrease' | 'total'

interface BaseWaterfallStep {
  label: string
  note?: string
}

export type WaterfallStepInput =
  | (BaseWaterfallStep & { kind: 'start'; value: number })
  | (BaseWaterfallStep & { kind: 'total'; value?: number })
  | (BaseWaterfallStep & { kind?: 'increase' | 'decrease'; value: number })

export interface WaterfallDatum {
  label: string
  note?: string
  kind: WaterfallStepKind
  value: number
  delta: number
  start: number
  end: number
  range: [number, number]
  connectorBefore: boolean
  connectorAfter: boolean
}

export interface WaterfallSummary {
  start: number
  end: number
  delta: number
  increase: number
  decrease: number
}

export interface WaterfallBuildResult {
  data: WaterfallDatum[]
  summary: WaterfallSummary
}

function assertFiniteValue(value: number | undefined, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Waterfall step "${label}" needs a finite value.`)
  }
  return value
}

function getDeltaValue(step: WaterfallStepInput) {
  const value = assertFiniteValue(step.value, step.label)
  if (step.kind === 'increase') return Math.abs(value)
  if (step.kind === 'decrease') return -Math.abs(value)
  return value
}

export function buildWaterfallData(steps: readonly WaterfallStepInput[]): WaterfallBuildResult {
  if (steps.length < 2) {
    throw new Error('Waterfall data needs at least a start and a total step.')
  }

  let runningTotal = 0
  let firstTotal: number | null = null
  let increase = 0
  let decrease = 0

  const data = steps.map((step, index): WaterfallDatum => {
    const kind = step.kind ?? (step.value >= 0 ? 'increase' : 'decrease')

    if (kind === 'start') {
      const end = assertFiniteValue(step.value, step.label)
      runningTotal = end
      firstTotal ??= end
      return {
        label: step.label,
        note: step.note,
        kind,
        value: end,
        delta: end,
        start: 0,
        end,
        range: [Math.min(0, end), Math.max(0, end)],
        connectorBefore: false,
        connectorAfter: index < steps.length - 1,
      }
    }

    if (kind === 'total') {
      const end = step.value == null ? runningTotal : assertFiniteValue(step.value, step.label)
      const delta = end - runningTotal
      runningTotal = end
      return {
        label: step.label,
        note: step.note,
        kind,
        value: end,
        delta,
        start: 0,
        end,
        range: [Math.min(0, end), Math.max(0, end)],
        connectorBefore: index > 0,
        connectorAfter: index < steps.length - 1,
      }
    }

    const delta = getDeltaValue(step)
    const start = runningTotal
    const end = runningTotal + delta
    runningTotal = end
    if (delta > 0) increase += delta
    if (delta < 0) decrease += Math.abs(delta)

    return {
      label: step.label,
      note: step.note,
      kind: delta >= 0 ? 'increase' : 'decrease',
      value: delta,
      delta,
      start,
      end,
      range: [Math.min(start, end), Math.max(start, end)],
      connectorBefore: index > 0,
      connectorAfter: index < steps.length - 1,
    }
  })

  const start = firstTotal ?? data[0]?.end ?? 0
  const end = data.at(-1)?.end ?? start

  return {
    data,
    summary: {
      start,
      end,
      delta: end - start,
      increase,
      decrease,
    },
  }
}
