import type { CollectionName } from '../types'

export type Unsubscribe = () => void

/** عقد موحّد لطبقة البيانات — تنفّذه نسخة Firebase ونسخة الوضع التجريبي */
export interface Repo {
  /** اشتراك فوري (Real-Time) بمجموعة — يُستدعى cb عند كل تغيير */
  subscribe<T>(collection: CollectionName, cb: (items: T[]) => void): Unsubscribe
  /** إضافة مستند جديد وإرجاع المعرّف */
  add<T extends object>(collection: CollectionName, data: T): Promise<string>
  /** تعديل جزئي لمستند */
  update(
    collection: CollectionName,
    id: string,
    patch: Record<string, unknown>,
  ): Promise<void>
  /** حذف مستند */
  remove(collection: CollectionName, id: string): Promise<void>
  /** إضافة عدة مستندات دفعة واحدة */
  bulkAdd<T extends object>(
    collection: CollectionName,
    items: T[],
  ): Promise<void>
}
