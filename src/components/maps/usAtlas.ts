import { geoAlbersUsa, geoPath } from 'd3-geo'
import type { Feature, Geometry } from 'geojson'
import { feature, merge } from 'topojson-client'
import type { GeometryCollection, GeometryObject, MultiPolygon, Polygon, Topology } from 'topojson-specification'
import usAtlas from 'us-atlas/states-albers-10m.json'
import type { MapFeature, MapRegion, MapViewport } from './types'

// Source: topojson/us-atlas states-albers-10m, derived from U.S. Census
// cartographic boundary shapefiles and projected for a 975x610 Albers USA map.
interface StateProperties {
  name?: string
}

type StateGeometry = (Polygon<StateProperties> | MultiPolygon<StateProperties>) & { id: string }

type UsAtlasObjects = Record<string, GeometryObject<StateProperties>> & {
  states: GeometryCollection<StateProperties> & {
    geometries: StateGeometry[]
  }
  nation: Polygon<StateProperties> | MultiPolygon<StateProperties>
}

export const usAtlasViewport: MapViewport = { width: 975, height: 610 }

const topology = usAtlas as unknown as Topology<UsAtlasObjects>
const stateGeometries = topology.objects.states.geometries as StateGeometry[]
const path = geoPath()
const projection = geoAlbersUsa().scale(1300).translate([487.5, 305])

export const stateRegionIds = {
  west: ['02', '04', '06', '08', '15', '16', '30', '32', '35', '41', '49', '53', '56'],
  midwest: ['17', '18', '19', '20', '26', '27', '29', '31', '38', '39', '46', '55'],
  south: ['01', '05', '10', '11', '12', '13', '21', '22', '24', '28', '37', '40', '45', '47', '48', '51', '54'],
  northeast: ['09', '23', '25', '33', '34', '36', '42', '44', '50'],
} as const

export function projectLngLat(longitude: number, latitude: number): [number, number] {
  return projection([longitude, latitude]) ?? [0, 0]
}

function pathFromFeature(input: Feature<Geometry> | Geometry) {
  return path(input) ?? ''
}

export const ledgerStatePaths: MapFeature[] = stateGeometries.map((state) => {
  const stateFeature = feature(topology, state) as Feature<Geometry>
  return {
    id: state.id,
    label: state.properties?.name ?? state.id,
    path: pathFromFeature(stateFeature),
  }
})

export const ledgerNationPath = pathFromFeature(feature(topology, topology.objects.nation) as Feature<Geometry>)

export function buildRegionPath(stateIds: readonly string[]) {
  const stateIdSet = new Set(stateIds)
  const geometries = stateGeometries.filter((state) => stateIdSet.has(state.id))
  return pathFromFeature(merge(topology, geometries) as Geometry)
}

export function withRegionPath(region: Omit<MapRegion, 'path'>): MapRegion {
  return {
    ...region,
    path: buildRegionPath(region.stateIds ?? []),
  }
}
