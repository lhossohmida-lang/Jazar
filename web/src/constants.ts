import type {
  AnimalType,
  CutKey,
  ExpenseCategory,
  PaymentMethod,
} from './types'

// عملة العرض
export const CURRENCY = 'دج' // دينار جزائري — عدّلها حسب بلدك (ر.س / د.م / ...)

export const ANIMAL_TYPES: Record<AnimalType, string> = {
  sheep: 'خروف',
  calf: 'عجل',
  chicken: 'دجاج',
}

export const CUT_LABELS: Record<CutKey, string> = {
  premiumMeat: 'لحم ممتاز',
  regularMeat: 'لحم عادي',
  liver: 'كبد',
  heart: 'قلب',
  lung: 'رئة',
  tripe: 'كرشة',
  intestines: 'أمعاء',
  fat: 'شحمة',
  head: 'رأس',
  legs: 'أرجل',
  skin: 'جلد',
  bones: 'عظام',
}

export const CUT_KEYS = Object.keys(CUT_LABELS) as CutKey[]

/** فئات المنتجات */
export const PRODUCT_CATEGORIES = [
  'لحم ممتاز',
  'لحم عادي',
  'كبد',
  'قلب',
  'رئة',
  'كرشة',
  'أمعاء',
  'شحمة',
  'رأس',
  'أرجل',
  'جلد',
  'عظام',
  'دجاج',
] as const

/** ربط أجزاء الذبيحة بفئات المنتجات لتحديث المخزون تلقائياً */
export const CUT_TO_CATEGORY: Record<CutKey, string> = {
  premiumMeat: 'لحم ممتاز',
  regularMeat: 'لحم عادي',
  liver: 'كبد',
  heart: 'قلب',
  lung: 'رئة',
  tripe: 'كرشة',
  intestines: 'أمعاء',
  fat: 'شحمة',
  head: 'رأس',
  legs: 'أرجل',
  skin: 'جلد',
  bones: 'عظام',
}

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, string> = {
  rent: 'إيجار',
  electricity: 'كهرباء',
  water: 'ماء',
  transport: 'نقل',
  salaries: 'رواتب',
  cleaning: 'تنظيف',
  other: 'أخرى',
}

export const PAYMENT_METHODS: Record<PaymentMethod, string> = {
  cash: 'نقدي',
  credit: 'آجل (دين)',
  card: 'بطاقة',
}

export const UNITS = ['كغ', 'قطعة', 'علبة'] as const
