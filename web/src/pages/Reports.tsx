import { useMemo, useState } from 'react'
import {
  FileBarChart,
  FileDown,
  Printer,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Banknote,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useData } from '../contexts/DataContext'
import { PageHeader, StatCard } from '../components/ui'
import { money, num, fmtDateTime, startOfMonth, startOfToday, startOfWeek } from '../utils/format'
import { topProducts } from '../utils/analytics'
import { exportToExcel, htmlTable, openPrintWindow } from '../utils/export'
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../constants'

type Period = 'today' | 'week' | 'month' | 'all'

const PERIOD_LABELS: Record<Period, string> = {
  today: 'اليوم',
  week: 'هذا الأسبوع',
  month: 'هذا الشهر',
  all: 'الكل',
}

export default function Reports() {
  const { sales, expenses } = useData()
  const [period, setPeriod] = useState<Period>('month')

  const since = useMemo(() => {
    if (period === 'today') return startOfToday()
    if (period === 'week') return startOfWeek()
    if (period === 'month') return startOfMonth()
    return 0
  }, [period])

  const periodSales = sales.filter((s) => s.createdAt >= since)
  const periodExpenses = expenses.filter(
    (e) => (e.createdAt ?? new Date(e.date).getTime()) >= since,
  )

  const totalSales = periodSales.reduce((a, s) => a + s.total, 0)
  const totalProfit = periodSales.reduce((a, s) => a + s.profit, 0)
  const totalExpenses = periodExpenses.reduce((a, e) => a + e.amount, 0)
  const net = totalProfit - totalExpenses
  const tops = topProducts(periodSales, 8)

  // مصاريف حسب التصنيف
  const expenseByCat = useMemo(() => {
    const m: Record<string, number> = {}
    for (const e of periodExpenses) {
      const label = EXPENSE_CATEGORIES[e.category]
      m[label] = (m[label] ?? 0) + e.amount
    }
    return Object.entries(m).map(([name, value]) => ({ name, 'المبلغ': Math.round(value) }))
  }, [periodExpenses])

  const exportExcel = () => {
    exportToExcel(
      periodSales.map((s) => ({
        الفاتورة: s.invoiceNo,
        التاريخ: fmtDateTime(s.createdAt),
        المبلغ: s.total,
        الربح: s.profit,
        الدفع: PAYMENT_METHODS[s.paymentMethod],
        الزبون: s.customerName || 'نقدي',
      })),
      `تقرير_المبيعات_${PERIOD_LABELS[period]}`,
    )
  }

  const printReport = () => {
    const topRows = tops.map((t) => [t.name, num(t.qty), money(t.value)])
    const catRows = expenseByCat.map((c) => [c.name, money(c['المبلغ'])])
    const body = `
      <h2>التقرير المالي — ${PERIOD_LABELS[period]}</h2>
      ${htmlTable(
        ['المؤشر', 'القيمة'],
        [
          ['إجمالي المبيعات', money(totalSales)],
          ['إجمالي الأرباح', money(totalProfit)],
          ['إجمالي المصاريف', money(totalExpenses)],
          ['عدد الفواتير', num(periodSales.length)],
        ],
        ['صافي الربح', money(net)],
      )}
      <h2 style="margin-top:24px">أفضل المنتجات مبيعاً</h2>
      ${htmlTable(['المنتج', 'الكمية', 'القيمة'], topRows)}
      ${
        catRows.length
          ? `<h2 style="margin-top:24px">المصاريف حسب التصنيف</h2>${htmlTable(
              ['التصنيف', 'المبلغ'],
              catRows,
            )}`
          : ''
      }
    `
    openPrintWindow(`تقرير ${PERIOD_LABELS[period]}`, body)
  }

  return (
    <div>
      <PageHeader
        title="التقارير"
        subtitle="ملخص الأداء المالي وتصدير التقارير"
        actions={
          <>
            <button onClick={exportExcel} className="btn-ghost">
              <FileDown size={18} /> Excel
            </button>
            <button onClick={printReport} className="btn-primary">
              <Printer size={18} /> PDF / طباعة
            </button>
          </>
        }
      />

      {/* Period selector */}
      <div className="mb-5 inline-flex rounded-xl bg-black/5 p-1">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              period === p ? 'bg-white shadow-card' : 'text-ink/60'
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="إجمالي المبيعات"
          value={money(totalSales)}
          icon={<ShoppingCart size={22} />}
          tone="brand"
          hint={`${num(periodSales.length)} فاتورة`}
        />
        <StatCard
          label="إجمالي الأرباح"
          value={money(totalProfit)}
          icon={<TrendingUp size={22} />}
          tone="green"
        />
        <StatCard
          label="إجمالي المصاريف"
          value={money(totalExpenses)}
          icon={<TrendingDown size={22} />}
          tone="amber"
        />
        <StatCard
          label="صافي الربح"
          value={money(net)}
          icon={<Banknote size={22} />}
          tone={net >= 0 ? 'green' : 'brand'}
        />
      </div>

      {/* Charts + tables */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 font-bold">أفضل المنتجات مبيعاً</h3>
          <div className="h-72" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tops.map((t) => ({ name: t.name, 'القيمة': Math.round(t.value) }))}
                layout="vertical"
                margin={{ left: 10, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip formatter={(v: number) => num(v)} />
                <Bar dataKey="القيمة" fill="#b01e1e" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 font-bold">المصاريف حسب التصنيف</h3>
          {expenseByCat.length === 0 ? (
            <p className="py-16 text-center text-sm text-ink/40">
              لا توجد مصاريف في هذه الفترة
            </p>
          ) : (
            <div className="h-72" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseByCat} margin={{ top: 5, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => num(v)} />
                  <Bar dataKey="المبلغ" fill="#0d0d0d" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Sales table */}
      <div className="mt-6">
        <h3 className="mb-3 font-bold flex items-center gap-2">
          <FileBarChart size={18} /> تفاصيل المبيعات ({num(periodSales.length)})
        </h3>
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>الفاتورة</th>
                <th>التاريخ</th>
                <th>المبلغ</th>
                <th>الربح</th>
                <th>الدفع</th>
                <th>الزبون</th>
              </tr>
            </thead>
            <tbody>
              {periodSales.slice(0, 50).map((s) => (
                <tr key={s.id}>
                  <td className="font-bold">{s.invoiceNo}</td>
                  <td className="whitespace-nowrap text-ink/60">
                    {fmtDateTime(s.createdAt)}
                  </td>
                  <td className="font-bold text-brand-600">{money(s.total)}</td>
                  <td className="text-emerald-600">{money(s.profit)}</td>
                  <td>{PAYMENT_METHODS[s.paymentMethod]}</td>
                  <td className="text-ink/60">{s.customerName || 'نقدي'}</td>
                </tr>
              ))}
              {periodSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-ink/40">
                    لا توجد مبيعات في هذه الفترة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
