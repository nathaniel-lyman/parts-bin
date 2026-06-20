import { Select } from 'parts-bin'

export function Default() {
  return (
    <div style={{ width: 280 }}>
      <Select defaultValue="enterprise" onChange={() => {}}>
        <option value="starter">Starter</option>
        <option value="pro">Pro</option>
        <option value="enterprise">Enterprise</option>
      </Select>
    </div>
  )
}

export function States() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 280 }}>
      <Select defaultValue="na" onChange={() => {}}>
        <option value="na">North America</option>
        <option value="emea">EMEA</option>
        <option value="apac">APAC</option>
      </Select>
      <Select defaultValue="pro" disabled onChange={() => {}}>
        <option value="pro">Pro</option>
      </Select>
    </div>
  )
}
