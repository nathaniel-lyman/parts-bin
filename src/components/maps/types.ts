import type { ReactNode } from 'react'

export interface MapMetric {
  label: ReactNode
  value: ReactNode
  tone?: 'neutral' | 'positive' | 'negative' | 'warning' | 'accent' | 'intelligence'
}

export interface MapRegion {
  id: string
  label: string
  path: string
  value: number
  detail?: ReactNode
  metrics?: MapMetric[]
}

export interface MapPoint {
  id: string
  label: string
  x: number
  y: number
  value: number
  detail?: ReactNode
}

export interface MapFlow {
  id: string
  label: string
  from: [number, number]
  to: [number, number]
  value: number
  detail?: ReactNode
}

export interface MapViewport {
  width: number
  height: number
}

