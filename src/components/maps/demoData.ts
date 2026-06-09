import type { MapFlow, MapPoint, MapRegion, MapViewport } from './types'
import { projectLngLat, stateRegionIds, usAtlasViewport, withRegionPath } from './usAtlas'

export const ledgerMapViewport: MapViewport = usAtlasViewport

export const ledgerRegions: MapRegion[] = [
  withRegionPath({
    id: 'west',
    label: 'West',
    stateIds: stateRegionIds.west,
    value: 42,
    detail: '$42.4k MRR',
    metrics: [
      { label: 'MRR', value: '$42.4k', tone: 'accent' },
      { label: 'Growth', value: '+7.8%', tone: 'positive' },
      { label: 'Risk', value: '3 accounts', tone: 'warning' },
    ],
  }),
  withRegionPath({
    id: 'midwest',
    label: 'Midwest',
    stateIds: stateRegionIds.midwest,
    value: 28,
    detail: '$28.1k MRR',
    metrics: [
      { label: 'MRR', value: '$28.1k', tone: 'accent' },
      { label: 'Growth', value: '+3.1%', tone: 'positive' },
      { label: 'Risk', value: '5 accounts', tone: 'warning' },
    ],
  }),
  withRegionPath({
    id: 'south',
    label: 'South',
    stateIds: stateRegionIds.south,
    value: 34,
    detail: '$34.2k MRR',
    metrics: [
      { label: 'MRR', value: '$34.2k', tone: 'accent' },
      { label: 'Growth', value: '+4.4%', tone: 'positive' },
      { label: 'Risk', value: '6 accounts', tone: 'warning' },
    ],
  }),
  withRegionPath({
    id: 'northeast',
    label: 'Northeast',
    stateIds: stateRegionIds.northeast,
    value: 25,
    detail: '$25.0k MRR',
    metrics: [
      { label: 'MRR', value: '$25.0k', tone: 'accent' },
      { label: 'Growth', value: '-1.2%', tone: 'negative' },
      { label: 'Risk', value: '8 accounts', tone: 'warning' },
    ],
  }),
]

export const ledgerPoints: MapPoint[] = [
  { id: 'seattle', label: 'Seattle', value: 18, detail: '18 accounts', ...point(projectLngLat(-122.3321, 47.6062)) },
  { id: 'san-francisco', label: 'San Francisco', value: 32, detail: '32 accounts', ...point(projectLngLat(-122.4194, 37.7749)) },
  { id: 'denver', label: 'Denver', value: 24, detail: '24 accounts', ...point(projectLngLat(-104.9903, 39.7392)) },
  { id: 'austin', label: 'Austin', value: 28, detail: '28 accounts', ...point(projectLngLat(-97.7431, 30.2672)) },
  { id: 'atlanta', label: 'Atlanta', value: 21, detail: '21 accounts', ...point(projectLngLat(-84.388, 33.749)) },
  { id: 'new-york', label: 'New York', value: 27, detail: '27 accounts', ...point(projectLngLat(-74.006, 40.7128)) },
]

export const ledgerFlows: MapFlow[] = [
  { id: 'west-midwest', label: 'West to Midwest', from: coords(-122.4194, 37.7749), to: coords(-104.9903, 39.7392), value: 18, detail: '$18k expansion pipeline' },
  { id: 'midwest-northeast', label: 'Midwest to Northeast', from: coords(-104.9903, 39.7392), to: coords(-74.006, 40.7128), value: 12, detail: '$12k implementation handoff' },
  { id: 'south-west', label: 'South to West', from: coords(-84.388, 33.749), to: coords(-122.3321, 47.6062), value: 9, detail: '$9k referral motion' },
  { id: 'northeast-south', label: 'Northeast to South', from: coords(-74.006, 40.7128), to: coords(-97.7431, 30.2672), value: 15, detail: '$15k enterprise migration' },
]

function coords(longitude: number, latitude: number): [number, number] {
  return projectLngLat(longitude, latitude)
}

function point([x, y]: [number, number]) {
  return { x, y }
}
