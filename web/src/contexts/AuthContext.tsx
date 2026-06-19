import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { IS_DEMO, auth, db } from '../lib/firebase'
import type { AppUser, Role } from '../types'

interface AuthState {
  user: AppUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  loginDemo: (role: Role) => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthState | undefined>(undefined)

const DEMO_KEY = 'jezar-demo-user'

const DEMO_USERS: Record<string, AppUser & { password: string }> = {
  'admin@jezar.com': {
    uid: 'demo-admin',
    name: 'المدير',
    email: 'admin@jezar.com',
    role: 'admin',
    password: 'admin',
  },
  'worker@jezar.com': {
    uid: 'demo-worker',
    name: 'كريم العامل',
    email: 'worker@jezar.com',
    role: 'worker',
    password: 'worker',
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (IS_DEMO) {
      try {
        const raw = localStorage.getItem(DEMO_KEY)
        if (raw) setUser(JSON.parse(raw) as AppUser)
      } catch {
        /* ignore */
      }
      setLoading(false)
      return
    }

    // الوضع الحقيقي: مراقبة حالة Firebase Auth
    let unsubAuth = () => {}
    ;(async () => {
      const { onAuthStateChanged } = await import('firebase/auth')
      const { doc, getDoc } = await import('firebase/firestore')
      unsubAuth = onAuthStateChanged(auth!, async (fbUser) => {
        if (!fbUser) {
          setUser(null)
          setLoading(false)
          return
        }
        let role: Role = 'worker'
        let name = fbUser.displayName ?? fbUser.email ?? 'مستخدم'
        try {
          const snap = await getDoc(doc(db!, 'users', fbUser.uid))
          if (snap.exists()) {
            const data = snap.data() as Partial<AppUser>
            role = data.role ?? 'worker'
            name = data.name ?? name
          }
        } catch {
          /* صلاحيات أو شبكة — نستخدم القيم الافتراضية */
        }
        setUser({
          uid: fbUser.uid,
          email: fbUser.email ?? '',
          name,
          role,
        })
        setLoading(false)
      })
    })()
    return () => unsubAuth()
  }, [])

  const login = async (email: string, password: string) => {
    if (IS_DEMO) {
      const key = email.trim().toLowerCase()
      if (!key || !password) {
        throw new Error('أدخل البريد وكلمة المرور')
      }
      const preset = DEMO_USERS[key]
      let appUser: AppUser
      if (preset) {
        // حساب جاهز: يُحدّد الدور (مدير/عامل) بغض النظر عن كلمة المرور
        const { password: _pw, ...u } = preset
        void _pw
        appUser = u
      } else {
        // الوضع التجريبي: اقبل أي بريد/كلمة مرور وادخل كمدير
        appUser = {
          uid: 'demo-' + key,
          name: email.split('@')[0] || 'مستخدم',
          email: key,
          role: 'admin',
        }
      }
      localStorage.setItem(DEMO_KEY, JSON.stringify(appUser))
      setUser(appUser)
      return
    }
    const { signInWithEmailAndPassword } = await import('firebase/auth')
    await signInWithEmailAndPassword(auth!, email, password)
  }

  const loginDemo = async (role: Role) => {
    const email = role === 'admin' ? 'admin@jezar.com' : 'worker@jezar.com'
    const pass = role === 'admin' ? 'admin' : 'worker'
    await login(email, pass)
  }

  const logout = async () => {
    if (IS_DEMO) {
      localStorage.removeItem(DEMO_KEY)
      setUser(null)
      return
    }
    const { signOut } = await import('firebase/auth')
    await signOut(auth!)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginDemo,
        logout,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
