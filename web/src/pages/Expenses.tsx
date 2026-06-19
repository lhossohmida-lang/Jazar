import { useMemo, useState } from 'react'
import { Plus, Wallet, Trash2, FileDown } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { repo } from '../data'
import { EXPENSE_CATEGORIES } from '../constants'
import { money, fmtDate } from '../utils/format'
import { exportToExcel } from '../utils/export'
import { Badge, EmptyState, Modal, PageHeader, StatCard } from '../components/ui'
import { startOfMonth } from '../utils/format'
import type { ExpenseCategory } from '../types'

const emptyForm = {
  category: 'rent' as ExpenseCategory,
  amount: 0,
  note: '',
  date: new Date().toISOString().slice(0, 10),
}

const toneByCat: Record<ExpenseCategory, 'gray' | 'amber' | 'blue' | 'red' | 'green'> = {
  rent: 'red',
  electricity: 'amber',
  water: 'blue',
  transport: 'gray',
  salaries: 'green',
  cleaning: 'blue',
  other: 'gray',
}

export default function Expenses() {
  const { expenses } = useData()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [filter, setFilter] = useState('')
  const [busy, setBusy] = useState(false)

  const rows = useMemo(
    () => expenses.filter((e) => (filter ? e.category === filter : true)),
    [expenses, filter],
  )

  const monthTotal = expenses
    .filter((e) => (e.createdAt ?? new Date(e.date).getTime()) >= startOfMonth())
    .reduce((a, e) => a + e.amount, 0)
  const total = expenses.reduce((a, e) => a + e.amount, 0)

  const save = async () => {
    if (!form.amount) return
    setBusy(true)
    try {
      await repo.add('expenses', {
        ...form,
        amount: Number(form.amount),
        createdAt: new Date(form.date).getTime(),
      })
      setOpen(false)
      setForm(emptyForm)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id: string) => {
    if (confirm('حذف هذا المصروف؟')) await repo.remove('expenses', id)
  }

  const exportAll = () =>
    exportToExcel(
      expenses.map((e) => ({
        التاريخ: e.date,
        التصنيف: EXPENSE_CATEGORIES[e.category],
        المبلغ: e.amount,
        ملاحظة: e.note || '',
      })),
      'المصروفات',
    )

  return (
    <div>
      <PageHeader
        title="المصروفات"
        subtitle="تسجيل ومتابعة مصاريف المحل"
        actions={
          <>
            <button onClick={exportAll} className="btn-ghost">
              <FileDown size={18} /> Excel
            </button>
            <button onClick={() => setOpen(true)} className="btn-primary">
              <Plus size={18} /> مصروف جديد
            </button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-4">
        <StatCard
          label="مصاريف هذا الشهر"
          value={money(monthTotal)}
          icon={<Wallet size={22} />}
          tone="amber"
        />
        <StatCard
          label="إجمالي المصاريف"
          value={money(total)}
          icon={<Wallet size={22} />}
          tone="dark"
        />
      </div>

      <div className="mb-4">
        <select
          className="input max-w-56"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">كل التصنيفات</option>
          {(Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[]).map((c) => (
            <option key={c} value={c}>
              {EXPENSE_CATEGORIES[c]}
            </option>
          ))}
        </select>
      </div>

      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>التصنيف</th>
              <th>المبلغ</th>
              <th>ملاحظة</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id}>
                <td className="whitespace-nowrap text-ink/60">
                  {fmtDate(e.date)}
                </td>
                <td>
                  <Badge tone={toneByCat[e.category]}>
                    {EXPENSE_CATEGORIES[e.category]}
                  </Badge>
                </td>
                <td className="font-bold text-brand-600">{money(e.amount)}</td>
                <td className="text-ink/60">{e.note || '—'}</td>
                <td>
                  <button
                    onClick={() => remove(e.id)}
                    className="btn-danger px-2 py-1.5 text-sm"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    icon={<Wallet size={26} />}
                    title="لا توجد مصاريف"
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="مصروف جديد">
        <div className="space-y-4">
          <div>
            <label className="label">التصنيف</label>
            <select
              className="input"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value as ExpenseCategory })
              }
            >
              {(Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[]).map((c) => (
                <option key={c} value={c}>
                  {EXPENSE_CATEGORIES[c]}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">المبلغ</label>
              <input
                type="number"
                className="input"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: +e.target.value })}
              />
            </div>
            <div>
              <label className="label">التاريخ</label>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">ملاحظة</label>
            <input
              className="input"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setOpen(false)} className="btn-ghost">
              إلغاء
            </button>
            <button onClick={save} disabled={busy} className="btn-primary">
              {busy ? 'جارٍ الحفظ…' : 'حفظ'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
