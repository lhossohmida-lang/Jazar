import { useMemo, useState } from 'react'
import { Boxes, FileDown, Search, AlertTriangle, PackageCheck } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { repo } from '../data'
import { money, num } from '../utils/format'
import { exportToExcel } from '../utils/export'
import { Badge, EmptyState, PageHeader, StatCard } from '../components/ui'

export default function Inventory() {
  const { products } = useData()
  const { isAdmin } = useAuth()
  const [q, setQ] = useState('')
  const [onlyLow, setOnlyLow] = useState(false)

  const rows = useMemo(
    () =>
      products
        .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
        .filter((p) => (onlyLow ? p.quantity <= p.lowStockThreshold : true)),
    [products, q, onlyLow],
  )

  const totalUnits = products.reduce((a, p) => a + p.quantity, 0)
  const stockValue = products.reduce((a, p) => a + p.quantity * p.costPrice, 0)
  const lowCount = products.filter((p) => p.quantity <= p.lowStockThreshold).length

  const adjust = async (id: string, delta: number, current: number) => {
    await repo.update('products', id, { quantity: Math.max(0, current + delta) })
  }

  const exportStock = () =>
    exportToExcel(
      products.map((p) => ({
        المنتج: p.name,
        الفئة: p.category,
        الكمية: p.quantity,
        الوحدة: p.unit,
        'قيمة المخزون': p.quantity * p.costPrice,
        الحالة:
          p.quantity <= 0
            ? 'نفد'
            : p.quantity <= p.lowStockThreshold
              ? 'منخفض'
              : 'متوفر',
      })),
      'المخزون',
    )

  return (
    <div>
      <PageHeader
        title="المخزون"
        subtitle="متابعة الكميات المتوفرة وقيمة المخزون"
        actions={
          <button onClick={exportStock} className="btn-ghost">
            <FileDown size={18} /> Excel
          </button>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="إجمالي الوحدات"
          value={`${num(totalUnits)}`}
          icon={<Boxes size={22} />}
          tone="blue"
        />
        <StatCard
          label="قيمة المخزون (بالتكلفة)"
          value={money(stockValue)}
          icon={<PackageCheck size={22} />}
          tone="green"
        />
        <StatCard
          label="منتجات تحتاج تموين"
          value={num(lowCount)}
          icon={<AlertTriangle size={22} />}
          tone={lowCount ? 'amber' : 'green'}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/30"
            size={18}
          />
          <input
            className="input pr-10"
            placeholder="بحث…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm font-semibold">
          <input
            type="checkbox"
            checked={onlyLow}
            onChange={(e) => setOnlyLow(e.target.checked)}
            className="accent-brand-600"
          />
          المنخفض فقط
        </label>
      </div>

      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>المنتج</th>
              <th>الفئة</th>
              <th>الكمية</th>
              <th>قيمة المخزون</th>
              <th>الحالة</th>
              {isAdmin && <th>تعديل سريع</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const status =
                p.quantity <= 0
                  ? { label: 'نفد', tone: 'red' as const }
                  : p.quantity <= p.lowStockThreshold
                    ? { label: 'منخفض', tone: 'amber' as const }
                    : { label: 'متوفر', tone: 'green' as const }
              return (
                <tr key={p.id}>
                  <td className="font-semibold">{p.name}</td>
                  <td className="text-ink/60">{p.category}</td>
                  <td>
                    <span className="font-bold">
                      {num(p.quantity)} {p.unit}
                    </span>
                  </td>
                  <td>{money(p.quantity * p.costPrice)}</td>
                  <td>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </td>
                  {isAdmin && (
                    <td>
                      <div className="flex gap-1">
                        <button
                          onClick={() => adjust(p.id, -1, p.quantity)}
                          className="h-8 w-8 rounded-lg bg-black/5 font-bold hover:bg-black/10"
                        >
                          −
                        </button>
                        <button
                          onClick={() => adjust(p.id, +1, p.quantity)}
                          className="h-8 w-8 rounded-lg bg-brand-50 font-bold text-brand-600 hover:bg-brand-100"
                        >
                          +
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 6 : 5}>
                  <EmptyState
                    icon={<Boxes size={26} />}
                    title="لا توجد عناصر"
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
