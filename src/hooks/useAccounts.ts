import { useCallback, useState } from 'react'
import type { Account } from '../data/types'
import { seedAccounts } from '../data/accounts'

export type NewAccount = Omit<Account, 'id'>

let counter = 0
const genId = () => `acct_${Date.now().toString(36)}_${(counter++).toString(36)}`

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>(seedAccounts)

  const create = useCallback((data: NewAccount) => {
    setAccounts((prev) => [{ ...data, id: genId() }, ...prev])
  }, [])

  const update = useCallback((id: string, patch: Partial<Omit<Account, 'id'>>) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  }, [])

  const remove = useCallback((id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  return { accounts, create, update, remove }
}
