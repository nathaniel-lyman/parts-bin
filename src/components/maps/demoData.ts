import type { MapFlow, MapPoint, MapRegion, MapViewport } from './types'

export const ledgerMapViewport: MapViewport = { width: 100, height: 64 }

export const ledgerRegions: MapRegion[] = [
  {
    id: 'west',
    label: 'West',
    path: 'M8 12 L31 8 L38 25 L31 52 L10 48 Z',
    value: 42,
    detail: '$42.4k MRR',
    metrics: [
      { label: 'MRR', value: '$42.4k', tone: 'accent' },
      { label: 'Growth', value: '+7.8%', tone: 'positive' },
      { label: 'Risk', value: '3 accounts', tone: 'warning' },
    ],
  },
  {
    id: 'midwest',
    label: 'Midwest',
    path: 'M31 8 L59 10 L65 28 L58 48 L31 52 L38 25 Z',
    value: 28,
    detail: '$28.1k MRR',
    metrics: [
      { label: 'MRR', value: '$28.1k', tone: 'accent' },
      { label: 'Growth', value: '+3.1%', tone: 'positive' },
      { label: 'Risk', value: '5 accounts', tone: 'warning' },
    ],
  },
  {
    id: 'south',
    label: 'South',
    path: 'M35 33 L65 28 L88 36 L81 55 L49 58 L31 52 Z',
    value: 34,
    detail: '$34.2k MRR',
    metrics: [
      { label: 'MRR', value: '$34.2k', tone: 'accent' },
      { label: 'Growth', value: '+4.4%', tone: 'positive' },
      { label: 'Risk', value: '6 accounts', tone: 'warning' },
    ],
  },
  {
    id: 'northeast',
    label: 'Northeast',
    path: 'M59 10 L86 12 L94 24 L88 36 L65 28 Z',
    value: 25,
    detail: '$25.0k MRR',
    metrics: [
      { label: 'MRR', value: '$25.0k', tone: 'accent' },
      { label: 'Growth', value: '-1.2%', tone: 'negative' },
      { label: 'Risk', value: '8 accounts', tone: 'warning' },
    ],
  },
]

export const ledgerPoints: MapPoint[] = [
  { id: 'seattle', label: 'Seattle', x: 20, y: 17, value: 18, detail: '18 accounts' },
  { id: 'san-francisco', label: 'San Francisco', x: 17, y: 35, value: 32, detail: '32 accounts' },
  { id: 'denver', label: 'Denver', x: 43, y: 30, value: 24, detail: '24 accounts' },
  { id: 'austin', label: 'Austin', x: 55, y: 47, value: 28, detail: '28 accounts' },
  { id: 'atlanta', label: 'Atlanta', x: 72, y: 44, value: 21, detail: '21 accounts' },
  { id: 'new-york', label: 'New York', x: 86, y: 22, value: 27, detail: '27 accounts' },
]

export const ledgerFlows: MapFlow[] = [
  { id: 'west-midwest', label: 'West to Midwest', from: [22, 30], to: [48, 29], value: 18, detail: '$18k expansion pipeline' },
  { id: 'midwest-northeast', label: 'Midwest to Northeast', from: [52, 24], to: [82, 21], value: 12, detail: '$12k implementation handoff' },
  { id: 'south-west', label: 'South to West', from: [68, 47], to: [24, 42], value: 9, detail: '$9k referral motion' },
  { id: 'northeast-south', label: 'Northeast to South', from: [84, 25], to: [66, 43], value: 15, detail: '$15k enterprise migration' },
]

