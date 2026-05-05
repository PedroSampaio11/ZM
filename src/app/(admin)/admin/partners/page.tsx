import { Handshake, MapPin, Car, MessageSquare, RefreshCw, Building2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { NewPartnerDialog } from '@/components/forms/new-partner-dialog'
import { SyncConfigDialog } from '@/components/forms/sync-config-dialog'
import Link from 'next/link'

const ADAPTER_DISPLAY: Record<string, string> = {
  AUTOCERTO:    'AutoCerto',
  COCKPIT:      'Cockpit',
  REVENDA_MAIS: 'Revenda Mais',
  MOTOR21:      'Motor21',
  MANUAL:       'Manual',
}

export default async function PartnersPage({
  searchParams,
}: {
  searchParams: Promise<{ storeId?: string }>
}) {
  const { storeId: storeIdParam } = await searchParams

  // Se não há storeId na URL, usa o primeiro store ativo
  const store = storeIdParam
    ? await prisma.store.findUnique({ where: { id: storeIdParam } })
    : await prisma.store.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'asc' } })

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Building2 size={40} className="text-zinc-700" />
        <p className="text-zinc-500 font-medium">Nenhuma loja cadastrada.</p>
        <Link href="/admin/stores" className="text-primary text-sm font-bold hover:underline">
          Criar primeira loja →
        </Link>
      </div>
    )
  }

  const partners = await prisma.partner.findMany({
    where:   { storeId: store.id },
    orderBy: { name: 'asc' },
    include: {
      _count:       { select: { vehicles: true, leads: true } },
      integrations: { select: { id: true, adapter: true, isActive: true, lastSyncAt: true, lastSyncStatus: true } },
    },
  })

  const allStores = await prisma.store.findMany({
    where:   { isActive: true },
    select:  { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/stores" className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors">Lojas</Link>
            <span className="text-zinc-700">/</span>
            <span className="text-zinc-300 text-sm font-bold">{store.name}</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Parceiros</h1>
          <p className="text-zinc-500">
            {partners.length} lojista{partners.length !== 1 ? 's' : ''} credenciado{partners.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Seletor de loja */}
          {allStores.length > 1 && (
            <form>
              <select
                name="storeId"
                defaultValue={store.id}
                onChange={(e) => { window.location.href = `/admin/partners?storeId=${e.target.value}` }}
                className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-bold focus:outline-none [&>option]:bg-zinc-900"
              >
                {allStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </form>
          )}
          <NewPartnerDialog storeId={store.id} />
        </div>
      </div>

      {/* Grid de parceiros */}
      {partners.length === 0 ? (
        <Card className="bg-zinc-900/50 border-white/5 border-dashed">
          <CardContent className="p-16 flex flex-col items-center gap-4">
            <Handshake size={40} className="text-zinc-700" />
            <p className="text-zinc-500 font-medium">Nenhum parceiro cadastrado nesta loja.</p>
            <p className="text-zinc-600 text-sm">Clique em "Novo Parceiro" para começar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {partners.map((partner) => {
            const activeIntegration = partner.integrations.find(i => i.isActive && i.adapter !== 'MANUAL')
            return (
              <Card key={partner.id} className="bg-zinc-900/50 border-white/5 group hover:border-white/10 transition-all">
                <CardContent className="p-6">
                  {/* Top */}
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/5 group-hover:border-white/10 flex items-center justify-center transition-all">
                        <Handshake className="w-6 h-6 text-zinc-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg leading-none mb-1">{partner.name}</h3>
                        <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                          <MapPin size={11} /> {partner.city}, {partner.state}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Badge className={cn(
                        "text-[9px] font-black border-none",
                        partner.isActive ? "bg-green-600/20 text-green-500" : "bg-zinc-800 text-zinc-500"
                      )}>
                        {partner.isActive ? 'ATIVO' : 'INATIVO'}
                      </Badge>
                      {activeIntegration && (
                        <Badge className="text-[9px] font-black border-none bg-primary/15 text-primary">
                          {ADAPTER_DISPLAY[activeIntegration.adapter] ?? activeIntegration.adapter}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 py-4 border-y border-white/5">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Car size={10} /> Carros
                      </p>
                      <p className="text-xl font-black text-white">{partner._count.vehicles}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <MessageSquare size={10} /> Leads
                      </p>
                      <p className="text-xl font-black text-white">{partner._count.leads}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Comissão</p>
                      <p className="text-xl font-black text-white">{partner.commission}%</p>
                    </div>
                  </div>

                  {/* Integrations status */}
                  {partner.integrations.length > 0 && (
                    <div className="py-3 border-b border-white/5">
                      {partner.integrations.map(i => (
                        <div key={i.id} className="flex items-center gap-2 text-xs text-zinc-500">
                          <div className={cn("w-1.5 h-1.5 rounded-full", i.isActive ? "bg-green-500" : "bg-zinc-600")} />
                          <span className="font-medium">{ADAPTER_DISPLAY[i.adapter] ?? i.adapter}</span>
                          {i.lastSyncAt && (
                            <span className="text-zinc-700">
                              · {new Intl.DateTimeFormat('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }).format(new Date(i.lastSyncAt))}
                            </span>
                          )}
                          {i.lastSyncStatus && (
                            <span className={cn("font-bold", i.lastSyncStatus === 'OK' ? 'text-green-500' : 'text-red-400')}>
                              {i.lastSyncStatus}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Footer actions */}
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-[10px] text-zinc-700 font-mono">{partner.document}</p>
                    <div className="flex gap-4 items-center">
                      <SyncConfigDialog
                        partnerId={partner.id}
                        partnerName={partner.name}
                        storeId={store.id}
                        integrations={partner.integrations.map(i => ({
                          ...i,
                          lastSyncAt: i.lastSyncAt ? new Date(i.lastSyncAt) : null,
                        }))}
                      />
                      {activeIntegration && (
                        <div className="flex items-center gap-1 text-xs font-bold text-zmove-cyan">
                          <RefreshCw size={11} />
                          Sync ativo
                        </div>
                      )}
                    </div>
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
