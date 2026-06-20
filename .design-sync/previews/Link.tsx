import { Link } from 'parts-bin'

export function Variants() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
      <Link variant="accent" href="#">View account details</Link>
      <Link variant="muted" href="#">Skip for now</Link>
    </div>
  )
}

export function External() {
  return (
    <span style={{ fontSize: 14 }}>
      Read the <Link variant="accent" external href="#">re-skin guide</Link> to theme it.
    </span>
  )
}
