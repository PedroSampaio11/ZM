import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/get-store'
import { decryptCredentials } from '@/lib/inventory-sync/credentials'
import { AddLojaDialog } from '@/components/forms/add-loja-dialog'
import { SyncLojaButton } from '@/components/lojas/sync-loja-button'
import { LojaActionsMenu } from '@/components/lojas/loja-actions-menu'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Building2, Car, MapPin, Zap, Clock, AlertCircle } from 'lucide-react'

const DMS_LABEL: Record<string, string> = {
  AUTOCERTO:    'AutoCerto',
  COCKPIT:      'Cockpit',
  REVENDA_MAIS: 'Revenda Mais',
  MOTOR21:      'Motor21',
  MANUAL:       'Manual',
}

const PARTNER_COLORS = [
  'bg-primary/20 text-primary',
  'bg-purple-500/20 text-purple-400',
  'bg-green-500/20 text-green-400',
  'bg-orange-500/20 text-orange-400',
  'bg-pink-500/20 text-pink-400',
  'bg-cyan-500/20 text-cyan-400',
]

export default async function LojasPage() {
  const store = await getActiveStore()

  const partners = store
    ? await prisma.partner.findMany({
        where:   { storeId: store.id, isActive: true },
        orderBy: { name: 'asc' },
        select: {
          id:           true,
          name:         true,
          city:         true,
          state:        true,
          locationNote: true,
          _count:       { select: { vehicles: { where: { status: { not: 'ARCHIVED' } } } } },
          integrations: { select: { id: true, adapter: true, isActive: true, lastSyncAt: true, lastSyncStatus: true, credentials: true } },
        },
      })
    : []

  const totalVehicles   = partners.reduce((s, p) => s + p._count.vehicles, 0)
  const withActiveSync  = partners.filter(p => p.integrations.some(i => i.isActive && i.adapter !== 'MANUAL')).length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Lojas Parceiras</h1>
          <p className="text-zinc-500 mt-1">
            {partners.length} loja{partners.length !== 1 ? 's' : ''} ·{' '}
            {totalVehicles} veículos em estoque ·{' '}
            {withActiveSync} com sync ativo
          </p>
        </div>
        <AddLojaDialog />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Lojas cadastradas', value: partners.length,  color: 'text-primary',      icon: Building2 },
          { label: 'Veículos em estoque', value: totalVehicles,   color: 'text-green-400',    icon: Car },
          { label: 'Sync ativo',          value: withActiveSync,  color: 'text-purple-400',   icon: Zap },
        ].map(stat => (
          <Card key={stat.label} className="bg-zinc-900/50 border-white/5">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={cn('w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center', stat.color)}>
                <stat.icon size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{stat.label}</p>
                <p className={cn('text-2xl font-black', stat.color)}>{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {partners.length === 0 && (
        <Card className="bg-zinc-900/50 border-white/5 border-dashed">
          <CardContent className="p-16 flex flex-col items-center gap-4">
            <Building2 size={40} className="text-zinc-700" />
            <p className="text-zinc-500 font-medium">Nenhuma loja cadastrada ainda.</p>
            <p className="text-zinc-600 text-sm text-center max-w-sm">
              Adicione a primeira loja parceira e configure a integração com o DMS dela para sincronizar o estoque automaticamente.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Grid de lojas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {partners.map((partner, idx) => {
          const colorCls       = PARTNER_COLORS[idx % PARTNER_COLORS.length]
          const activeInteg    = partner.integrations.find(i => i.isActive && i.adapter !== 'MANUAL')
          const manualInteg    = partner.integrations.find(i => i.adapter === 'MANUAL')
          const primaryInteg   = activeInteg ?? manualInteg ?? partner.integrations[0]
          const isAutomatic    = !!activeInteg

          return (
            <Card key={partner.id} className="bg-zinc-900/50 border-white/5 hover:border-white/10 transition-all">
              <CardContent className="p-6 space-y-5">
                {/* Top: avatar + info + badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0', colorCls.split(' ')[0])}>
                      <span className={cn('text-xl font-black', colorCls.split(' ')[1])}>
                        {partner.name[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-black text-white text-lg leading-tight">{partner.name}</h3>
                      <div className="flex items-center gap-1 text-zinc-500 text-xs mt-0.5">
                        <MapPin size={11} /> {partner.city}, {partner.state}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    {isAutomatic ? (
                      <Badge className="text-[9px] font-black border-none bg-primary/15 text-primary">
                        {DMS_LABEL[activeInteg!.adapter] ?? activeInteg!.adapter}
                      </Badge>
                    ) : (
                      <Badge className="text-[9px] font-black border-none bg-zinc-800 text-zinc-400">
                        Manual
                      </Badge>
                    )}
                    <Badge className="text-[9px] font-black border-none bg-green-600/20 text-green-500">
                      ATIVO
                    </Badge>
                    <LojaActionsMenu loja={{
                      id:           partner.id,
                      name:         partner.name,
                      city:         partner.city,
                      state:        partner.state,
                      locationNote: partner.locationNote ?? null,
                      integrations: partner.integrations.map(i => ({
                        adapter:     i.adapter,
                        credentials: decryptCredentials((i.credentials ?? {}) as Record<string, unknown>),
                      })),
                    }} />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 py-4 border-y border-white/5">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Car size={10} /> Veículos em estoque
                    </p>
                    <p className="text-2xl font-black text-white">{partner._count.vehicles}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Clock size={10} /> Último sync
                    </p>
                    {primaryInteg?.lastSyncAt ? (
                      <div>
                        <p className="text-sm font-bold text-white">
                          {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(primaryInteg.lastSyncAt))}
                        </p>
                        {primaryInteg.lastSyncStatus && (
                          <span className={cn('text-[10px] font-bold', primaryInteg.lastSyncStatus === 'OK' ? 'text-green-500' : 'text-red-400')}>
                            {primaryInteg.lastSyncStatus === 'OK' ? '✓ OK' : '✗ Erro'}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-600 font-medium">Nunca sincronizado</p>
                    )}
                  </div>
                </div>

                {/* Action */}
                {isAutomatic && activeInteg ? (
                  <SyncLojaButton integrationId={activeInteg.id} />
                ) : (
                  <div className="flex items-center gap-2 text-xs text-zinc-600 py-1">
                    <AlertCircle size={12} />
                    Cadastro manual — sem sync automático
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
