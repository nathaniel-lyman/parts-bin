import { ImportProgress } from 'parts-bin'

export function Importing() {
  return (
    <div style={{ width: 380 }}>
      <ImportProgress value={62} label="Importing accounts" detail="124 of 200 rows" />
    </div>
  )
}

export function NearlyDone() {
  return (
    <div style={{ width: 380 }}>
      <ImportProgress value={94} label="Syncing invoices" detail="1,880 of 2,000 records" />
    </div>
  )
}
