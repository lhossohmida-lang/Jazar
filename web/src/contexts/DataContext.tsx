import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { repo } from '../data'
import type {
  Product,
  Slaughter,
  Sale,
  Expense,
  Party,
  LedgerEntry,
  Worker,
  AppNotification,
} from '../types'

interface DataState {
  products: Product[]
  slaughters: Slaughter[]
  sales: Sale[]
  expenses: Expense[]
  parties: Party[]
  ledger: LedgerEntry[]
  workers: Worker[]
  notifications: AppNotification[]
  ready: boolean
}

const DataContext = createContext<DataState | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [slaughters, setSlaughters] = useState<Slaughter[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [parties, setParties] = useState<Party[]>([])
  const [ledger, setLedger] = useState<LedgerEntry[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const unsubs = [
      repo.subscribe<Product>('products', setProducts),
      repo.subscribe<Slaughter>('slaughters', setSlaughters),
      repo.subscribe<Sale>('sales', setSales),
      repo.subscribe<Expense>('expenses', setExpenses),
      repo.subscribe<Party>('parties', setParties),
      repo.subscribe<LedgerEntry>('ledger', setLedger),
      repo.subscribe<Worker>('workers', setWorkers),
      repo.subscribe<AppNotification>('notifications', setNotifications),
    ]
    setReady(true)
    return () => unsubs.forEach((u) => u())
  }, [])

  return (
    <DataContext.Provider
      value={{
        products,
        slaughters,
        sales,
        expenses,
        parties,
        ledger,
        workers,
        notifications,
        ready,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
