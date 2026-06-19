import {
  collection as fsCollection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Repo, Unsubscribe } from './repo'
import type { CollectionName } from '../types'

/** تنفيذ طبقة البيانات فوق Cloud Firestore مع مزامنة فورية */
export class FirebaseRepo implements Repo {
  subscribe<T>(
    coll: CollectionName,
    cb: (items: T[]) => void,
  ): Unsubscribe {
    if (!db) throw new Error('Firestore غير مهيأ')
    const q = query(fsCollection(db, coll), orderBy('createdAt', 'desc'))
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T)
        cb(items)
      },
      (err) => {
        console.error(`خطأ في الاشتراك بـ ${coll}:`, err)
        cb([])
      },
    )
  }

  async add<T extends object>(coll: CollectionName, data: T): Promise<string> {
    if (!db) throw new Error('Firestore غير مهيأ')
    const ref = await addDoc(fsCollection(db, coll), data)
    return ref.id
  }

  async update(
    coll: CollectionName,
    id: string,
    patch: Record<string, unknown>,
  ): Promise<void> {
    if (!db) throw new Error('Firestore غير مهيأ')
    await updateDoc(doc(db, coll, id), patch)
  }

  async remove(coll: CollectionName, id: string): Promise<void> {
    if (!db) throw new Error('Firestore غير مهيأ')
    await deleteDoc(doc(db, coll, id))
  }

  async bulkAdd<T extends object>(
    coll: CollectionName,
    items: T[],
  ): Promise<void> {
    if (!db) throw new Error('Firestore غير مهيأ')
    const batch = writeBatch(db)
    for (const item of items) {
      const ref = doc(fsCollection(db, coll))
      batch.set(ref, item)
    }
    await batch.commit()
  }
}
