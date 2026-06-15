import type { ReactNode } from 'react'

export interface DateRange {
  start: string
  end: string
}

export interface DateRangePreset {
  id: string
  label: ReactNode
  range: DateRange
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

export function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function formatDateLabel(value: string) {
  if (!value) return ''
  return dateFormatter.format(new Date(`${value}T00:00:00Z`))
}

export function formatDateRangeLabel(value: DateRange) {
  if (!value.start && !value.end) return 'Select dates'
  if (value.start && value.end) {
    if (value.start === value.end) return formatDateLabel(value.start)
    return `${formatDateLabel(value.start)} - ${formatDateLabel(value.end)}`
  }
  return value.start ? `From ${formatDateLabel(value.start)}` : `Until ${formatDateLabel(value.end)}`
}
