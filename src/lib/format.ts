export const fmtNum = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n))
export const fmtCurrency = (n: number) => `$${fmtNum(n)}`
export const fmtPercent = (n: number) => `${Math.abs(n).toFixed(1)}%`
export const fmtDelta = (n: number) => `${n < 0 ? '▼' : '▲'} ${fmtPercent(n)}`
