import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Beef,
  Wallet,
  Users,
  HandCoins,
  FileBarChart,
  type LucideIcon,
} from 'lucide-react'
import type { Role } from '../types'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  roles: Role[]
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'لوحة التحكم', icon: LayoutDashboard, roles: ['admin', 'worker'] },
  { to: '/sales', label: 'المبيعات', icon: ShoppingCart, roles: ['admin', 'worker'] },
  { to: '/products', label: 'المنتجات', icon: Package, roles: ['admin', 'worker'] },
  { to: '/inventory', label: 'المخزون', icon: Boxes, roles: ['admin', 'worker'] },
  { to: '/slaughters', label: 'الذبائح', icon: Beef, roles: ['admin'] },
  { to: '/expenses', label: 'المصروفات', icon: Wallet, roles: ['admin'] },
  { to: '/debts', label: 'الديون', icon: HandCoins, roles: ['admin'] },
  { to: '/workers', label: 'العمال', icon: Users, roles: ['admin'] },
  { to: '/reports', label: 'التقارير', icon: FileBarChart, roles: ['admin'] },
]
