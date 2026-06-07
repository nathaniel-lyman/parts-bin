import type { Account, MonthlyPoint, MovementPoint } from './types'

// 12-month trend series feeding the KPI-card sparklines (matches demo.html).
export const sparks = {
  mrr: [62, 64, 63, 67, 70, 69, 74, 78, 77, 82, 85, 88],
  accts: [30, 32, 33, 33, 35, 36, 36, 38, 39, 39, 40, 41],
  growth: [4, 6, 5, 8, 7, 9, 8, 11, 10, 9, 12, 11],
  churn: [9, 8, 8, 7, 8, 6, 7, 6, 5, 6, 5, 4],
}

export const seedAccounts: Account[] = [
  { id: 'a1', name: 'Cobalt Freight',  owner: 'K. Osei',   segment: 'Enterprise', mrr: 24600, growth: -2.1, status: 'At risk',  arr: 295200, since: '2023-02-01' },
  { id: 'a2', name: 'Meridian Corp',   owner: 'K. Osei',   segment: 'Enterprise', mrr: 18400, growth:  6.2, status: 'Active',   arr: 220800, since: '2022-09-01' },
  { id: 'a3', name: 'Northwind Paper', owner: 'J. Park',   segment: 'Enterprise', mrr: 15750, growth:  3.9, status: 'Active',   arr: 189000, since: '2023-05-01' },
  { id: 'a4', name: 'Bluestem Health', owner: 'J. Park',   segment: 'Mid-market', mrr:  9200, growth: 12.8, status: 'Active',   arr: 110400, since: '2024-01-01' },
  { id: 'a5', name: 'Harbor & Pine',   owner: 'M. Chen',   segment: 'Mid-market', mrr:  6800, growth:  0.4, status: 'Active',   arr:  81600, since: '2023-11-01' },
  { id: 'a6', name: 'Solstice Media',  owner: 'M. Chen',   segment: 'Mid-market', mrr:  4300, growth: -14.2, status: 'Churned', arr:  51600, since: '2022-04-01' },
  { id: 'a7', name: 'Foxglove Labs',   owner: 'A. Rivera', segment: 'Startup',    mrr:  2150, growth: 31.4, status: 'Active',   arr:  25800, since: '2024-06-01' },
  { id: 'a8', name: 'Quill Analytics', owner: 'A. Rivera', segment: 'Startup',    mrr:  1400, growth: -8.6, status: 'At risk',  arr:  16800, since: '2024-03-01' },
]

// Monthly MRR by segment ($k) — Jan..Oct, matching the demo's trend chart shape.
export const monthlySeries: MonthlyPoint[] = [
  { month: 'Jan', Enterprise: 38, 'Mid-market': 18, Startup: 2 },
  { month: 'Feb', Enterprise: 41, 'Mid-market': 18, Startup: 2 },
  { month: 'Mar', Enterprise: 44, 'Mid-market': 18, Startup: 2 },
  { month: 'Apr', Enterprise: 44, 'Mid-market': 19, Startup: 2 },
  { month: 'May', Enterprise: 43, 'Mid-market': 19, Startup: 2 },
  { month: 'Jun', Enterprise: 43, 'Mid-market': 19, Startup: 3 },
  { month: 'Jul', Enterprise: 46, 'Mid-market': 20, Startup: 3 },
  { month: 'Aug', Enterprise: 52, 'Mid-market': 22, Startup: 3 },
  { month: 'Sep', Enterprise: 54, 'Mid-market': 23, Startup: 4 },
  { month: 'Oct', Enterprise: 55, 'Mid-market': 24, Startup: 4 },
]

// Revenue movement ($k) — New/Expansion positive, Churn negative.
export const movementSeries: MovementPoint[] = [
  { month: 'Jan', New: 4.0, Expansion: 3.0, Churn: -1.5 },
  { month: 'Feb', New: 5.5, Expansion: 2.6, Churn: -1.8 },
  { month: 'Mar', New: 5.9, Expansion: 2.4, Churn: -0.8 },
  { month: 'Apr', New: 5.2, Expansion: 1.9, Churn: -0.5 },
  { month: 'May', New: 4.1, Expansion: 1.6, Churn: -0.9 },
  { month: 'Jun', New: 3.4, Expansion: 1.7, Churn: -1.0 },
  { month: 'Jul', New: 3.9, Expansion: 2.2, Churn: -1.6 },
  { month: 'Aug', New: 5.2, Expansion: 3.0, Churn: -0.7 },
  { month: 'Sep', New: 6.6, Expansion: 3.8, Churn: -0.5 },
  { month: 'Oct', New: 7.1, Expansion: 4.0, Churn: -0.5 },
]
