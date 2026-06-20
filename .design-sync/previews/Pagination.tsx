import { Pagination } from 'parts-bin'

const noop = () => {}

export function MidRange() {
  return (
    <div style={{ width: 420 }}>
      <Pagination page={3} pageSize={25} total={240} onPageChange={noop} />
    </div>
  )
}

export function FirstPage() {
  return (
    <div style={{ width: 420 }}>
      <Pagination page={1} pageSize={10} total={48} onPageChange={noop} />
    </div>
  )
}
