import { useMemo, useState } from 'react'
import {
  Plus,
  HandCoins,
  Users,
  Truck,
  Trash2,
  Wallet,
  PlusCircle,
  History,
} from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { repo } from '../data'
import { addDebt, recordPayment } from '../services/operations'
import { money, fmtDate } from '../utils/format'
import { Badge, EmptyState, Modal, PageHeader, StatCard } from '../components/ui'
import type { Party, PartyType } from '../types'

export default function Debts() {
  const { parties, ledger } = useData()
  const [tab, setTab] = useState<PartyType>('customer')
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', balance: 0 })
  const [payFor, setPayFor] = useState<Party | null>(null)
  const [payAmount, setPayAmount] = useState(0)
  const [payMode, setPayMode] = useState<'payment' | 'debit'>('payment')
  const [historyFor, setHistoryFor] = useState<Party | null>(null)
  const [busy, setBusy] = useState(false)

  const list = useMemo(
    () => parties.filter((p) => p.type === tab),
    [parties, tab],
  )
  const totalDue = list.reduce((a, p) => a + p.balance, 0)

  const addParty = async () => {
    if (!form.name.trim()) return
    setBusy(true)
    try {
      await repo.add('parties', {
        name: form.name,
        phone: form.phone,
        balance: Number(form.balance) || 0,
        type: tab,
        createdAt: Date.now(),
      })
      setForm({ name: '', phone: '', balance: 0 })
      setAddOpen(false)
    } finally {
      setBusy(false)
    }
  }

  const submitPayment = async () => {
    if (!payFor || !payAmount) return
    setBusy(true)
    try {
      if (payMode === 'payment') await recordPayment(payFor, Number(payAmount))
      else await addDebt(payFor, Number(payAmount))
      setPayFor(null)
      setPayAmount(0)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (p: Party) => {
    if (confirm(`حذف "${p.name}"؟`)) await repo.remove('parties', p.id)
  }

  const entries = historyFor
    ? ledger.filter((l) => l.partyId === historyFor.id)
    : []

  return (
    <div>
      <PageHeader
        title="الديون"
        subtitle="إدارة أرصدة الزبائن والموردين"
        actions={
          <button onClick={() => setAddOpen(true)} className="btn-primary">
            <Plus size={18} /> {tab === 'customer' ? 'زبون جديد' : 'مورد جديد'}
          </button>
        }
      />

      {/* Tabs */}
      <div className="mb-5 inline-flex rounded-xl bg-black/5 p-1">
        <button
          onClick={() => setTab('customer')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
            tab === 'customer' ? 'bg-white shadow-card' : 'text-ink/60'
          }`}
        >
          <Users size={16} /> الزبائن
        </button>
        <button
          onClick={() => setTab('supplier')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
            tab === 'supplier' ? 'bg-white shadow-card' : 'text-ink/60'
          }`}
        >
          <Truck size={16} /> الموردون
        </button>
      </div>

      <div className="mb-5">
        <StatCard
          label={tab === 'customer' ? 'إجمالي مستحقات الزبائن' : 'إجمالي المستحق للموردين'}
          value={money(totalDue)}
          icon={<HandCoins size={22} />}
          tone={totalDue > 0 ? 'amber' : 'green'}
        />
      </div>

      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الهاتف</th>
              <th>{tab === 'customer' ? 'المستحق علينا' : 'المستحق له'}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td className="font-semibold">{p.name}</td>
                <td dir="ltr" className="text-right text-ink/60">
                  {p.phone || '—'}
                </td>
                <td>
                  {p.balance > 0 ? (
                    <Badge tone="amber">{money(p.balance)}</Badge>
                  ) : (
                    <Badge tone="green">مسدّد</Badge>
                  )}
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => {
                        setPayFor(p)
                        setPayMode('payment')
                        setPayAmount(0)
                      }}
                      className="btn-ghost px-2.5 py-1.5 text-sm"
                    >
                      <Wallet size={15} /> دفعة
                    </button>
                    <button
                      onClick={() => {
                        setPayFor(p)
                        setPayMode('debit')
                        setPayAmount(0)
                      }}
                      className="btn-ghost px-2.5 py-1.5 text-sm"
                    >
                      <PlusCircle size={15} /> دين
                    </button>
                    <button
                      onClick={() => setHistoryFor(p)}
                      className="btn-ghost px-2.5 py-1.5 text-sm"
                    >
                      <History size={15} /> السجل
                    </button>
                    <button
                      onClick={() => remove(p)}
                      className="btn-danger px-2 py-1.5 text-sm"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <EmptyState
                    icon={<HandCoins size={26} />}
                    title="لا توجد سجلات"
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add party */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={tab === 'customer' ? 'زبون جديد' : 'مورد جديد'}
      >
        <div className="space-y-4">
          <div>
            <label className="label">الاسم</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">الهاتف</label>
            <input
              dir="ltr"
              className="input text-right"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="label">رصيد أولي (اختياري)</label>
            <input
              type="number"
              className="input"
              value={form.balance}
              onChange={(e) => setForm({ ...form, balance: +e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setAddOpen(false)} className="btn-ghost">
              إلغاء
            </button>
            <button onClick={addParty} disabled={busy} className="btn-primary">
              {busy ? 'جارٍ الحفظ…' : 'حفظ'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Payment / debt */}
      <Modal
        open={!!payFor}
        onClose={() => setPayFor(null)}
        title={`${payMode === 'payment' ? 'تسجيل دفعة' : 'إضافة دين'} — ${payFor?.name ?? ''}`}
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-zinc-50 px-4 py-3 text-sm">
            الرصيد الحالي:{' '}
            <span className="font-bold text-brand-600">
              {money(payFor?.balance ?? 0)}
            </span>
          </div>
          <div>
            <label className="label">المبلغ</label>
            <input
              type="number"
              className="input"
              value={payAmount}
              onChange={(e) => setPayAmount(+e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setPayFor(null)} className="btn-ghost">
              إلغاء
            </button>
            <button onClick={submitPayment} disabled={busy} className="btn-primary">
              {busy ? '...' : 'تأكيد'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Ledger history */}
      <Modal
        open={!!historyFor}
        onClose={() => setHistoryFor(null)}
        title={`سجل العمليات — ${historyFor?.name ?? ''}`}
      >
        <div className="space-y-2">
          {entries.length === 0 && (
            <p className="py-6 text-center text-sm text-ink/40">
              لا توجد عمليات مسجلة
            </p>
          )}
          {entries.map((l) => (
            <div
              key={l.id}
              className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2.5"
            >
              <div>
                <div className="text-sm font-semibold">
                  {l.type === 'payment' ? 'دفعة' : 'دين'}
                </div>
                <div className="text-xs text-ink/40">
                  {fmtDate(l.date)} — {l.note}
                </div>
              </div>
              <span
                className={`font-bold ${
                  l.type === 'payment' ? 'text-emerald-600' : 'text-brand-600'
                }`}
              >
                {l.type === 'payment' ? '−' : '+'}
                {money(l.amount)}
              </span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
