import type {
  Product,
  Slaughter,
  Sale,
  Expense,
  Party,
  Worker,
  AppNotification,
} from '../types'

const DAY = 24 * 60 * 60 * 1000

/** يبني بيانات تجريبية واقعية لعرض كل الشاشات فوراً */
export function buildSeed(): Record<string, Array<Record<string, unknown>>> {
  const now = Date.now()
  const daysAgo = (d: number) => now - d * DAY
  const iso = (d: number) => new Date(daysAgo(d)).toISOString().slice(0, 10)

  const products: Product[] = [
    { id: 'p_premium', name: 'لحم خروف ممتاز', category: 'لحم ممتاز', quantity: 42, unit: 'كغ', salePrice: 1800, costPrice: 1350, lowStockThreshold: 15, createdAt: daysAgo(20) },
    { id: 'p_regular', name: 'لحم عجل عادي', category: 'لحم عادي', quantity: 8, unit: 'كغ', salePrice: 1400, costPrice: 1050, lowStockThreshold: 15, createdAt: daysAgo(20) },
    { id: 'p_liver', name: 'كبد طازج', category: 'كبد', quantity: 6, unit: 'كغ', salePrice: 1600, costPrice: 1100, lowStockThreshold: 8, createdAt: daysAgo(18) },
    { id: 'p_heart', name: 'قلب', category: 'قلب', quantity: 4, unit: 'كغ', salePrice: 900, costPrice: 600, lowStockThreshold: 5, createdAt: daysAgo(18) },
    { id: 'p_tripe', name: 'كرشة منظفة', category: 'كرشة', quantity: 12, unit: 'كغ', salePrice: 700, costPrice: 400, lowStockThreshold: 6, createdAt: daysAgo(15) },
    { id: 'p_fat', name: 'شحمة', category: 'شحمة', quantity: 9, unit: 'كغ', salePrice: 500, costPrice: 300, lowStockThreshold: 5, createdAt: daysAgo(15) },
    { id: 'p_bones', name: 'عظام للمرق', category: 'عظام', quantity: 25, unit: 'كغ', salePrice: 300, costPrice: 150, lowStockThreshold: 10, createdAt: daysAgo(15) },
    { id: 'p_chicken', name: 'دجاج كامل', category: 'دجاج', quantity: 3, unit: 'قطعة', salePrice: 650, costPrice: 480, lowStockThreshold: 10, createdAt: daysAgo(10) },
    { id: 'p_head', name: 'رأس خروف', category: 'رأس', quantity: 5, unit: 'قطعة', salePrice: 800, costPrice: 500, lowStockThreshold: 3, createdAt: daysAgo(12) },
    { id: 'p_legs', name: 'أرجل (أكارع)', category: 'أرجل', quantity: 18, unit: 'قطعة', salePrice: 250, costPrice: 120, lowStockThreshold: 8, createdAt: daysAgo(12) },
  ]

  const parties: Party[] = [
    { id: 'c1', name: 'مطعم الأصيل', phone: '0550112233', balance: 12500, type: 'customer', createdAt: daysAgo(40) },
    { id: 'c2', name: 'الحاج عبد القادر', phone: '0661445566', balance: 3200, type: 'customer', createdAt: daysAgo(35) },
    { id: 'c3', name: 'زبون نقدي', phone: '', balance: 0, type: 'customer', createdAt: daysAgo(35) },
    { id: 's1', name: 'مزرعة النور للأغنام', phone: '0770998877', balance: 45000, type: 'supplier', createdAt: daysAgo(50) },
    { id: 's2', name: 'مورد الدواجن — سعيد', phone: '0540332211', balance: 0, type: 'supplier', createdAt: daysAgo(48) },
  ]

  const slaughters: Slaughter[] = [
    {
      id: 'sl1', number: 'ذ-1001', type: 'sheep', supplierId: 's1', supplierName: 'مزرعة النور للأغنام',
      purchaseDate: iso(6), liveWeight: 38, purchasePrice: 38000, transportCost: 1500, slaughterCost: 800,
      status: 'butchered', totalCost: 40300,
      cuts: { premiumMeat: 14, regularMeat: 6, liver: 1.2, heart: 0.4, tripe: 2, fat: 1.5, head: 1, legs: 4, bones: 5 },
      createdAt: daysAgo(6),
    },
    {
      id: 'sl2', number: 'ذ-1002', type: 'calf', supplierId: 's1', supplierName: 'مزرعة النور للأغنام',
      purchaseDate: iso(3), liveWeight: 180, purchasePrice: 165000, transportCost: 4000, slaughterCost: 2500,
      status: 'butchered', totalCost: 171500,
      cuts: { premiumMeat: 60, regularMeat: 38, liver: 4, heart: 1.5, tripe: 8, fat: 6, head: 1, legs: 4, bones: 22 },
      createdAt: daysAgo(3),
    },
    {
      id: 'sl3', number: 'ذ-1003', type: 'chicken', supplierId: 's2', supplierName: 'مورد الدواجن — سعيد',
      purchaseDate: iso(1), liveWeight: 60, purchasePrice: 26000, transportCost: 800, slaughterCost: 1200,
      status: 'pending', totalCost: 28000, cuts: {},
      createdAt: daysAgo(1),
    },
  ]

  // توليد مبيعات موزّعة على آخر 30 يوماً
  const sales: Sale[] = []
  const saleTemplates = [
    { productId: 'p_premium', name: 'لحم خروف ممتاز', price: 1800, costPrice: 1350 },
    { productId: 'p_regular', name: 'لحم عجل عادي', price: 1400, costPrice: 1050 },
    { productId: 'p_liver', name: 'كبد طازج', price: 1600, costPrice: 1100 },
    { productId: 'p_chicken', name: 'دجاج كامل', price: 650, costPrice: 480 },
    { productId: 'p_tripe', name: 'كرشة منظفة', price: 700, costPrice: 400 },
  ]
  let inv = 5000
  for (let d = 29; d >= 0; d--) {
    const count = 1 + Math.floor(Math.random() * 3)
    for (let k = 0; k < count; k++) {
      const t = saleTemplates[Math.floor(Math.random() * saleTemplates.length)]
      const qty = 1 + Math.round(Math.random() * 4 * 10) / 10
      const total = Math.round(t.price * qty)
      const profit = Math.round((t.price - t.costPrice) * qty)
      inv++
      sales.push({
        id: 'sale_' + inv,
        invoiceNo: 'F-' + inv,
        items: [{ productId: t.productId, name: t.name, quantity: qty, price: t.price, costPrice: t.costPrice }],
        total,
        profit,
        customerName: Math.random() > 0.6 ? 'مطعم الأصيل' : 'زبون نقدي',
        paymentMethod: Math.random() > 0.7 ? 'credit' : 'cash',
        cashier: Math.random() > 0.5 ? 'المدير' : 'كريم العامل',
        cashierUid: 'demo',
        createdAt: daysAgo(d) - Math.floor(Math.random() * DAY),
      })
    }
  }

  const expenses: Expense[] = [
    { id: 'e1', category: 'rent', amount: 35000, note: 'إيجار المحل — الشهر الحالي', date: iso(5), createdAt: daysAgo(5) },
    { id: 'e2', category: 'electricity', amount: 8500, note: 'فاتورة الكهرباء', date: iso(8), createdAt: daysAgo(8) },
    { id: 'e3', category: 'salaries', amount: 45000, note: 'رواتب العمال', date: iso(2), createdAt: daysAgo(2) },
    { id: 'e4', category: 'transport', amount: 3000, note: 'نقل ذبيحة', date: iso(3), createdAt: daysAgo(3) },
    { id: 'e5', category: 'cleaning', amount: 2000, note: 'مواد تنظيف', date: iso(10), createdAt: daysAgo(10) },
    { id: 'e6', category: 'water', amount: 1800, note: 'فاتورة الماء', date: iso(12), createdAt: daysAgo(12) },
  ]

  const workers: Worker[] = [
    { id: 'w1', name: 'كريم العامل', phone: '0551234567', position: 'جزّار', salary: 35000, active: true, createdAt: daysAgo(60) },
    { id: 'w2', name: 'يوسف', phone: '0667654321', position: 'مساعد', salary: 25000, active: true, createdAt: daysAgo(45) },
    { id: 'w3', name: 'محمد', phone: '', position: 'كاشير', salary: 28000, active: false, createdAt: daysAgo(120) },
  ]

  const notifications: AppNotification[] = [
    { id: 'n1', title: 'مخزون منخفض', body: 'دجاج كامل: الكمية المتبقية 3 فقط', type: 'stock', read: false, createdAt: daysAgo(0) - 3600_000 },
    { id: 'n2', title: 'مخزون منخفض', body: 'لحم عجل عادي: الكمية المتبقية 8', type: 'stock', read: false, createdAt: daysAgo(0) - 7200_000 },
    { id: 'n3', title: 'ذبيحة جديدة', body: 'تم تسجيل الذبيحة ذ-1003 (دجاج)', type: 'slaughter', read: true, createdAt: daysAgo(1) },
  ]

  return {
    products: products as unknown as Array<Record<string, unknown>>,
    parties: parties as unknown as Array<Record<string, unknown>>,
    slaughters: slaughters as unknown as Array<Record<string, unknown>>,
    sales: sales as unknown as Array<Record<string, unknown>>,
    expenses: expenses as unknown as Array<Record<string, unknown>>,
    workers: workers as unknown as Array<Record<string, unknown>>,
    notifications: notifications as unknown as Array<Record<string, unknown>>,
    ledger: [],
  }
}
