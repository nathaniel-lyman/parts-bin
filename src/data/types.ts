export type Segment = 'Enterprise' | 'Mid-market' | 'Startup'
export type Status = 'Active' | 'At risk' | 'Churned'

export interface Account {
  id: string
  name: string
  owner: string
  segment: Segment
  mrr: number
  growth: number // percent, may be negative
  status: Status
  arr: number
  since: string // ISO date
}

export interface MonthlyPoint { month: string; Enterprise: number; 'Mid-market': number; Startup: number }
export interface MovementPoint { month: string; New: number; Expansion: number; Churn: number } // Churn negative
