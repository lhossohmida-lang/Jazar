import { IS_DEMO } from '../lib/firebase'
import { DemoRepo } from './demoRepo'
import { FirebaseRepo } from './firebaseRepo'
import type { Repo } from './repo'

/** نسخة طبقة البيانات الفعّالة (تجريبية أو Firebase حسب الإعدادات) */
export const repo: Repo = IS_DEMO ? new DemoRepo() : new FirebaseRepo()

/** للوصول لدالة إعادة التعيين في الوضع التجريبي */
export const demoRepo = IS_DEMO ? (repo as DemoRepo) : null

export type { Repo } from './repo'
