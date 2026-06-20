import { Dropzone } from 'parts-bin'

const noop = () => {}

export function Default() {
  return (
    <div style={{ width: 420 }}>
      <Dropzone
        label="Drop CSV files here"
        description="or choose a customer import file"
        accept=".csv"
        multiple
        onFilesSelected={noop}
      />
    </div>
  )
}

export function SingleFile() {
  return (
    <div style={{ width: 420 }}>
      <Dropzone
        label="Drop a logo"
        description="PNG or SVG, up to 2 MB"
        accept="image/png,image/svg+xml"
        multiple={false}
        onFilesSelected={noop}
      />
    </div>
  )
}

export function Disabled() {
  return (
    <div style={{ width: 420 }}>
      <Dropzone
        label="Uploads paused"
        description="Re-enable uploads in settings"
        disabled
        onFilesSelected={noop}
      />
    </div>
  )
}
