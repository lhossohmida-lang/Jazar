import {
  ShoppingCart,
  TrendingUp,
  Wallet,
  Banknote,
  Beef,
  Boxes,
  AlertTriangle,
  CalendarDays,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { PageHeader, StatCard } from '../components/ui'
import { money, num } from '../utils/format'
import {
  CHART_COLORS,
  animalComparison,
  computeStats,
  lowStock,
  timeSeries,
  topProducts,
} from '../utils/analytics'

function ChartCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="card p-5">
      <h3 className="mb-4 font-bold text-ink">{title}</h3>
      <div className="h-64" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { sales, expenses, products, slaughters } = useData()
  const { isAdmin, user } = useAuth()

  const stats = computeStats(sales, expenses)
  const series = timeSeries(sales, 14)
  const tops = topProducts(sales)
  const animals = animalComparison(slaughters)
  const low = lowStock(products)
  const totalStock = products.reduce((a, p) => a + p.quantity, 0)
  const soldSlaughters = slaughters.filter((s) => s.status === 'butchered').length

  return (
    <div>
      <PageHeader
        title={`أهلاً، ${user?.name} 👋`}
        subtitle="نظرة عامة على أداء الجزارة"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="مبيعات اليوم"
          value={money(stats.salesToday)}
          icon={<ShoppingCart size={22} />}
          tone="brand"
        />
        <StatCard
          label="مبيعات الأسبوع"
          value={money(stats.salesWeek)}
          icon={<CalendarDays size={22} />}
          tone="blue"
        />
        <StatCard
          label="مبيعات الشهر"
          value={money(stats.salesMonth)}
          icon={<TrendingUp size={22} />}
          tone="dark"
        />
        {isAdmin ? (
          <StatCard
            label="صافي الربح (الشهر)"
            value={money(stats.netMonth)}
            icon={<Banknote size={22} />}
            tone={stats.netMonth >= 0 ? 'green' : 'amber'}
            hint={`ربح ${num(stats.profitMonth)} − مصاريف ${num(stats.expensesMonth)}`}
          />
        ) : (
          <StatCard
            label="إجمالي المخزون"
            value={`${num(totalStock)} وحدة`}
            icon={<Boxes size={22} />}
            tone="green"
          />
        )}
      </div>

      {isAdmin && (
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="مصاريف الشهر"
            value={money(stats.expensesMonth)}
            icon={<Wallet size={22} />}
            tone="amber"
          />
          <StatCard
            label="ذبائح مذبوحة"
            value={num(soldSlaughters)}
            icon={<Beef size={22} />}
            tone="brand"
          />
          <StatCard
            label="إجمالي المخزون"
            value={`${num(totalStock)} وحدة`}
            icon={<Boxes size={22} />}
            tone="blue"
          />
          <StatCard
            label="تنبيهات المخزون"
            value={num(low.length)}
            icon={<AlertTriangle size={22} />}
            tone={low.length ? 'amber' : 'green'}
          />
        </div>
      )}

      {/* Low stock alert */}
      {low.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="text-amber-600" size={20} />
          <span className="font-bold text-amber-700">منتجات تحتاج تموين:</span>
          {low.map((p) => (
            <span
              key={p.id}
              className="badge bg-white text-amber-700 ring-1 ring-amber-200"
            >
              {p.name} ({num(p.quantity)} {p.unit})
            </span>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="تطور المبيعات (آخر 14 يوم)">
          <AreaChart data={series} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b01e1e" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#b01e1e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="المبيعات"
              stroke="#b01e1e"
              strokeWidth={2}
              fill="url(#gSales)"
            />
          </AreaChart>
        </ChartCard>

        {isAdmin && (
          <ChartCard title="تطور الأرباح (آخر 14 يوم)">
            <LineChart data={series} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="الأرباح"
                stroke="#0d0d0d"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ChartCard>
        )}

        <ChartCard title="توزيع الإيرادات حسب المنتجات">
          <PieChart>
            <Pie
              data={tops}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={(e) => e.name}
            >
              {tops.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => num(v)} />
          </PieChart>
        </ChartCard>

        {isAdmin && (
          <ChartCard title="مقارنة الذبائح (خرفان / عجول / دجاج)">
            <BarChart data={animals} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="التكلفة" radius={[6, 6, 0, 0]}>
                {animals.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartCard>
        )}
      </div>

      {/* Top products list */}
      <div className="mt-6 card p-5">
        <h3 className="mb-4 font-bold">أفضل المنتجات مبيعاً</h3>
        <div className="space-y-3">
          {tops.length === 0 && (
            <p className="text-sm text-ink/40">لا توجد مبيعات بعد</p>
          )}
          {tops.map((p, i) => {
            const max = tops[0]?.value || 1
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-50 text-sm font-bold text-brand-600">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-ink/50">
                      {num(p.qty)} وحدة • {money(p.value)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-black/5">
                    <div
                      className="h-full rounded-full bg-brand-600"
                      style={{ width: `${(p.value / max) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
