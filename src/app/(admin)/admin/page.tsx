import { Building2, Car, Users, RefreshCw, CheckCircle, XCircle, MinusCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { prisma } from "@/lib/prisma"
import { getActiveStore } from "@/lib/get-store"

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'agora mesmo'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `há ${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `há ${hours}h`
  const days = Math.floor(hours / 24)
  return `há ${days}d`
}

const leadStatusStyle: Record<string, string> = {
  NEW: 'bg-zinc-700/50 text-zinc-300',
  AI_QUALIFYING: 'bg-accent/20 text-accent',
  QUALIFIED: 'bg-green-600/20 text-green-400',
  HANDOFF_HUMAN: 'bg-orange-600/20 text-orange-400',
  LOST: 'bg-red-600/20 text-red-400',
  CONVERTED: 'bg-primary/20 text-primary',
}

const leadStatusLabel: Record<string, string> = {
  NEW: 'Novo',
  AI_QUALIFYING: 'IA',
  QUALIFIED: 'Qualificado',
  HANDOFF_HUMAN: 'Humano',
  LOST: 'Perdido',
  CONVERTED: 'Convertido',
}

export default async function AdminDashboard() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const store = await getActiveStore()
  const sid = store?.id

  const [activePartners, availableVehicles, totalVehicles, leadsToday, recentLeads, recentSyncs] =
    await Promise.all([
      prisma.partner.count({ where: { isActive: true, ...(sid ? { storeId: sid } : {}) } }),
      prisma.vehicle.count({ where: { status: 'AVAILABLE', ...(sid ? { storeId: sid } : {}) } }),
      prisma.vehicle.count({ where: { status: { not: 'ARCHIVED' }, ...(sid ? { storeId: sid } : {}) } }),
      prisma.lead.count({ where: { createdAt: { gte: today }, ...(sid ? { storeId: sid } : {}) } }),
      prisma.lead.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        where: sid ? { storeId: sid } : {},
        include: { vehicle: { select: { brand: true, model: true } } },
      }),
      prisma.integrationConfig.findMany({
        where: { isActive: true, ...(sid ? { storeId: sid } : {}) },
        orderBy: { lastSyncAt: { sort: 'desc', nulls: 'last' } },
        take: 6,
        include: { partner: { select: { name: true } } },
      }),
    ])

  const lastSync = recentSyncs.find((s) => s.lastSyncAt)

  const stats = [
    {
      name: 'Lojas Ativas',
      value: activePartners,
      sub: activePartners === 1 ? 'concessionária' : 'concessionárias',
      icon: Building2,
      accent: 'text-motorz-cyan',
      glow: 'shadow-motorz-cyan/10',
    },
    {
      name: 'Estoque Disponível',
      value: availableVehicles,
      sub: `de ${totalVehicles} no total`,
      icon: Car,
      accent: 'text-primary',
      glow: 'shadow-primary/10',
    },
    {
      name: 'Leads Hoje',
      value: leadsToday,
      sub: leadsToday === 1 ? 'novo contato' : 'novos contatos',
      icon: Users,
      accent: 'text-motorz-gold',
      glow: 'shadow-motorz-gold/10',
    },
    {
      name: 'Último Sync',
      value: lastSync?.lastSyncAt ? timeAgo(lastSync.lastSyncAt) : '—',
      sub: lastSync ? lastSync.partner.name : 'sem sync ainda',
      icon: RefreshCw,
      accent: lastSync?.lastSyncAt ? 'text-green-400' : 'text-zinc-600',
      glow: 'shadow-green-400/5',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">Geral</h1>
        <p className="text-muted-foreground mt-1">Visão geral da operação em tempo real.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.name}
            className={cn('bg-card/50 border-white/5 backdrop-blur-xl shadow-lg', stat.glow)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {stat.name}
              </CardTitle>
              <div className={cn('p-1.5 rounded-lg bg-white/5', stat.accent)}>
                <stat.icon className="w-3.5 h-3.5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn('text-2xl font-black', stat.accent)}>{stat.value}</div>
              <p className="text-[11px] text-zinc-500 mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads Recentes */}
        <Card className="lg:col-span-2 bg-card/50 border-white/5 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-foreground">Leads Recentes</CardTitle>
            <a href="/admin/leads" className="text-xs font-bold text-primary hover:underline">
              Ver todos →
            </a>
          </CardHeader>
          <CardContent>
            {recentLeads.length === 0 ? (
              <p className="text-zinc-600 text-sm py-4 text-center">Nenhum lead ainda.</p>
            ) : (
              <div className="space-y-2">
                {recentLeads.map((lead) => (
                  <a
                    key={lead.id}
                    href={`/admin/leads/${lead.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.07] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        {lead.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm leading-tight">{lead.name}</p>
                        <p className="text-[11px] text-zinc-500">
                          {lead.vehicle
                            ? `${lead.vehicle.brand} ${lead.vehicle.model}`
                            : lead.phone}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge
                        className={cn(
                          'mb-1 text-[10px] font-bold border-none',
                          leadStatusStyle[lead.status],
                        )}
                      >
                        {leadStatusLabel[lead.status] ?? lead.status}
                      </Badge>
                      <p className="text-[10px] text-zinc-600">
                        {new Intl.DateTimeFormat('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        }).format(lead.createdAt)}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sincronizações */}
        <Card className="bg-card/50 border-white/5 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-foreground">Sincronizações</CardTitle>
            <a href="/admin/lojas" className="text-xs font-bold text-primary hover:underline">
              Gerenciar →
            </a>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentSyncs.length === 0 ? (
              <p className="text-zinc-600 text-sm py-4 text-center">Nenhuma integração ativa.</p>
            ) : (
              recentSyncs.map((sync) => {
                const isOk = sync.lastSyncStatus === 'OK'
                const isError = sync.lastSyncStatus?.startsWith('ERROR')
                const never = !sync.lastSyncAt

                return (
                  <div
                    key={sync.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5"
                  >
                    <div className="shrink-0">
                      {never ? (
                        <MinusCircle className="w-4 h-4 text-zinc-600" />
                      ) : isOk ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : isError ? (
                        <XCircle className="w-4 h-4 text-red-400" />
                      ) : (
                        <MinusCircle className="w-4 h-4 text-zinc-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {sync.partner.name}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {sync.adapter} ·{' '}
                        {never
                          ? 'nunca sincronizado'
                          : timeAgo(sync.lastSyncAt!)}
                      </p>
                    </div>
                    <Badge
                      className={cn(
                        'text-[9px] font-bold border-none shrink-0',
                        never
                          ? 'bg-zinc-700/50 text-zinc-500'
                          : isOk
                            ? 'bg-green-600/20 text-green-400'
                            : 'bg-red-600/20 text-red-400',
                      )}
                    >
                      {never ? 'Nunca' : isOk ? 'OK' : 'Erro'}
                    </Badge>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
