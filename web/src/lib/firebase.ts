import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getFirestore,
  type Firestore,
  enableIndexedDbPersistence,
} from 'firebase/firestore'
import { getAuth, type Auth } from 'firebase/auth'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const forceDemo = String(import.meta.env.VITE_DEMO_MODE).toLowerCase() === 'true'

/** هل إعدادات Firebase متوفرة وكاملة؟ */
export const isFirebaseConfigured =
  !forceDemo && Boolean(cfg.apiKey && cfg.projectId && cfg.appId)

/** الوضع التجريبي مفعّل عندما لا تتوفر إعدادات Firebase */
export const IS_DEMO = !isFirebaseConfigured

let app: FirebaseApp | undefined
let _db: Firestore | undefined
let _auth: Auth | undefined
let _storage: FirebaseStorage | undefined

if (isFirebaseConfigured) {
  app = initializeApp(cfg)
  _db = getFirestore(app)
  _auth = getAuth(app)
  _storage = getStorage(app)
  // تفعيل العمل دون اتصال (Offline) ثم المزامنة عند عودة الإنترنت
  enableIndexedDbPersistence(_db).catch(() => {
    /* قد يفشل في حال تعدد التبويبات — غير حرج */
  })
}

export const db = _db
export const auth = _auth
export const storage = _storage
export { app }
