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
  { name: 'Geral',       href: '/gestao',             icon: LayoutDashboard },
  { name: 'Estoque',     href: '/gestao/inventory',   icon: Car },
  { name: 'Lojas',       href: '/gestao/lojas',       icon: Building2 },
  { name: 'Financeiro',  href: '/gestao/financeiro',  icon: DollarSign },
  { name: 'Leads',       href: '/gestao/leads',       icon: MessageSquare },
]

const fmt = (n: number): string => {
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (n >= 1_000)     return `R$ ${(n / 1_000).toFixed(1).replace('.', ',')}k`
  return `R$ ${Math.round(n)}`
}

interface SidebarMeta {
  goalTotal: number
  revenue:   number
}

export function AdminSidebar({ meta }: { meta?: SidebarMeta | null }) {
  const pathname = usePathname()
  const hasGoal  = meta && meta.goalTotal > 0
  const pct      = hasGoal ? Math.min(100, Math.round((meta.revenue / meta.goalTotal) * 100)) : 0

  return (
    <aside className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-xl flex flex-col h-screen sticky top-0 z-50">
      <div className="p-8 flex items-center gap-3">
        <img src="/assets/brand/logos/logo1.png" alt="motorz" className="h-7 w-auto" />
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-2">
        {navigation.map((item) => {
          const isActive = item.href === '/gestao' ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-2xl text-[13px] font-bold transition-all group relative overflow-hidden",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-r-full" />
              )}
              <item.icon className={cn(
                "w-4 h-4 transition-colors",
                isActive ? "text-primary" : "text-zinc-600 group-hover:text-zinc-400"
              )} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-6 border-t border-white/5 bg-white/[0.02]">
        {hasGoal && (
          <div className="bg-white/[0.03] border border-white/5 rounded-[24px] p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className={cn("p-1 rounded-md", pct >= 100 ? "bg-green-500/10" : "bg-primary/10")}>
                <TrendingUp size={12} className={pct >= 100 ? 'text-green-400' : 'text-primary'} />
              </div>
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.15em]">Meta Mensal</span>
            </div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-lg font-black text-white tracking-tight">{fmt(meta.revenue)}</span>
              <span className={cn('text-[10px] font-black', pct >= 100 ? 'text-green-400' : 'text-zinc-500')}>
                {pct}%
              </span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-1000', pct >= 100 ? 'bg-green-400' : 'bg-primary')}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[9px] text-zinc-600 mt-2 font-bold uppercase tracking-wider">meta: {fmt(meta.goalTotal)}</p>
          </div>
        )}

        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-[13px] font-bold text-zinc-500 hover:text-red-400 hover:bg-red-400/5 transition-all group"
          >
            <LogOut className="w-4 h-4 text-zinc-600 group-hover:text-red-400/70" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  )
}
