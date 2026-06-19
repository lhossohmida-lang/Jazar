import type { Sale, Expense, Product, Slaughter } from '../types'
import { ANIMAL_TYPES } from '../constants'
import { dayKey, shortDay, startOfMonth, startOfToday, startOfWeek } from './format'

export function sumSales(sales: Sale[], since: number): number {
  return sales.filter((s) => s.createdAt >= since).reduce((a, s) => a + s.total, 0)
}

export function sumProfit(sales: Sale[], since: number): number {
  return sales
    .filter((s) => s.createdAt >= since)
    .reduce((a, s) => a + s.profit, 0)
}

export function sumExpenses(expenses: Expense[], since: number): number {
  return expenses
    .filter((e) => (e.createdAt ?? new Date(e.date).getTime()) >= since)
    .reduce((a, e) => a + e.amount, 0)
}

export interface DashboardStats {
  salesToday: number
  salesWeek: number
  salesMonth: number
  profitMonth: number
  expensesMonth: number
  netMonth: number
}

export function computeStats(sales: Sale[], expenses: Expense[]): DashboardStats {
  const today = startOfToday()
  const week = startOfWeek()
  const month = startOfMonth()
  const profitMonth = sumProfit(sales, month)
  const expensesMonth = sumExpenses(expenses, month)
  return {
    salesToday: sumSales(sales, today),
    salesWeek: sumSales(sales, week),
    salesMonth: sumSales(sales, month),
    profitMonth,
    expensesMonth,
    netMonth: profitMonth - expensesMonth,
  }
}

/** سلسلة زمنية لآخر N يوم: مبيعات + أرباح */
export function timeSeries(sales: Sale[], days = 14) {
  const map = new Map<string, { sales: number; profit: number }>()
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  for (let i = days - 1; i >= 0; i--) {
    const ts = now.getTime() - i * 86400000
    map.set(dayKey(ts), { sales: 0, profit: 0 })
  }
  for (const s of sales) {
    const k = dayKey(s.createdAt)
    const row = map.get(k)
    if (row) {
      row.sales += s.total
      row.profit += s.profit
    }
  }
  return Array.from(map.entries()).map(([k, v]) => ({
    day: shortDay(new Date(k).getTime()),
    'المبيعات': Math.round(v.sales),
    'الأرباح': Math.round(v.profit),
  }))
}

/** أفضل المنتجات مبيعاً (بالقيمة) */
export function topProducts(sales: Sale[], limit = 6) {
  const map = new Map<string, { name: string; value: number; qty: number }>()
  for (const s of sales) {
    for (const it of s.items) {
      const cur = map.get(it.productId) ?? {
        name: it.name,
        value: 0,
        qty: 0,
      }
      cur.value += it.price * it.quantity
      cur.qty += it.quantity
      map.set(it.productId, cur)
    }
  }
  return Array.from(map.values())
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}

/** مقارنة الإيرادات حسب نوع الذبيحة (تكلفة الشراء كمؤشر) */
export function animalComparison(slaughters: Slaughter[]) {
  const map: Record<string, number> = { sheep: 0, calf: 0, chicken: 0 }
  for (const s of slaughters) {
    map[s.type] = (map[s.type] ?? 0) + s.totalCost
  }
  return (Object.keys(ANIMAL_TYPES) as Array<keyof typeof ANIMAL_TYPES>).map(
    (k) => ({
      name: ANIMAL_TYPES[k],
      'التكلفة': Math.round(map[k] ?? 0),
      count: slaughters.filter((s) => s.type === k).length,
    }),
  )
}

/** المنتجات منخفضة/نافدة المخزون */
export function lowStock(products: Product[]) {
  return products.filter((p) => p.quantity <= p.lowStockThreshold)
}

export const CHART_COLORS = [
  '#b01e1e',
  '#0d0d0d',
  '#d23f3f',
  '#8f1414',
  '#e56a6a',
  '#5c0f0f',
  '#f1a0a0',
]
