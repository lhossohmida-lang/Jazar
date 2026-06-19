import { useMemo, useState } from 'react'
import {
  Plus,
  Minus,
  ShoppingCart,
  Printer,
  Search,
  Receipt,
  FileDown,
  X,
} from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { createSale } from '../services/operations'
import { PAYMENT_METHODS } from '../constants'
import { money, num, fmtDateTime } from '../utils/format'
import { Badge, EmptyState, PageHeader } from '../components/ui'
import { exportToExcel, htmlTable, openPrintWindow } from '../utils/export'
import type { PaymentMethod, Product, Sale, SaleItem } from '../types'

function printInvoice(sale: Sale) {
  const rows = sale.items.map((it) => [
    it.name,
    num(it.quantity),
    money(it.price),
    money(it.price * it.quantity),
  ])
  const body = `
    <h2>فاتورة بيع رقم ${sale.invoiceNo}</h2>
    <div class="meta">التاريخ: ${fmtDateTime(sale.createdAt)}</div>
    <div class="meta">الزبون: ${sale.customerName || 'زبون نقدي'} — الدفع: ${
      PAYMENT_METHODS[sale.paymentMethod]
    }</div>
    <div class="meta">البائع: ${sale.cashier}</div>
    ${htmlTable(
      ['المنتج', 'الكمية', 'السعر', 'المجموع'],
      rows,
      ['الإجمالي', '', '', money(sale.total)],
    )}
    <div class="total">المبلغ الإجمالي: ${money(sale.total)}</div>
  `
  openPrintWindow(`فاتورة ${sale.invoiceNo}`, body)
}

