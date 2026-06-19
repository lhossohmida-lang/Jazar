import { useState } from 'react'
import { Plus, Users, Pencil, Trash2, FileDown, Phone } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { repo } from '../data'
import { money } from '../utils/format'
import { exportToExcel } from '../utils/export'
import { Badge, EmptyState, Modal, PageHeader } from '../components/ui'
import type { Worker } from '../types'

const emptyForm: Omit<Worker, 'id' | 'createdAt'> = {
  name: '',
  phone: '',
  position: 'جزّار',
  salary: 0,
  active: true,
}

export default function Workers() {
  const { workers } = useData()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Worker | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [busy, setBusy] = useState(false)

  const openNew = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }
  const openEdit = (w: Worker) => {
    setEditing(w)
    setForm({ ...w })
    setOpen(true)
  }

  const save = async () => {
    if (!form.name.trim()) return
    setBusy(true)
    try {
      if (editing) await repo.update('workers', editing.id, { ...form })
      else await repo.add('workers', { ...form, createdAt: Date.now() })
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (w: Worker) => {
    if (confirm(`حذف العامل "${w.name}"؟`)) await repo.remove('workers', w.id)
  }

  const exportAll = () =>
    exportToExcel(
      workers.map((w) => ({
        الاسم: w.name,
        الوظيفة: w.position,
        الهاتف: w.phone || '',
        الراتب: w.salary,
        الحالة: w.active ? 'نشط' : 'غير نشط',
      })),
      'العمال',
    )

  return (
    <div>
      <PageHeader
        title="العمال"
        subtitle="إدارة فريق العمل"
        actions={
          <>
            <button onClick={exportAll} className="btn-ghost">
              <FileDown size={18} /> Excel
            </button>
            <button onClick={openNew} className="btn-primary">
              <Plus size={18} /> عامل جديد
            </button>
          </>
        }
      />

      {workers.length === 0 ? (
        <div className="card">
          <EmptyState icon={<Users size={28} />} title="لا يوجد عمال" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workers.map((w) => (
            <div key={w.id} className="card p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-lg font-bold text-brand-600">
                  {w.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold">{w.name}</div>
                  <div className="text-sm text-ink/50">{w.position}</div>
                </div>
                {w.active ? (
                  <Badge tone="green">نشط</Badge>
                ) : (
                  <Badge tone="gray">غير نشط</Badge>
                )}
              </div>
              <div className="mt-4 space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-ink/50">الراتب</span>
                  <span className="font-bold">{money(w.salary)}</span>
                </div>
                {w.phone && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-ink/50">
                      <Phone size={14} /> الهاتف
                    </span>
                    <span dir="ltr" className="font-semibold">
                      {w.phone}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openEdit(w)}
                  className="btn-ghost flex-1 px-2 py-1.5 text-sm"
                >
                  <Pencil size={15} /> تعديل
                </button>
                <button
                  onClick={() => remove(w)}
                  className="btn-danger px-2 py-1.5 text-sm"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'تعديل عامل' : 'عامل جديد'}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">الوظيفة</label>
              <input
                className="input"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
            </div>
            <div>
              <label className="label">الراتب</label>
              <input
                type="number"
                className="input"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: +e.target.value })}
              />
            </div>
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
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="accent-brand-600"
            />
            عامل نشط
          </label>
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
