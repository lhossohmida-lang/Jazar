import { repo } from '../data'
import { CUT_TO_CATEGORY } from '../constants'
import type {
  Product,
  Sale,
  SaleItem,
  Slaughter,
  Cuts,
  Party,
  AppNotification,
} from '../types'

/** إنشاء إشعار */
export async function notify(
  n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>,
) {
  await repo.add('notifications', {
    ...n,
    read: false,
    createdAt: Date.now(),
  })
}

/** فحص المخزون وإطلاق تنبيه عند الانخفاض أو النفاد */
async function checkStock(p: Product, newQty: number) {
  if (newQty <= 0) {
    await notify({
      title: 'نفاد المخزون',
      body: `${p.name} نفد من المخزون`,
      type: 'stock',
    })
  } else if (newQty <= p.lowStockThreshold) {
    await notify({
      title: 'مخزون منخفض',
      body: `${p.name}: المتبقي ${newQty} ${p.unit} فقط`,
      type: 'stock',
    })
  }
}

/**
 * تسجيل عملية بيع:
 * - خصم الكميات من المخزون
 * - حساب الربح
 * - تحديث رصيد الزبون عند البيع الآجل
 * - إطلاق إشعارات المخزون
 */
export async function createSale(
  input: {
    items: SaleItem[]
    customerId?: string
    customerName?: string
    paymentMethod: Sale['paymentMethod']
    cashier: string
    cashierUid: string
  },
  products: Product[],
  parties: Party[],
): Promise<string> {
  const total = input.items.reduce((s, it) => s + it.price * it.quantity, 0)
  const profit = input.items.reduce(
    (s, it) => s + (it.price - it.costPrice) * it.quantity,
    0,
  )
  const invoiceNo = 'F-' + Date.now().toString().slice(-6)

  const sale: Omit<Sale, 'id'> = {
    invoiceNo,
    items: input.items,
    total,
    profit,
    customerId: input.customerId,
    customerName: input.customerName,
    paymentMethod: input.paymentMethod,
    cashier: input.cashier,
    cashierUid: input.cashierUid,
    createdAt: Date.now(),
  }
  const id = await repo.add('sales', sale)

  // خصم المخزون
  for (const it of input.items) {
    const p = products.find((x) => x.id === it.productId)
    if (!p) continue
    const newQty = Math.max(0, p.quantity - it.quantity)
    await repo.update('products', p.id, { quantity: newQty })
    await checkStock(p, newQty)
  }

  // البيع الآجل يزيد دين الزبون
  if (input.paymentMethod === 'credit' && input.customerId) {
    const party = parties.find((x) => x.id === input.customerId)
    if (party) {
      await repo.update('parties', party.id, { balance: party.balance + total })
      await repo.add('ledger', {
        partyId: party.id,
        partyType: 'customer',
        type: 'debit',
        amount: total,
        note: `فاتورة ${invoiceNo}`,
        date: new Date().toISOString().slice(0, 10),
        createdAt: Date.now(),
      })
    }
  }

  await notify({
    title: 'عملية بيع جديدة',
    body: `فاتورة ${invoiceNo} بمبلغ ${Math.round(total)}`,
    type: 'sale',
  })

  return id
}

/**
 * إتمام ذبح ذبيحة: إدخال المخرجات وتحديث المخزون تلقائياً.
 * يبحث عن منتج بنفس الفئة، فإن وُجد يزيد كميته، وإلا ينشئ منتجاً جديداً.
 */
export async function butcherSlaughter(
  slaughter: Slaughter,
  cuts: Cuts,
  products: Product[],
): Promise<void> {
  await repo.update('slaughters', slaughter.id, {
    status: 'butchered',
    cuts,
  })

  for (const [key, qty] of Object.entries(cuts)) {
    const amount = Number(qty)
    if (!amount || amount <= 0) continue
    const category = CUT_TO_CATEGORY[key as keyof typeof CUT_TO_CATEGORY]
    const existing = products.find((p) => p.category === category)
    if (existing) {
      await repo.update('products', existing.id, {
        quantity: existing.quantity + amount,
      })
    } else {
      const newProduct: Omit<Product, 'id'> = {
        name: category,
        category,
        quantity: amount,
        unit: 'كغ',
        salePrice: 0,
        costPrice: 0,
        lowStockThreshold: 5,
        createdAt: Date.now(),
      }
      await repo.add('products', newProduct)
    }
  }

  await notify({
    title: 'تم ذبح ذبيحة',
    body: `الذبيحة ${slaughter.number} تم ذبحها وتحديث المخزون`,
    type: 'slaughter',
  })
}

/** تسجيل دفعة من/إلى طرف (زبون أو مورد) */
export async function recordPayment(
  party: Party,
  amount: number,
  note?: string,
): Promise<void> {
  await repo.update('parties', party.id, {
    balance: Math.max(0, party.balance - amount),
  })
  await repo.add('ledger', {
    partyId: party.id,
    partyType: party.type,
    type: 'payment',
    amount,
    note: note ?? 'دفعة',
    date: new Date().toISOString().slice(0, 10),
    createdAt: Date.now(),
  })
}

/** زيادة دين طرف يدوياً */
export async function addDebt(
  party: Party,
  amount: number,
  note?: string,
): Promise<void> {
  await repo.update('parties', party.id, {
    balance: party.balance + amount,
  })
  await repo.add('ledger', {
    partyId: party.id,
    partyType: party.type,
    type: 'debit',
    amount,
    note: note ?? 'دين',
    date: new Date().toISOString().slice(0, 10),
    createdAt: Date.now(),
  })
}