export default function Sales() {
  const { products, sales, parties } = useData()
  const { user } = useAuth()
  const [cart, setCart] = useState<SaleItem[]>([])
  const [q, setQ] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [payment, setPayment] = useState<PaymentMethod>('cash')
  const [busy, setBusy] = useState(false)

  const customers = parties.filter((p) => p.type === 'customer')
  const available = useMemo(
    () =>
      products.filter(
        (p) => p.quantity > 0 && p.name.toLowerCase().includes(q.toLowerCase()),
      ),
    [products, q],
  )

  const addToCart = (p: Product) => {
    setCart((c) => {
      const ex = c.find((i) => i.productId === p.id)
      if (ex) {
        if (ex.quantity + 1 > p.quantity) return c
        return c.map((i) =>
          i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i,
        )
      }
      return [
        ...c,
        {
          productId: p.id,
          name: p.name,
          quantity: 1,
          price: p.salePrice,
          costPrice: p.costPrice,
        },
      ]
    })
  }

  const setQty = (id: string, qty: number) => {
    const stock = products.find((p) => p.id === id)?.quantity ?? 0
    setCart((c) =>
      c
        .map((i) =>
          i.productId === id
            ? { ...i, quantity: Math.min(Math.max(0, qty), stock) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    )
  }

  const setPrice = (id: string, price: number) =>
    setCart((c) =>
      c.map((i) => (i.productId === id ? { ...i, price } : i)),
    )

  const removeItem = (id: string) =>
    setCart((c) => c.filter((i) => i.productId !== id))

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const profit = cart.reduce(
    (s, i) => s + (i.price - i.costPrice) * i.quantity,
    0,
  )

  const checkout = async () => {
    if (cart.length === 0) return
    if (payment === 'credit' && !customerId) {
      alert('اختر الزبون للبيع الآجل (الدين)')
      return
    }
    setBusy(true)
    try {
      const customer = customers.find((c) => c.id === customerId)
      await createSale(
        {
          items: cart,
          customerId: customerId || undefined,
          customerName: customer?.name,
          paymentMethod: payment,
          cashier: user?.name ?? 'مستخدم',
          cashierUid: user?.uid ?? '',
        },
        products,
        parties,
      )
      setCart([])
      setCustomerId('')
      setPayment('cash')
    } finally {
      setBusy(false)
    }
  }

  const exportSales = () => {
    exportToExcel(
      sales.map((s) => ({
        الفاتورة: s.invoiceNo,
        التاريخ: fmtDateTime(s.createdAt),
        المنتجات: s.items.map((i) => `${i.name}×${i.quantity}`).join('، '),
        المبلغ: s.total,
        الربح: s.profit,
        الزبون: s.customerName || 'نقدي',
        الدفع: PAYMENT_METHODS[s.paymentMethod],
        البائع: s.cashier,
      })),
      'المبيعات',
    )
  }

  return (
    <div>
      <PageHeader title="المبيعات" subtitle="تسجيل عمليات البيع وإصدار الفواتير" />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Product picker */}
        <div className="lg:col-span-2">
          <div className="relative mb-4">
            <Search
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/30"
              size={18}
            />
            <input
              className="input pr-10"
              placeholder="ابحث عن منتج لإضافته…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {available.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="card p-3 text-right transition hover:ring-2 hover:ring-brand-500/40"
              >
                <div className="truncate font-bold">{p.name}</div>
                <div className="text-xs text-ink/40">{p.category}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-extrabold text-brand-600">
                    {money(p.salePrice)}
                  </span>
                  <span className="text-xs text-ink/40">
                    {num(p.quantity)} {p.unit}
                  </span>
                </div>
              </button>
            ))}
            {available.length === 0 && (
              <div className="col-span-full card">
                <EmptyState
                  icon={<ShoppingCart size={26} />}
                  title="لا توجد منتجات متوفرة"
                />
              </div>
            )}
          </div>
        </div>

        {/* Cart */}
        <div className="card flex flex-col p-4 lg:sticky lg:top-4 lg:h-fit">
          <div className="mb-3 flex items-center gap-2 font-bold">
            <ShoppingCart size={20} className="text-brand-600" /> السلة
            {cart.length > 0 && (
              <span className="badge bg-brand-50 text-brand-600">
                {cart.length}
              </span>
            )}
          </div>

          <div className="mb-3 max-h-72 space-y-2 overflow-y-auto">
            {cart.length === 0 && (
              <p className="py-6 text-center text-sm text-ink/40">
                أضف منتجات من القائمة
              </p>
            )}
            {cart.map((i) => (
              <div key={i.productId} className="rounded-xl bg-zinc-50 p-2.5">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-bold">{i.name}</span>
                  <button
                    onClick={() => removeItem(i.productId)}
                    className="text-ink/30 hover:text-brand-600"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg border border-black/10 bg-white">
                    <button
                      onClick={() => setQty(i.productId, i.quantity - 1)}
                      className="px-2 py-1 text-ink/60 hover:text-brand-600"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      className="w-12 border-0 bg-transparent text-center text-sm outline-none"
                      type="number"
                      value={i.quantity}
                      onChange={(e) => setQty(i.productId, +e.target.value)}
                    />
                    <button
                      onClick={() => setQty(i.productId, i.quantity + 1)}
                      className="px-2 py-1 text-ink/60 hover:text-brand-600"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <input
                    className="w-20 rounded-lg border border-black/10 px-2 py-1 text-sm"
                    type="number"
                    value={i.price}
                    onChange={(e) => setPrice(i.productId, +e.target.value)}
                  />
                  <span className="mr-auto text-sm font-bold">
                    {money(i.price * i.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 border-t border-black/5 pt-3">
            <div>
              <label className="label">الزبون (اختياري)</label>
              <select
                className="input"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              >
                <option value="">زبون نقدي</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">طريقة الدفع</label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  Object.keys(PAYMENT_METHODS) as PaymentMethod[]
                ).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPayment(m)}
                    className={`rounded-xl border px-2 py-2 text-sm font-semibold transition ${
                      payment === m
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-black/10 text-ink/60 hover:bg-black/5'
                    }`}
                  >
                    {PAYMENT_METHODS[m]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-ink/60">
              <span>الربح المتوقع</span>
              <span className="font-bold text-emerald-600">{money(profit)}</span>
            </div>
            <div className="flex items-center justify-between text-lg font-extrabold">
              <span>الإجمالي</span>
              <span className="text-brand-600">{money(total)}</span>
            </div>

            <button
              onClick={checkout}
              disabled={busy || cart.length === 0}
              className="btn-primary w-full"
            >
              <Receipt size={18} /> {busy ? 'جارٍ الحفظ…' : 'إتمام البيع'}
            </button>
          </div>
        </div>
      </div>

      {/* Recent sales */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-bold">آخر المبيعات</h2>
        <button onClick={exportSales} className="btn-ghost">
          <FileDown size={18} /> تصدير Excel
        </button>
      </div>
      <div className="mt-3 table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>الفاتورة</th>
              <th>التاريخ</th>
              <th>المنتجات</th>
              <th>المبلغ</th>
              <th>الدفع</th>
              <th>الزبون</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sales.slice(0, 30).map((s) => (
              <tr key={s.id}>
                <td className="font-bold">{s.invoiceNo}</td>
                <td className="whitespace-nowrap text-ink/60">
                  {fmtDateTime(s.createdAt)}
                </td>
                <td className="max-w-48 truncate">
                  {s.items.map((i) => `${i.name}×${num(i.quantity)}`).join('، ')}
                </td>
                <td className="font-bold text-brand-600">{money(s.total)}</td>
                <td>
                  <Badge
                    tone={s.paymentMethod === 'credit' ? 'amber' : 'green'}
                  >
                    {PAYMENT_METHODS[s.paymentMethod]}
                  </Badge>
                </td>
                <td className="text-ink/60">{s.customerName || 'نقدي'}</td>
                <td>
                  <button
                    onClick={() => printInvoice(s)}
                    className="btn-ghost px-2 py-1.5 text-sm"
                  >
                    <Printer size={15} /> فاتورة
                  </button>
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <EmptyState
                    icon={<Receipt size={26} />}
                    title="لا توجد مبيعات بعد"
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
