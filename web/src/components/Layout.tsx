import { useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Bell,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  HardHat,
  FlaskConical,
  Check,
} from 'lucide-react'
import Logo from './Logo'
import { NAV_ITEMS } from './nav'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { IS_DEMO } from '../lib/firebase'
import { repo } from '../data'
import { fmtDateTime } from '../utils/format'

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const { notifications } = useData()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const location = useLocation()

  const items = useMemo(
    () => NAV_ITEMS.filter((i) => user && i.roles.includes(user.role)),
    [user],
  )

  const unread = notifications.filter((n) => !n.read).length

  const markAllRead = async () => {
    await Promise.all(
      notifications.filter((n) => !n.read).map((n) =>
        repo.update('notifications', n.id, { read: true }),
      ),
    )
  }

  const SidebarContent = (
    <div className="flex h-full flex-col bg-ink text-white">
      <div className="flex items-center justify-between px-5 py-5">
        <Logo light />
        <button
          className="rounded-lg p-1.5 hover:bg-white/10 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                isActive
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 font-bold">
            {user?.name?.[0] ?? '؟'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold">{user?.name}</div>
            <div className="flex items-center gap-1 text-xs text-white/50">
              {isAdmin ? (
                <>
                  <ShieldCheck size={12} /> مدير
                </>
              ) : (
                <>
                  <HardHat size={12} /> عامل
                </>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-sm font-semibold transition hover:bg-white/20"
        >
          <LogOut size={18} /> تسجيل الخروج
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-100">
      {/* Sidebar - desktop */}
      <aside className="hidden w-64 shrink-0 lg:block">{SidebarContent}</aside>

      {/* Sidebar - mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-64">{SidebarContent}</div>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex items-center justify-between gap-3 border-b border-black/5 bg-white px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 hover:bg-black/5 lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={22} />
            </button>
            {IS_DEMO && (
              <span className="badge bg-amber-100 text-amber-700">
                <FlaskConical size={13} /> وضع تجريبي
              </span>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setBellOpen((v) => !v)}
              className="relative rounded-xl p-2.5 hover:bg-black/5"
            >
              <Bell size={22} />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">
                  {unread}
                </span>
              )}
            </button>

            {bellOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setBellOpen(false)}
                />
                <div className="absolute left-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-soft">
                  <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
                    <span className="font-bold">الإشعارات</span>
                    {unread > 0 && (
                      <button
                        onClick={markAllRead}
                        className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
                      >
                        <Check size={14} /> تعليم الكل كمقروء
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-10 text-center text-sm text-ink/40">
                        لا توجد إشعارات
                      </div>
                    ) : (
                      notifications.slice(0, 20).map((n) => (
                        <div
                          key={n.id}
                          className={`border-b border-black/5 px-4 py-3 ${
                            n.read ? '' : 'bg-brand-50/40'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold">{n.title}</span>
                            {!n.read && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-brand-600" />
                            )}
                          </div>
                          <div className="text-sm text-ink/60">{n.body}</div>
                          <div className="mt-1 text-[11px] text-ink/30">
                            {fmtDateTime(n.createdAt)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        <main key={location.pathname} className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
