// REFERENCE ONLY — not wired into the app. This file shows the shipped SaaS
// demo domain (src/data/types.ts + accounts.ts) remapped to a supplier
// scorecard — vendor compliance and fill-rate tracking — so you can see your
// own domain in the framework before committing to a swap. To actually swap,
// follow skills/swap-data-domain/SKILL.md.
//
// Mapping from the demo domain:
//   Account → Supplier         mrr → fillRate (%)        arr → annualSpend
//   owner → buyer              segment → category        since → onboarded
//   Active / At risk / Churned → Compliant / Watch / Suspended
//
// Note the metric-shape change: fillRate is a percentage (0–100), not a
// currency. When you swap, that changes KPI formatting (fmt helpers), the
// donut (share of spend, not share of fill rate), and which selector
// aggregations make sense (average fill rate, not a sum).

export type SupplierCategory = 'Produce' | 'Dairy' | 'Dry goods'
export type SupplierStatus = 'Compliant' | 'Watch' | 'Suspended'

export interface Supplier {
  id: string
  name: string
  buyer: string
  category: SupplierCategory
  fillRate: number // on-time fill rate, percent 0–100
  trend: number // fill-rate trend, points vs. prior quarter, may be negative
  status: SupplierStatus
  annualSpend: number // USD
  onboarded: string // ISO date
}

export const seedSuppliers: Supplier[] = [
  { id: 'v1', name: 'Cobalt Produce Co.',   buyer: 'K. Osei',   category: 'Produce',   fillRate: 97.2, trend: -0.8, status: 'Watch',     annualSpend: 2952000, onboarded: '2019-02-01' },
  { id: 'v2', name: 'Meridian Dairy',       buyer: 'K. Osei',   category: 'Dairy',     fillRate: 98.6, trend:  1.2, status: 'Compliant', annualSpend: 2208000, onboarded: '2017-09-01' },
  { id: 'v3', name: 'Northwind Grains',     buyer: 'J. Park',   category: 'Dry goods', fillRate: 96.4, trend:  0.9, status: 'Compliant', annualSpend: 1890000, onboarded: '2020-05-01' },
  { id: 'v4', name: 'Bluestem Organics',    buyer: 'J. Park',   category: 'Produce',   fillRate: 94.8, trend:  2.8, status: 'Compliant', annualSpend: 1104000, onboarded: '2023-01-01' },
  { id: 'v5', name: 'Harbor & Pine Foods',  buyer: 'M. Chen',   category: 'Dry goods', fillRate: 92.1, trend:  0.4, status: 'Compliant', annualSpend:  816000, onboarded: '2021-11-01' },
  { id: 'v6', name: 'Solstice Creamery',    buyer: 'M. Chen',   category: 'Dairy',     fillRate: 78.3, trend: -6.2, status: 'Suspended', annualSpend:  516000, onboarded: '2016-04-01' },
  { id: 'v7', name: 'Foxglove Farms',       buyer: 'A. Rivera', category: 'Produce',   fillRate: 95.5, trend:  4.4, status: 'Compliant', annualSpend:  258000, onboarded: '2024-06-01' },
  { id: 'v8', name: 'Quill Provisions',     buyer: 'A. Rivera', category: 'Dry goods', fillRate: 88.9, trend: -2.6, status: 'Watch',     annualSpend:  168000, onboarded: '2023-08-01' },
]

// KPI sparklines (12-month trends) — mirrors `sparks` in accounts.ts.
// Equivalent KPIs: avg fill rate / compliant vendors / fill-rate trend / vendors on watch.
export const supplierSparks = {
  fillRate:  [93.2, 93.6, 93.1, 94.0, 94.4, 94.1, 94.9, 95.3, 95.1, 95.7, 96.0, 96.2],
  compliant: [30, 32, 33, 33, 35, 36, 36, 38, 39, 39, 40, 41],
  trend:     [0.4, 0.6, 0.5, 0.8, 0.7, 0.9, 0.8, 1.1, 1.0, 0.9, 1.2, 1.1],
  onWatch:   [9, 8, 8, 7, 8, 6, 7, 6, 5, 6, 5, 4],
}

// Monthly fill rate by category (%) — mirrors `monthlySeries`.
export interface SupplierMonthlyPoint { month: string; Produce: number; Dairy: number; 'Dry goods': number }
export const supplierMonthlySeries: SupplierMonthlyPoint[] = [
  { month: 'Jan', Produce: 94.1, Dairy: 92.8, 'Dry goods': 93.5 },
  { month: 'Feb', Produce: 94.6, Dairy: 92.5, 'Dry goods': 93.9 },
  { month: 'Mar', Produce: 95.0, Dairy: 91.9, 'Dry goods': 94.2 },
  { month: 'Apr', Produce: 95.2, Dairy: 92.4, 'Dry goods': 94.6 },
  { month: 'May', Produce: 94.8, Dairy: 93.0, 'Dry goods': 94.9 },
  { month: 'Jun', Produce: 95.5, Dairy: 93.6, 'Dry goods': 95.1 },
  { month: 'Jul', Produce: 95.9, Dairy: 94.1, 'Dry goods': 95.4 },
  { month: 'Aug', Produce: 96.2, Dairy: 94.5, 'Dry goods': 95.8 },
  { month: 'Sep', Produce: 96.4, Dairy: 95.0, 'Dry goods': 96.1 },
  { month: 'Oct', Produce: 96.8, Dairy: 95.3, 'Dry goods': 96.3 },
]

// Selector semantics to decide consciously (see selectors/metrics.ts):
// the demo excludes Churned from totals — the equivalent here is excluding
// Suspended vendors from the average fill rate and spend shares, counting
// only Compliant in activeCount, and counting non-Compliant as atRiskCount.
