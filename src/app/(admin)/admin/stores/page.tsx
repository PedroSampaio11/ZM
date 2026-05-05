import { Building2, Users, Car, MessageSquare, ArrowRight, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { NewStoreDialog } from '@/components/forms/new-store-dialog'

const planConfig = {
  STARTER:      { label: 'Starter',      className: 'bg-zinc-700/50 text-zinc-300' },
  PROFESSIONAL: { label: 'Professional', className: 'bg-primary/20 text-primary' },
  ENTERPRISE:   { label: 'Enterprise',   className: 'bg-zmove-gold/20 text-zmove-gold' },
}

export default async function StoresPage() {
  const stores = await prisma.store.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      _count: { select: { partners: true, vehicles: true, leads: true } },
    },
  })

  const totals = {
    stores:   stores.length,
    partners: stores.reduce((s, x) => s + x._count.partners, 0),
    vehicles: stores.reduce((s, x) => s + x._count.vehicles, 0),
    leads:    stores.reduce((s, x) => s + x._count.leads, 0),
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Lojas</h1>
          <p className="text-zinc-500">
            {totals.stores} loja{totals.stores !== 1 ? 's' : ''} · {totals.partners} parceiros · {totals.vehicles} veículos
          </p>
        </div>
        <NewStoreDialog />
      </div>

      {/* Stats globais */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Lojas',     value: totals.stores,   icon: Building2,    color: 'text-primary' },
          { label: 'Parceiros', value: totals.partners, icon: Users,        color: 'text-zmove-cyan' },
          { label: 'Veículos',  value: totals.vehicles, icon: Car,          color: 'text-green-400' },
          { label: 'Leads',     value: totals.leads,    icon: MessageSquare,color: 'text-zmove-gold' },
        ].map(stat => (
          <Card key={stat.label} className="bg-zinc-900/50 border-white/5">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center", stat.color)}>
                <stat.icon size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{stat.label}</p>
                <p className={cn("text-2xl font-black", stat.color)}>{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista de stores */}
      {stores.length === 0 ? (
        <Card className="bg-zinc-900/50 border-white/5 border-dashed">
          <CardContent className="p-16 flex flex-col items-center gap-4">
            <Building2 size={40} className="text-zinc-700" />
            <p className="text-zinc-500 font-medium">Nenhuma loja cadastrada ainda.</p>
            <p className="text-zinc-600 text-sm">Crie a primeira loja para começar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stores.map(store => {
            const plan = planConfig[store.plan]
            return (
              <Card key={store.id} className="bg-zinc-900/50 border-white/5 group hover:border-white/10 transition-all overflow-hidden">
                <CardContent className="p-0">
                  {/* Top bar */}
                  <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Building2 size={18} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-black text-white text-lg leading-none">{store.name}</h3>
                        <p className="text-[10px] text-zinc-600 font-mono mt-0.5">/{store.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-[9px] font-black border-none", plan.className)}>
                        {plan.label}
                      </Badge>
                      {store.isActive
                        ? <CheckCircle size={14} className="text-green-500" />
                        : <XCircle    size={14} className="text-zinc-600" />}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 divide-x divide-white/5 border-b border-white/5">
                    {[
                      { label: 'Parceiros', value: store._count.partners,  icon: Users,        color: 'text-zmove-cyan' },
                      { label: 'Veículos',  value: store._count.vehicles,  icon: Car,          color: 'text-green-400' },
                      { label: 'Leads',     value: store._count.leads,     icon: MessageSquare, color: 'text-zmove-gold' },
                    ].map(s => (
                      <div key={s.label} className="p-4 text-center">
                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className={cn("text-2xl font-black", s.color)}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 flex items-center justify-between">
                    <p className="text-[10px] text-zinc-700">
                      {store.document ? `CNPJ: ${store.document}` : 'CNPJ não cadastrado'}
                    </p>
                    <Link
                      href={`/admin/partners?storeId=${store.id}`}
                      className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline transition-all"
                    >
                      Gerenciar <ArrowRight size={12} />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
