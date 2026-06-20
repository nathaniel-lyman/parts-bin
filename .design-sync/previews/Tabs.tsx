import { Tabs } from 'parts-bin'

export function AccountDetail() {
  return (
    <div style={{ width: 480 }}>
      <Tabs
        label="Account sections"
        defaultValue="overview"
        items={[
          {
            id: 'overview',
            label: 'Overview',
            content: (
              <div style={{ paddingTop: 8 }}>
                Northwind Traders · Enterprise plan · <span className="num">$4,200</span> MRR. Renewal in 47 days.
              </div>
            ),
          },
          {
            id: 'activity',
            label: 'Activity',
            content: <div style={{ paddingTop: 8 }}>Plan upgraded to Enterprise 2 days ago by Avery Chen.</div>,
          },
          {
            id: 'billing',
            label: 'Billing',
            content: <div style={{ paddingTop: 8 }}>Visa ending 4242 · billed annually · next invoice Jul 1.</div>,
          },
        ]}
      />
    </div>
  )
}

export function WithDisabled() {
  return (
    <div style={{ width: 480 }}>
      <Tabs
        label="Report views"
        defaultValue="summary"
        items={[
          { id: 'summary', label: 'Summary', content: <div style={{ paddingTop: 8 }}>42 active accounts · $284K total MRR.</div> },
          { id: 'segments', label: 'Segments', content: <div style={{ paddingTop: 8 }}>Enterprise 61% · Pro 28% · Starter 11%.</div> },
          { id: 'forecast', label: 'Forecast', content: <div style={{ paddingTop: 8 }}>Available on the Growth plan.</div>, disabled: true },
        ]}
      />
    </div>
  )
}
