import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import Layout from './components/Layout'
import Logo from './components/Logo'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Sales from './pages/Sales'
import Products from './pages/Products'
import Inventory from './pages/Inventory'
import Slaughters from './pages/Slaughters'
import Expenses from './pages/Expenses'
import Debts from './pages/Debts'
import Workers from './pages/Workers'
import Reports from './pages/Reports'

function Splash() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-ink">
      <Logo size={64} light />
      <div className="h-1 w-40 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-1/2 animate-[loading_1s_ease_infinite] rounded-full bg-brand-600" />
      </div>
      <style>{`@keyframes loading{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}`}</style>
    </div>
  )
}

/** يحمي المسارات الإدارية من العمال */
function AdminOnly({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth()
  return isAdmin ? <>{children}</> : <Navigate to="/" replace />
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return <Splash />
  if (!user) return <Login />

  return (
    <DataProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/products" element={<Products />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route
            path="/slaughters"
            element={
              <AdminOnly>
                <Slaughters />
              </AdminOnly>
            }
          />
          <Route
            path="/expenses"
            element={
              <AdminOnly>
                <Expenses />
              </AdminOnly>
            }
          />
          <Route
            path="/debts"
            element={
              <AdminOnly>
                <Debts />
              </AdminOnly>
            }
          />
          <Route
            path="/workers"
            element={
              <AdminOnly>
                <Workers />
              </AdminOnly>
            }
          />
          <Route
            path="/reports"
            element={
              <AdminOnly>
                <Reports />
              </AdminOnly>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </DataProvider>
  )
}
