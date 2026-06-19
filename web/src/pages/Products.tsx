import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Package, Search, ImagePlus, FileDown } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { repo } from '../data'
import { uploadImage } from '../services/storage'
import { PRODUCT_CATEGORIES, UNITS } from '../constants'
import { money, num } from '../utils/format'
import { exportToExcel } from '../utils/export'
import { Badge, EmptyState, Modal, PageHeader } from '../components/ui'
import type { Product } from '../types'

const empty: Omit<Product, 'id' | 'createdAt'> = {
  name: '',
  category: PRODUCT_CATEGORIES[0],
  quantity: 0,
  unit: 'كغ',
  salePrice: 0,
  costPrice: 0,
  imageUrl: '',
  lowStockThreshold: 5,
}

export default function Products() {
  const { products } = useData()
  const { isAdmin } = useAuth()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(empty)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [uploading, setUploading] = useState(false)
  const [busy, setBusy] = useState(false)

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(q.toLowerCase()) &&
          (cat ? p.category === cat : true),
      ),
    [products, q, cat],
  )

  const openNew = () => {
    setEditing(null)
    setForm(empty)
    setOpen(true)
  }
  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({ ...p })
    setOpen(true)
  }

  const onImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setForm((f) => ({ ...f, imageUrl: url }))
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    if (!form.name.trim()) return
    setBusy(true)
    try {
      if (editing) {
        await repo.update('products', editing.id, { ...form })
      } else {
        await repo.add('products', { ...form, createdAt: Date.now() })
      }
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (p: Product) => {
    if (confirm(`حذف المنتج "${p.name}"؟`)) await repo.remove('products', p.id)
  }

  const doExport = () => {
    exportToExcel(
      filtered.map((p) => ({
        الاسم: p.name,
        الفئة: p.category,
        الكمية: p.quantity,
        الوحدة: p.unit,
        'سعر البيع': p.salePrice,
        'سعر التكلفة': p.costPrice,
        'حد التنبيه': p.lowStockThreshold,
      })),
      'المنتجات',
    )
  }

  return (
    <div>
      <PageHeader
        title="المنتجات"
        subtitle={`${num(products.length)} منتج`}
        actions={
          <>
            <button onClick={doExport} className="btn-ghost">
              <FileDown size={18} /> Excel
            </button>
            {isAdmin && (
              <button onClick={openNew} className="btn-primary">
                <Plus size={18} /> منتج جديد
              </button>
            )}
          </>
        }
      />

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/30"
            size={18}
          />
          <input
            className="input pr-10"
            placeholder="بحث عن منتج…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          className="input max-w-48"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
        >
          <option value="">كل الفئات</option>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Package size={28} />}
            title="لا توجد منتجات"
            subtitle="أضف منتجاً جديداً للبدء"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((p) => {
            const lowStock = p.quantity <= p.lowStockThreshold
            return (
              <div key={p.id} className="card overflow-hidden">
                <div className="relative aspect-video bg-zinc-100">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-ink/20">
                      <Package size={36} />
                    </div>
                  )}
                  <span className="absolute right-2 top-2">
                    {lowStock ? (
                      <Badge tone="red">منخفض</Badge>
                    ) : (
                      <Badge tone="green">متوفر</Badge>
                    )}
                  </span>
                </div>
                <div className="p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-bold">{p.name}</div>
                      <div className="text-xs text-ink/40">{p.category}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <div>
                      <div className="text-lg font-extrabold text-brand-600">
                        {money(p.salePrice)}
                      </div>
                      <div className="text-xs text-ink/40">
                        التكلفة {money(p.costPrice)}
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold">
                        {num(p.quantity)} {p.unit}
                      </div>
                      <div className="text-xs text-ink/40">المتوفر</div>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="btn-ghost flex-1 px-2 py-1.5 text-sm"
                      >
                        <Pencil size={15} /> تعديل
                      </button>
                      <button
                        onClick={() => remove(p)}
                        className="btn-danger px-2 py-1.5 text-sm"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'تعديل منتج' : 'منتج جديد'}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-zinc-100">
              {form.imageUrl ? (
                <img src={form.imageUrl} className="h-full w-full object-cover" />
              ) : (
                <Package className="text-ink/20" size={28} />
              )}
            </div>
            <label className="btn-ghost cursor-pointer text-sm">
              <ImagePlus size={16} />
              {uploading ? 'جارٍ الرفع…' : 'صورة المنتج'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onImage}
              />
            </label>
          </div>
          <div>
            <label className="label">اسم المنتج</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">الفئة</label>
              <select
                className="input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">الوحدة</label>
              <select
                className="input"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              >
                {UNITS.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">سعر البيع</label>
              <input
                type="number"
                className="input"
                value={form.salePrice}
                onChange={(e) =>
                  setForm({ ...form, salePrice: +e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">سعر التكلفة</label>
              <input
                type="number"
                className="input"
                value={form.costPrice}
                onChange={(e) =>
                  setForm({ ...form, costPrice: +e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">الكمية المتوفرة</label>
              <input
                type="number"
                className="input"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: +e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">حد التنبيه</label>
              <input
                type="number"
                className="input"
                value={form.lowStockThreshold}
                onChange={(e) =>
                  setForm({ ...form, lowStockThreshold: +e.target.value })
                }
              />
            </div>
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
