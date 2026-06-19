import { type ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

/** نافذة منبثقة (Modal) */
export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    if (open) document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`card my-8 w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} animate-[fadeIn_.15s_ease]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink/50 transition hover:bg-black/5 hover:text-ink"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

/** بطاقة إحصائية */
export function StatCard({
  label,
  value,
  icon,
  tone = 'brand',
  hint,
}: {
  label: string
  value: string
  icon: ReactNode
  tone?: 'brand' | 'dark' | 'green' | 'amber' | 'blue'
  hint?: string
}) {
  const tones: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600',
    dark: 'bg-zinc-100 text-ink',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
  }
  return (
    <div className="card flex items-center gap-4 p-4">
      <div className={`grid h-12 w-12 place-items-center rounded-xl ${tones[tone]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm text-ink/50">{label}</div>
        <div className="truncate text-xl font-extrabold">{value}</div>
        {hint && <div className="text-xs text-ink/40">{hint}</div>}
      </div>
    </div>
  )
}

/** عنوان صفحة موحّد */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-ink/50">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

/** حالة فارغة */
export function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-black/5 text-ink/30">
        {icon}
      </div>
      <div className="text-lg font-bold text-ink/70">{title}</div>
      {subtitle && <div className="text-sm text-ink/40">{subtitle}</div>}
    </div>
  )
}

/** شارة حالة الدفع/الذبيحة */
export function Badge({
  children,
  tone = 'gray',
}: {
  children: ReactNode
  tone?: 'gray' | 'green' | 'red' | 'amber' | 'blue'
}) {
  const tones: Record<string, string> = {
    gray: 'bg-zinc-100 text-zinc-600',
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-brand-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
  }
  return <span className={`badge ${tones[tone]}`}>{children}</span>
}
