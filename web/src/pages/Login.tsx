import { useState } from 'react'
import { ShieldCheck, HardHat, LogIn, FlaskConical } from 'lucide-react'
import Logo from '../components/Logo'
import { useAuth } from '../contexts/AuthContext'
import { IS_DEMO } from '../lib/firebase'

export default function Login() {
  const { login, loginDemo } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      await login(email, password)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'فشل تسجيل الدخول')
    } finally {
      setBusy(false)
    }
  }

  const quick = async (role: 'admin' | 'worker') => {
    setErr('')
    setBusy(true)
    try {
      await loginDemo(role)
    } catch {
      setErr('فشل الدخول التجريبي')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-10 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            background:
              'radial-gradient(circle at 20% 20%, #b01e1e 0, transparent 45%), radial-gradient(circle at 80% 80%, #8f1414 0, transparent 40%)',
          }}
        />
        <Logo size={52} light />
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold leading-tight">
            إدارة جزارتك
            <br />
            <span className="text-brand-500">بذكاء واحترافية</span>
          </h1>
          <p className="mt-4 max-w-md text-white/60">
            ذبائح، مبيعات، مخزون، مصروفات، ديون وتقارير — كل شيء في مكان واحد مع
            مزامنة فورية بين الويب والهاتف.
          </p>
          <div className="mt-8 flex flex-wrap gap-2 text-sm">
            {['ذبائح', 'مبيعات', 'مخزون', 'تقارير PDF/Excel', 'إشعارات'].map(
              (t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-white/80"
                >
                  {t}
                </span>
              ),
            )}
          </div>
        </div>
        <div className="relative z-10 text-xs text-white/40">
          © {new Date().getFullYear()} JEZAR
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-zinc-100 p-6">
        <div className="card w-full max-w-md p-7">
          <div className="mb-6 flex justify-center lg:hidden">
            <Logo size={48} />
          </div>
          <h2 className="text-2xl font-extrabold">تسجيل الدخول</h2>
          <p className="mb-6 text-sm text-ink/50">
            أدخل بياناتك للوصول إلى لوحة التحكم
          </p>

          {IS_DEMO && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-700">
                <FlaskConical size={16} /> دخول سريع (وضع تجريبي)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => quick('admin')}
                  disabled={busy}
                  className="btn-dark text-sm"
                >
                  <ShieldCheck size={16} /> كمدير
                </button>
                <button
                  onClick={() => quick('worker')}
                  disabled={busy}
                  className="btn-ghost text-sm"
                >
                  <HardHat size={16} /> كعامل
                </button>
              </div>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">البريد الإلكتروني</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jezar.com"
                dir="ltr"
                required
              />
            </div>
            <div>
              <label className="label">كلمة المرور</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                required
              />
            </div>

            {err && (
              <div className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-semibold text-brand-700">
                {err}
              </div>
            )}

            <button type="submit" disabled={busy} className="btn-primary w-full">
              <LogIn size={18} /> {busy ? 'جارٍ الدخول…' : 'دخول'}
            </button>
          </form>

          {IS_DEMO && (
            <p className="mt-4 text-center text-xs text-ink/40">
              وضع تجريبي: اضغط «كمدير» أو «كعامل»، أو أدخل أي بريد وكلمة مرور للدخول
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
