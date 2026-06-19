import { useMemo, useState } from 'react'
import { Plus, Beef, Scissors, FileDown, Trash2, Eye } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { repo } from '../data'
import { butcherSlaughter } from '../services/operations'
import { ANIMAL_TYPES, CUT_KEYS, CUT_LABELS } from '../constants'
import { money, num, fmtDate } from '../utils/format'
import { exportToExcel } from '../utils/export'
import { Badge, EmptyState, Modal, PageHeader } from '../components/ui'
import type { AnimalType, Cuts, Slaughter } from '../types'

const emptyForm = {
  number: '',
  type: 'sheep' as AnimalType,
  supplierId: '',
  supplierName: '',
  purchaseDate: new Date().toISOString().slice(0, 10),
  liveWeight: 0,
  purchasePrice: 0,
  transportCost: 0,
  slaughterCost: 0,
  note: '',
}

export default function Slaughters() {
  const { slaughters, parties, products } = useData()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [busy, setBusy] = useState(false)

  const [butcherFor, setButcherFor] = useState<Slaughter | null>(null)
  const [cuts, setCuts] = useState<Cuts>({})
  const [viewing, setViewing] = useState<Slaughter | null>(null)

  const suppliers = parties.filter((p) => p.type === 'supplier')

  const totalCost = useMemo(
    () =>
      Number(form.purchasePrice) +
      Number(form.transportCost) +
      Number(form.slaughterCost),
    [form],
  )

  const nextNumber = useMemo(() => {
    const max = slaughters.reduce((m, s) => {
      const n = parseInt(s.number.replace(/\D/g, ''), 10)
      return isNaN(n) ? m : Math.max(m, n)
    }, 1000)
    return `ذ-${max + 1}`
  }, [slaughters])

  const openNew = () => {
    setForm({ ...emptyForm, number: nextNumber })
    setOpen(true)
  }

  const save = async () => {
    if (!form.supplierName && !form.supplierId) {
      alert('اختر المورد')
      return
    }
    setBusy(true)
    try {
      const supplier = suppliers.find((s) => s.id === form.supplierId)
      const slaughter: Omit<Slaughter, 'id'> = {
        number: form.number || nextNumber,
        type: form.type,
        supplierId: form.supplierId || undefined,
        supplierName: supplier?.name || form.supplierName,
        purchaseDate: form.purchaseDate,
        liveWeight: Number(form.liveWeight),
        purchasePrice: Number(form.purchasePrice),
        transportCost: Number(form.transportCost),
        slaughterCost: Number(form.slaughterCost),
        status: 'pending',
        cuts: {},
        totalCost,
        note: form.note,
        createdAt: Date.now(),
      }
      await repo.add('slaughters', slaughter)
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  const startButcher = (s: Slaughter) => {
    setButcherFor(s)
    setCuts(s.cuts || {})
  }

  const confirmButcher = async () => {
    if (!butcherFor) return
    setBusy(true)
    try {
      await butcherSlaughter(butcherFor, cuts, products)
      setButcherFor(null)
      setCuts({})
    } finally {
      setBusy(false)
    }
  }

  const remove = async (s: Slaughter) => {
    if (confirm(`حذف الذبيحة ${s.number}؟`)) await repo.remove('slaughters', s.id)
  }

  const exportAll = () =>
    exportToExcel(
      slaughters.map((s) => ({
        الرقم: s.number,
        النوع: ANIMAL_TYPES[s.type],
        المورد: s.supplierName,
        'تاريخ الشراء': s.purchaseDate,
        'الوزن الحي': s.liveWeight,
        'سعر الشراء': s.purchasePrice,
        النقل: s.transportCost,
        الذبح: s.slaughterCost,
        'إجمالي التكلفة': s.totalCost,
        الحالة: s.status === 'butchered' ? 'مذبوحة' : 'قيد الانتظار',
      })),
      'الذبائح',
    )

  return (
    <div>
      <PageHeader
        title="الذبائح"
        subtitle="تسجيل المشتريات (خروف / عجل / دجاج) ومخرجات الذبح"
        actions={
          <>
            <button onClick={exportAll} className="btn-ghost">
              <FileDown size={18} /> Excel
            </button>
            <button onClick={openNew} className="btn-primary">
              <Plus size={18} /> ذبيحة جديدة
            </button>
          </>
        }
      />

      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>الرقم</th>
              <th>النوع</th>
              <th>المورد</th>
              <th>التاريخ</th>
              <th>الوزن الحي</th>
              <th>التكلفة الإجمالية</th>
              <th>الحالة</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {slaughters.map((s) => (
              <tr key={s.id}>
                <td className="font-bold">{s.number}</td>
                <td>
                  <Badge tone="blue">{ANIMAL_TYPES[s.type]}</Badge>
                </td>
                <td className="text-ink/70">{s.supplierName}</td>
                <td className="whitespace-nowrap text-ink/60">
                  {fmtDate(s.purchaseDate)}
                </td>
                <td>{num(s.liveWeight)} كغ</td>
                <td className="font-bold text-brand-600">
                  {money(s.totalCost)}
                </td>
                <td>
                  {s.status === 'butchered' ? (
                    <Badge tone="green">مذبوحة</Badge>
                  ) : (
                    <Badge tone="amber">قيد الانتظار</Badge>
                  )}
                </td>
                <td>
                  <div className="flex gap-1">
                    {s.status === 'pending' ? (
                      <button
                        onClick={() => startButcher(s)}
                        className="btn-primary px-2.5 py-1.5 text-sm"
                      >
                        <Scissors size={15} /> ذبح
                      </button>
                    ) : (
                      <button
                        onClick={() => setViewing(s)}
                        className="btn-ghost px-2.5 py-1.5 text-sm"
                      >
                        <Eye size={15} /> المخرجات
                      </button>
                    )}
                    <button
                      onClick={() => remove(s)}
                      className="btn-danger px-2 py-1.5 text-sm"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {slaughters.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <EmptyState
                    icon={<Beef size={28} />}
                    title="لا توجد ذبائح"
                    subtitle="ابدأ بتسجيل ذبيحة جديدة"
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New slaughter modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="تسجيل ذبيحة جديدة" wide>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">رقم الذبيحة</label>
            <input
              className="input"
              value={form.number}
              onChange={(e) => setForm({ ...form, number: e.target.value })}
            />
          </div>
          <div>
            <label className="label">النوع</label>
            <select
              className="input"
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as AnimalType })
              }
            >
              {(Object.keys(ANIMAL_TYPES) as AnimalType[]).map((t) => (
                <option key={t} value={t}>
                  {ANIMAL_TYPES[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">المورد</label>
            <select
              className="input"
              value={form.supplierId}
              onChange={(e) =>
                setForm({ ...form, supplierId: e.target.value })
              }
            >
              <option value="">— اختر مورد —</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">تاريخ الشراء</label>
            <input
              type="date"
              className="input"
              value={form.purchaseDate}
              onChange={(e) =>
                setForm({ ...form, purchaseDate: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">الوزن الحي (كغ)</label>
            <input
              type="number"
              className="input"
              value={form.liveWeight}
              onChange={(e) =>
                setForm({ ...form, liveWeight: +e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">سعر الشراء</label>
            <input
              type="number"
              className="input"
              value={form.purchasePrice}
              onChange={(e) =>
                setForm({ ...form, purchasePrice: +e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">تكلفة النقل</label>
            <input
              type="number"
              className="input"
              value={form.transportCost}
              onChange={(e) =>
                setForm({ ...form, transportCost: +e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">تكلفة الذبح</label>
            <input
              type="number"
              className="input"
              value={form.slaughterCost}
              onChange={(e) =>
                setForm({ ...form, slaughterCost: +e.target.value })
              }
            />
          </div>
          <div className="col-span-2">
            <label className="label">ملاحظة</label>
            <input
              className="input"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
          <span className="font-semibold text-brand-700">التكلفة الإجمالية</span>
          <span className="text-xl font-extrabold text-brand-700">
            {money(totalCost)}
          </span>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => setOpen(false)} className="btn-ghost">
            إلغاء
          </button>
          <button onClick={save} disabled={busy} className="btn-primary">
            {busy ? 'جارٍ الحفظ…' : 'حفظ الذبيحة'}
          </button>
        </div>
      </Modal>

      {/* Butcher modal */}
      <Modal
        open={!!butcherFor}
        onClose={() => setButcherFor(null)}
        title={`إدخال مخرجات الذبح — ${butcherFor?.number ?? ''}`}
        wide
      >
        <p className="mb-4 text-sm text-ink/50">
          أدخل كمية كل جزء (بالكيلوغرام أو العدد). سيُضاف تلقائياً إلى المخزون.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CUT_KEYS.map((key) => (
            <div key={key}>
              <label className="label">{CUT_LABELS[key]}</label>
              <input
                type="number"
                step="0.1"
                className="input"
                value={cuts[key] ?? ''}
                onChange={(e) =>
                  setCuts((c) => ({
                    ...c,
                    [key]: e.target.value === '' ? undefined : +e.target.value,
                  }))
                }
              />
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={() => setButcherFor(null)} className="btn-ghost">
            إلغاء
          </button>
          <button onClick={confirmButcher} disabled={busy} className="btn-primary">
            <Scissors size={18} />
            {busy ? 'جارٍ التحديث…' : 'تأكيد وتحديث المخزون'}
          </button>
        </div>
      </Modal>

      {/* View cuts modal */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={`مخرجات الذبيحة — ${viewing?.number ?? ''}`}
      >
        {viewing && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CUT_KEYS.filter((k) => viewing.cuts[k]).map((k) => (
              <div
                key={k}
                className="rounded-xl bg-zinc-50 p-3 text-center"
              >
                <div className="text-xs text-ink/50">{CUT_LABELS[k]}</div>
                <div className="text-lg font-bold">{num(viewing.cuts[k]!)}</div>
              </div>
            ))}
            {CUT_KEYS.every((k) => !viewing.cuts[k]) && (
              <p className="col-span-full text-sm text-ink/40">
                لا توجد مخرجات مسجلة
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
