// REFERENCE ONLY — not wired into the app. This file shows what the shipped
// SaaS demo domain (src/data/types.ts + accounts.ts) looks like remapped to
// grocery store performance, so you can see your own domain in the framework
// before committing to a swap. To actually swap, follow
// skills/swap-data-domain/SKILL.md — it walks the pipeline in dependency
// order (types → seed data → selectors → grid columns → wiring → forms).
//
// Mapping from the demo domain:
//   Account → Store            mrr → weeklySales        arr → annualSales
//   owner → districtManager    segment → format         since → opened
//   Active / At risk / Churned → On-target / Below target / Remodel

export type StoreFormat = 'Standard' | 'Small format' | 'Flagship'
export type StoreStatus = 'On-target' | 'Below target' | 'Remodel'

export interface Store {
  id: string
  name: string // store number + locality, e.g. "412 Cedar Rapids"
  districtManager: string
  format: StoreFormat
  weeklySales: number // net sales, USD
  growth: number // comp sales growth %, may be negative
  status: StoreStatus
  annualSales: number
  opened: string // ISO date
}

export const seedStores: Store[] = [
  { id: 's1', name: '412 Cedar Rapids',  districtManager: 'K. Osei',   format: 'Flagship',     weeklySales: 246000, growth: -2.1,  status: 'Below target', annualSales: 12792000, opened: '2018-02-01' },
  { id: 's2', name: '198 Naperville',    districtManager: 'K. Osei',   format: 'Flagship',     weeklySales: 184000, growth:  6.2,  status: 'On-target',    annualSales:  9568000, opened: '2015-09-01' },
  { id: 's3', name: '377 Des Moines',    districtManager: 'J. Park',   format: 'Standard',     weeklySales: 157500, growth:  3.9,  status: 'On-target',    annualSales:  8190000, opened: '2019-05-01' },
  { id: 's4', name: '503 Iowa City',     districtManager: 'J. Park',   format: 'Standard',     weeklySales:  92000, growth: 12.8,  status: 'On-target',    annualSales:  4784000, opened: '2022-01-01' },
  { id: 's5', name: '288 Rockford',      districtManager: 'M. Chen',   format: 'Standard',     weeklySales:  68000, growth:  0.4,  status: 'On-target',    annualSales:  3536000, opened: '2020-11-01' },
  { id: 's6', name: '119 Joliet',        districtManager: 'M. Chen',   format: 'Small format', weeklySales:  43000, growth: -14.2, status: 'Remodel',      annualSales:  2236000, opened: '2014-04-01' },
  { id: 's7', name: '561 Dubuque',       districtManager: 'A. Rivera', format: 'Small format', weeklySales:  21500, growth: 31.4,  status: 'On-target',    annualSales:  1118000, opened: '2024-06-01' },
  { id: 's8', name: '544 Quad Cities',   districtManager: 'A. Rivera', format: 'Small format', weeklySales:  14000, growth: -8.6,  status: 'Below target', annualSales:   728000, opened: '2023-03-01' },
]

// KPI sparklines (12-month trends) — mirrors `sparks` in accounts.ts.
// Equivalent KPIs: total weekly sales / open stores / comp growth / below-target count.
export const storeSparks = {
  sales:  [620, 640, 630, 670, 700, 690, 740, 780, 770, 820, 850, 880], // $k
  stores: [30, 32, 33, 33, 35, 36, 36, 38, 39, 39, 40, 41],
  growth: [4, 6, 5, 8, 7, 9, 8, 11, 10, 9, 12, 11],
  below:  [9, 8, 8, 7, 8, 6, 7, 6, 5, 6, 5, 4],
}

// Monthly sales by format ($k) — mirrors `monthlySeries` (segment trend chart).
export interface StoreMonthlyPoint { month: string; Flagship: number; Standard: number; 'Small format': number }
export const storeMonthlySeries: StoreMonthlyPoint[] = [
  { month: 'Jan', Flagship: 380, Standard: 180, 'Small format': 20 },
  { month: 'Feb', Flagship: 410, Standard: 180, 'Small format': 20 },
  { month: 'Mar', Flagship: 440, Standard: 180, 'Small format': 20 },
  { month: 'Apr', Flagship: 440, Standard: 190, 'Small format': 20 },
  { month: 'May', Flagship: 430, Standard: 190, 'Small format': 20 },
  { month: 'Jun', Flagship: 430, Standard: 190, 'Small format': 30 },
  { month: 'Jul', Flagship: 460, Standard: 200, 'Small format': 30 },
  { month: 'Aug', Flagship: 520, Standard: 220, 'Small format': 30 },
  { month: 'Sep', Flagship: 540, Standard: 230, 'Small format': 40 },
  { month: 'Oct', Flagship: 550, Standard: 240, 'Small format': 40 },
]

// Sales movement ($k) — mirrors `movementSeries` (New/Expansion/Churn becomes
// new-store sales / comp growth / closures; closures negative).
export interface StoreMovementPoint { month: string; 'New stores': number; 'Comp growth': number; Closures: number }
export const storeMovementSeries: StoreMovementPoint[] = [
  { month: 'Jan', 'New stores': 40, 'Comp growth': 30, Closures: -15 },
  { month: 'Feb', 'New stores': 55, 'Comp growth': 26, Closures: -18 },
  { month: 'Mar', 'New stores': 59, 'Comp growth': 24, Closures: -8 },
]

// Selector semantics to decide consciously (see selectors/metrics.ts):
// the demo excludes Churned from totals — the equivalent here is excluding
// Remodel stores from totalWeeklySales and format shares, counting only
// On-target in activeCount, and counting non-On-target as atRiskCount.
