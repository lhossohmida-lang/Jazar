// ===== JEZAR - نماذج البيانات (Data Models) =====

export type Role = 'admin' | 'worker'

export interface AppUser {
  uid: string
  name: string
  email: string
  role: Role
  phone?: string
  active?: boolean
}

export type AnimalType = 'sheep' | 'calf' | 'chicken'

/** مفاتيح أجزاء الذبيحة بعد الذبح */
export type CutKey =
  | 'premiumMeat' // لحم ممتاز
  | 'regularMeat' // لحم عادي
  | 'liver' // كبد
  | 'heart' // قلب
  | 'lung' // رئة
  | 'tripe' // كرشة
  | 'intestines' // أمعاء
  | 'fat' // شحمة
  | 'head' // رأس
  | 'legs' // أرجل
  | 'skin' // جلد
  | 'bones' // عظام

export type Cuts = Partial<Record<CutKey, number>>

export type SlaughterStatus = 'pending' | 'butchered'

export interface Slaughter {
  id: string
  number: string // رقم الذبيحة
  type: AnimalType // النوع
  supplierId?: string
  supplierName: string // المورد
  purchaseDate: string // تاريخ الشراء (ISO)
  liveWeight: number // الوزن الحي (كغ)
  purchasePrice: number // سعر الشراء
  transportCost: number // تكلفة النقل
  slaughterCost: number // تكلفة الذبح
  status: SlaughterStatus
  cuts: Cuts // المخرجات بعد الذبح (بالكيلوغرام/العدد)
  totalCost: number // إجمالي التكلفة
  note?: string
  createdAt: number
}

export interface Product {
  id: string
  name: string // الاسم
  category: string // الفئة
  quantity: number // الكمية المتوفرة
  unit: string // الوحدة (كغ / قطعة)
  salePrice: number // سعر البيع
  costPrice: number // سعر التكلفة
  imageUrl?: string // صورة المنتج
  lowStockThreshold: number // حد التنبيه
  createdAt: number
}

export type PaymentMethod = 'cash' | 'credit' | 'card'

export interface SaleItem {
  productId: string
  name: string
  quantity: number
  price: number // سعر البيع للوحدة
  costPrice: number // التكلفة للوحدة (لحساب الربح)
}

export interface Sale {
  id: string
  invoiceNo: string
  items: SaleItem[]
  total: number
  profit: number
  customerId?: string
  customerName?: string
  paymentMethod: PaymentMethod
  cashier: string // اسم البائع
  cashierUid: string
  createdAt: number
}

export type ExpenseCategory =
  | 'rent' // إيجار
  | 'electricity' // كهرباء
  | 'water' // ماء
  | 'transport' // نقل
  | 'salaries' // رواتب
  | 'cleaning' // تنظيف
  | 'other' // أخرى

export interface Expense {
  id: string
  category: ExpenseCategory
  amount: number
  note?: string
  date: string // ISO
  createdAt: number
}

export type PartyType = 'customer' | 'supplier'

export interface Party {
  id: string
  name: string
  phone?: string
  balance: number // الرصيد المستحق (موجب = مدين لنا للزبون / علينا للمورد)
  type: PartyType
  createdAt: number
}

export type LedgerType = 'debit' | 'payment' // debit = زيادة الدين, payment = دفعة

export interface LedgerEntry {
  id: string
  partyId: string
  partyType: PartyType
  type: LedgerType
  amount: number
  note?: string
  date: string
  createdAt: number
}

export interface Worker {
  id: string
  name: string
  phone?: string
  position: string // الوظيفة
  salary: number
  active: boolean
  createdAt: number
}

export interface AppNotification {
  id: string
  title: string
  body: string
  type: 'stock' | 'sale' | 'slaughter' | 'info'
  read: boolean
  createdAt: number
}

export type CollectionName =
  | 'slaughters'
  | 'products'
  | 'sales'
  | 'expenses'
  | 'parties'
  | 'ledger'
  | 'workers'
  | 'notifications'
