import { useEffect } from 'react'
import { ToastProvider, useToast } from 'parts-bin'

// ToastProvider renders toasts imperatively: a child calls useToast() to push.
// We fire one on mount so the provider's fixed bottom-right container shows a
// real, themed toast in the capture.
function PushOnMount() {
  const toast = useToast()
  useEffect(() => {
    toast('Northwind Logistics moved to the Pro plan.', {
      tone: 'pos',
      title: 'Account saved',
      duration: 600000,
    })
  }, [toast])
  return (
    <div
      style={{
        minHeight: 220,
        display: 'grid',
        placeItems: 'center',
        padding: 24,
      }}
      className="text-[13px] text-muted"
    >
      Accounts dashboard — toasts appear bottom-right
    </div>
  )
}

export function WithToast() {
  return (
    <ToastProvider>
      <PushOnMount />
    </ToastProvider>
  )
}
