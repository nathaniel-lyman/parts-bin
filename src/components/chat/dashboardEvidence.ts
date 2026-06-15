import type { MovementPoint } from '../../data/types'

export interface RevenueMovementEvidencePoint {
  month: string
  newMrr: number
  expansion: number
  churnLoss: number
  net: number
}

export interface RevenueMovementEvidence {
  sourceTitle: string
  timePeriodLabel: string
  rowCount: number
  totalNew: number
  totalExpansion: number
  totalChurnLoss: number
  totalNet: number
  latestMonth?: RevenueMovementEvidencePoint
  strongestNetMonth?: RevenueMovementEvidencePoint
  weakestNetMonth?: RevenueMovementEvidencePoint
  largestChurnLossMonth?: RevenueMovementEvidencePoint
  barWidth: number
  labelsVisible: boolean
}

export interface AssistantDashboardEvidence {
  revenueMovement: RevenueMovementEvidence
}

interface BuildRevenueMovementEvidenceOptions {
  sourceTitle: string
  timePeriodLabel: string
  barWidth: number
  labelsVisible: boolean
}

interface BuildAssistantDashboardEvidenceOptions extends BuildRevenueMovementEvidenceOptions {
  revenueMovementData: readonly MovementPoint[]
}

function toEvidencePoint(point: MovementPoint): RevenueMovementEvidencePoint {
  return {
    month: point.month,
    newMrr: point.New,
    expansion: point.Expansion,
    churnLoss: Math.abs(point.Churn),
    net: point.New + point.Expansion + point.Churn,
  }
}

function maxBy(
  points: RevenueMovementEvidencePoint[],
  valueFor: (point: RevenueMovementEvidencePoint) => number,
): RevenueMovementEvidencePoint | undefined {
  if (points.length === 0) return undefined
  return points.reduce((best, point) => (valueFor(point) > valueFor(best) ? point : best), points[0])
}

function minBy(
  points: RevenueMovementEvidencePoint[],
  valueFor: (point: RevenueMovementEvidencePoint) => number,
): RevenueMovementEvidencePoint | undefined {
  if (points.length === 0) return undefined
  return points.reduce((best, point) => (valueFor(point) < valueFor(best) ? point : best), points[0])
}

export function buildRevenueMovementEvidence(
  data: readonly MovementPoint[],
  options: BuildRevenueMovementEvidenceOptions,
): RevenueMovementEvidence {
  const points = data.map(toEvidencePoint)

  return {
    sourceTitle: options.sourceTitle,
    timePeriodLabel: options.timePeriodLabel,
    rowCount: points.length,
    totalNew: points.reduce((sum, point) => sum + point.newMrr, 0),
    totalExpansion: points.reduce((sum, point) => sum + point.expansion, 0),
    totalChurnLoss: points.reduce((sum, point) => sum + point.churnLoss, 0),
    totalNet: points.reduce((sum, point) => sum + point.net, 0),
    latestMonth: points.at(-1),
    strongestNetMonth: maxBy(points, (point) => point.net),
    weakestNetMonth: minBy(points, (point) => point.net),
    largestChurnLossMonth: maxBy(points, (point) => point.churnLoss),
    barWidth: options.barWidth,
    labelsVisible: options.labelsVisible,
  }
}

export function buildAssistantDashboardEvidence(
  options: BuildAssistantDashboardEvidenceOptions,
): AssistantDashboardEvidence {
  return {
    revenueMovement: buildRevenueMovementEvidence(options.revenueMovementData, {
      sourceTitle: options.sourceTitle,
      timePeriodLabel: options.timePeriodLabel,
      barWidth: options.barWidth,
      labelsVisible: options.labelsVisible,
    }),
  }
}
