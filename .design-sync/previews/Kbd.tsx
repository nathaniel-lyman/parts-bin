import { Kbd } from 'parts-bin'

export function Shortcuts() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        Open palette <Kbd keys={['Ctrl', 'K']} />
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        Save view <Kbd keys={['⌘', 'S']} />
      </span>
    </div>
  )
}

export function SingleKey() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
      Dismiss <Kbd>Esc</Kbd>
    </span>
  )
}
