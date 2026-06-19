import type { Repo, Unsubscribe } from './repo'
import type { CollectionName } from '../types'
import { buildSeed } from './seed'

const STORAGE_KEY = 'jezar-demo-db-v1'

type Store = Record<string, Array<Record<string, unknown>>>

/**
 * تنفيذ تجريبي لطبقة البيانات في الذاكرة + localStorage مع محاكاة المزامنة الفورية.
 * يسمح بتجربة كل الشاشات فوراً دون إعداد Firebase.
 */
export class DemoRepo implements Repo {
  private store: Store
  private listeners: Map<string, Set<(items: unknown[]) => void>> = new Map()

  constructor() {
    this.store = this.load()
  }

  private load(): Store {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw) as Store
    } catch {
      /* ignore */
    }
    const seed = buildSeed()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store))
    } catch {
      /* تجاوز الحد — غير حرج للتجربة */
    }
  }

  private sorted(coll: CollectionName) {
    const arr = [...(this.store[coll] ?? [])]
    arr.sort(
      (a, b) => Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0),
    )
    return arr
  }

  private emit(coll: CollectionName) {
    const subs = this.listeners.get(coll)
    if (!subs) return
    const data = this.sorted(coll)
    subs.forEach((cb) => cb(data))
  }

  subscribe<T>(coll: CollectionName, cb: (items: T[]) => void): Unsubscribe {
    if (!this.listeners.has(coll)) this.listeners.set(coll, new Set())
    const set = this.listeners.get(coll)!
    const fn = cb as (items: unknown[]) => void
    set.add(fn)
    // إصدار فوري للبيانات الحالية
    cb(this.sorted(coll) as T[])
    return () => set.delete(fn)
  }

  private genId() {
    return (
      'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    )
  }

  async add<T extends object>(coll: CollectionName, data: T): Promise<string> {
    const id = this.genId()
    if (!this.store[coll]) this.store[coll] = []
    this.store[coll].push({ id, ...data })
    this.persist()
    this.emit(coll)
    return id
  }

  async update(
    coll: CollectionName,
    id: string,
    patch: Record<string, unknown>,
  ): Promise<void> {
    const arr = this.store[coll] ?? []
    const idx = arr.findIndex((x) => x.id === id)
    if (idx >= 0) {
      arr[idx] = { ...arr[idx], ...patch }
      this.persist()
      this.emit(coll)
    }
  }

  async remove(coll: CollectionName, id: string): Promise<void> {
    this.store[coll] = (this.store[coll] ?? []).filter((x) => x.id !== id)
    this.persist()
    this.emit(coll)
  }

  async bulkAdd<T extends object>(
    coll: CollectionName,
    items: T[],
  ): Promise<void> {
    if (!this.store[coll]) this.store[coll] = []
    for (const item of items) {
      this.store[coll].push({ id: this.genId(), ...item })
    }
    this.persist()
    this.emit(coll)
  }

  /** إعادة تعيين البيانات التجريبية */
  reset() {
    const seed = buildSeed()
    this.store = seed
    this.persist()
    ;(Object.keys(seed) as CollectionName[]).forEach((c) => this.emit(c))
  }
}
