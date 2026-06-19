import { CURRENCY } from '../constants'

const nf = new Intl.NumberFormat('ar-DZ', { maximumFractionDigits: 2 })

export function money(n: number): string {
  return `${nf.format(Math.round((n + Number.EPSILON) * 100) / 100)} ${CURRENCY}`
}

export function num(n: number): string {
  return nf.format(n)
}

export function fmtDate(input: number | string | Date): string {
  const d =
    typeof input === 'number'
      ? new Date(input)
      : typeof input === 'string'
        ? new Date(input)
        : input
  return d.toLocaleDateString('ar-DZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function fmtDateTime(input: number | string | Date): string {
  const d = typeof input === 'number' ? new Date(input) : new Date(input)
  return d.toLocaleString('ar-DZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** بداية اليوم/الأسبوع/الشهر (timestamps) */
export function startOfToday(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function startOfWeek(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  // الأسبوع يبدأ السبت في كثير من الدول العربية
  const day = d.getDay() // 0=الأحد .. 6=السبت
  const diff = (day + 1) % 7 // عدد الأيام منذ السبت
  d.setDate(d.getDate() - diff)
  return d.getTime()
}

export function startOfMonth(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(1)
  return d.getTime()
}

/** مفتاح يوم YYYY-MM-DD لتجميع الرسوم البيانية */
export function dayKey(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10)
}

export function shortDay(ts: number): string {
  return new Date(ts).toLocaleDateString('ar-DZ', {
    day: '2-digit',
    month: '2-digit',
  })
}
