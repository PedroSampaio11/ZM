'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Car,
  Users,
  Handshake,
  LogOut,
  BrainCircuit,
  TrendingUp,
  MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/lib/auth-actions'

const navigation = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Leads', href: '/admin/leads', icon: MessageSquare },
  { name: 'Inventário', href: '/admin/inventory', icon: Car },
  { name: 'Parceiros', href: '/admin/partners', icon: Handshake },
  { name: 'Inteligência', href: '/admin/intelligence', icon: BrainCircuit },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-white/5 bg-zinc-950 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
          <span className="text-white font-black text-sm">SL</span>
        </div>
        <span className="text-lg font-bold tracking-tight text-white uppercase">
          Super<span className="text-blue-600">Loja</span>
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-blue-600/10 text-blue-400"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
              )}
            >
              <item.icon className={cn(
                "w-4 h-4",
                isActive ? "text-blue-400" : "text-zinc-600 group-hover:text-zinc-400"
              )} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="bg-zinc-900/50 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-green-500" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Meta Mensal</span>
          </div>
          <div className="flex justify-between items-end mb-1">
            <span className="text-lg font-black text-white">R$ 4.2M</span>
            <span className="text-xs text-zinc-600">62%</span>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full w-[62%] rounded-full" />
          </div>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm font-medium text-zinc-500 hover:text-red-400 hover:bg-red-400/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  )
}
