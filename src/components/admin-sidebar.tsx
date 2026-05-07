'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Car,
  LogOut,
  TrendingUp,
  MessageSquare,
  Building2,
  DollarSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/lib/auth-actions'

const navigation = [
  { name: 'Geral',       href: '/admin',             icon: LayoutDashboard },
  { name: 'Estoque',     href: '/admin/inventory',   icon: Car },
  { name: 'Lojas',       href: '/admin/lojas',       icon: Building2 },
  { name: 'Financeiro',  href: '/admin/financeiro',  icon: DollarSign },
  { name: 'Leads',       href: '/admin/leads',       icon: MessageSquare },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-white/5 bg-background flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-white font-black text-sm">ZM</span>
        </div>
        <span className="text-lg font-bold tracking-tight text-foreground uppercase">
          z<span className="text-primary">move</span>
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navigation.map((item) => {
          const isActive = item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <item.icon className={cn(
                "w-4 h-4",
                isActive ? "text-primary" : "text-zinc-600 group-hover:text-muted-foreground"
              )} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="bg-card/50 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-green-500" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Meta Mensal</span>
          </div>
          <div className="flex justify-between items-end mb-1">
            <span className="text-lg font-black text-foreground">R$ 4.2M</span>
            <span className="text-xs text-muted-foreground">62%</span>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full w-[62%] rounded-full" />
          </div>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-400/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  )
}
