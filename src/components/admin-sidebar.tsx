'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Car, LogOut, MessageSquare, Building2, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/lib/auth-actions'

const navigation = [
  { name: 'Geral',      href: '/gestao',            icon: LayoutDashboard },
  { name: 'Estoque',    href: '/gestao/inventory',  icon: Car },
  { name: 'Lojas',      href: '/gestao/lojas',      icon: Building2 },
  { name: 'Financeiro', href: '/gestao/financeiro', icon: DollarSign },
  { name: 'Leads',      href: '/gestao/leads',      icon: MessageSquare },
]

const fmt = (n: number): string => {
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (n >= 1_000)     return `R$ ${(n / 1_000).toFixed(1).replace('.', ',')}k`
  return `R$ ${Math.round(n)}`
}

interface SidebarMeta { goalTotal: number; revenue: number }
interface AdminSidebarProps { meta: SidebarMeta | null }

export function AdminSidebar({ meta }: AdminSidebarProps) {
  const pathname = usePathname()
  const hasGoal  = meta !== null && meta.goalTotal > 0
  const pct      = hasGoal ? Math.round((meta!.revenue / meta!.goalTotal) * 100) : 0

  return (
    <aside className="w-[220px] shrink-0 border-r border-white/[0.06] flex flex-col h-screen sticky top-0 z-50">

      {/* ── Logo ───────────────────────────────────────── */}
      <div className="px-5 pt-7 pb-8">
        <img src="/assets/brand/logos/logo1.png" alt="motorz" className="h-[22px] w-auto" />
      </div>

      {/* ── Navigation ─────────────────────────────────── */}
      <nav className="flex-1 px-2 space-y-px overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/gestao' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13px] font-medium transition-all duration-150',
                isActive
                  ? 'text-white bg-white/[0.07]'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[18px] bg-[#2D5BFF] rounded-r-full" />
              )}
              <item.icon
                size={14}
                className={cn(
                  'shrink-0 transition-colors duration-150',
                  isActive ? 'text-[#2D5BFF]' : 'text-zinc-600'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* ── Bottom ─────────────────────────────────────── */}
      <div className="px-3 pb-5 pt-3 space-y-1">

        {/* Goal card */}
        {hasGoal && (
          <div className="rounded-xl border border-white/[0.06] p-4 mb-2">
            <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-[0.12em] mb-3">
              Receita do mês
            </p>

            <p className={cn(
              'text-[22px] font-black tracking-tight leading-none mb-1',
              pct >= 100 ? 'text-green-400' : 'text-white'
            )}>
              {fmt(meta!.revenue)}
            </p>
            <p className="text-[11px] text-zinc-600 mb-3">de {fmt(meta!.goalTotal)}</p>

            <div className="w-full h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-700 ease-out',
                  pct >= 100 ? 'bg-green-400' : 'bg-[#2D5BFF]'
                )}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
            <p className={cn(
              'text-[10px] font-medium mt-1.5',
              pct >= 100 ? 'text-green-400' : 'text-zinc-600'
            )}>
              {pct >= 100 ? '✓ meta atingida' : `${pct}% da meta`}
            </p>
          </div>
        )}

        {/* Logout */}
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2.5 px-3 py-2 w-full rounded-lg text-[13px] font-medium text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04] transition-all duration-150 group"
          >
            <LogOut size={13} className="shrink-0 group-hover:text-zinc-300 transition-colors duration-150" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  )
}
