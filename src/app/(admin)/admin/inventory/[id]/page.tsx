import { ArrowLeft, Car, Building2, Tag, Fuel, Gauge, Palette, Calendar, Hash } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { VehicleStatus } from '@prisma/client'

const statusConfig: Record<VehicleStatus, { label: string; badge: string; dot: string }> = {
  AVAILABLE: { label: 'Disponível', badge: 'bg-green-600/20 text-green-400',  dot: 'bg-green-500' },
  RESERVED:  { label: 'Reservado',  badge: 'bg-primary/20 text-primary',       dot: 'bg-primary' },
  SOLD:      { label: 'Vendido',    badge: 'bg-zinc-700 text-zinc-400',        dot: 'bg-zinc-500' },
  ARCHIVED:  { label: 'Arquivado', badge: 'bg-zinc-800 text-zinc-600',        dot: 'bg-zinc-700' },
}

const statusActions: { status: VehicleStatus; label: string; style: string }[] = [
  { status: 'AVAILABLE', label: 'Marcar Disponível', style: 'bg-green-600/20 text-green-400 hover:bg-green-600/40 border-green-600/20' },
  { status: 'RESERVED',  label: 'Marcar Reservado',  style: 'bg-primary/20 text-primary hover:bg-primary/30 border-primary/20' },
  { status: 'SOLD',      label: 'Marcar Vendido',    style: 'bg-zinc-700/50 text-zinc-300 hover:bg-zinc-700 border-white/5' },
  { status: 'ARCHIVED',  label: 'Arquivar',          style: 'bg-red-600/10 text-red-500 hover:bg-red-600/20 border-red-600/10' },
]

async function changeStatus(vehicleId: string, formData: FormData) {
  'use server'
  const status = formData.get('status') as VehicleStatus
  await prisma.vehicle.update({ where: { id: vehicleId }, data: { status } })
  revalidatePath(`/admin/inventory/${vehicleId}`)
  revalidatePath('/admin/inventory')
}

type Params = { params: Promise<{ id: string }> }

export default async function VehicleDetailPage({ params }: Params) {
  const { id } = await params

  const vehicle = await prisma.vehicle.findUnique({
    where:   { id },
    include: {
      partner: { select: { id: true, name: true, city: true, state: true } },
      leads:   {
        orderBy: { createdAt: 'desc' },
        select:  { id: true, name: true, phone: true, status: true, createdAt: true },
      },
    },
  })

  if (!vehicle) notFound()

  const status = statusConfig[vehicle.status]
  const price  = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Number(vehicle.price))
  const changeStatusForVehicle = changeStatus.bind(null, vehicle.id)

  const specs = [
    { icon: Calendar, label: 'Ano',          value: String(vehicle.year) },
    { icon: Gauge,    label: 'Quilometragem', value: `${vehicle.mileage.toLocaleString('pt-BR')} km` },
    { icon: Fuel,     label: 'Combustível',   value: vehicle.fuel        ?? '—' },
    { icon: Tag,      label: 'Câmbio',        value: vehicle.transmission ?? '—' },
    { icon: Palette,  label: 'Cor',           value: vehicle.color        ?? '—' },
    { icon: Hash,     label: 'ID Externo',    value: vehicle.externalId  ?? 'Manual' },
  ]

  const leadStatusStyle: Record<string, string> = {
    NEW:           'bg-zinc-700/50 text-zinc-300',
    AI_QUALIFYING: 'bg-purple-600/20 text-purple-400',
    QUALIFIED:     'bg-green-600/20 text-green-400',
    HANDOFF_HUMAN: 'bg-orange-600/20 text-orange-400',
    LOST:          'bg-red-600/20 text-red-400',
    CONVERTED:     'bg-primary/20 text-primary',
  }
  const leadStatusLabel: Record<string, string> = {
    NEW: 'Novo', AI_QUALIFYING: 'IA', QUALIFIED: 'Qualificado',
    HANDOFF_HUMAN: 'Humano', LOST: 'Perdido', CONVERTED: 'Convertido',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/inventory"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-3"
          >
            <ArrowLeft size={13} /> Estoque
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-white tracking-tight">
              {vehicle.brand} {vehicle.model}
              {vehicle.version && (
                <span className="text-zinc-500 font-medium text-2xl"> {vehicle.version}</span>
              )}
            </h1>
            <Badge className={cn('text-xs font-bold border-none', status.badge)}>
              {status.label}
            </Badge>
          </div>
          <p className="text-2xl font-black text-zmove-gold mt-1">{price}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
          <Car className="w-5 h-5 text-zinc-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Especificações */}
        <Card className="lg:col-span-2 bg-card/50 border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground">Especificações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {specs.map(({ icon: Icon, label, value }) => (
                <div key={label} className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                    <Icon size={11} />
                    {label}
                  </div>
                  <p className="text-sm font-semibold text-foreground">{value}</p>
                </div>
              ))}
            </div>

            {vehicle.description && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Descrição</p>
                <p className="text-sm text-zinc-400 leading-relaxed">{vehicle.description}</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-600">
              <span>Último sync: {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(vehicle.lastSyncAt)}</span>
              <span>Cadastro: {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(vehicle.createdAt)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Painel lateral */}
        <div className="space-y-4">
          {/* Parceiro */}
          <Card className="bg-card/50 border-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Building2 size={14} className="text-zinc-500" /> Parceiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-bold text-white text-sm">{vehicle.partner.name}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{vehicle.partner.city}, {vehicle.partner.state}</p>
              <Link
                href={`/admin/lojas`}
                className="inline-block mt-3 text-[10px] font-bold text-primary hover:underline"
              >
                Ver na página de Lojas →
              </Link>
            </CardContent>
          </Card>

          {/* Alterar status */}
          <Card className="bg-card/50 border-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">Alterar Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {statusActions.map((action) => (
                <form key={action.status} action={changeStatusForVehicle}>
                  <input type="hidden" name="status" value={action.status} />
                  <button
                    type="submit"
                    disabled={vehicle.status === action.status}
                    className={cn(
                      'w-full px-3 py-2 rounded-lg text-xs font-bold border transition-all text-left',
                      action.style,
                      vehicle.status === action.status && 'opacity-40 cursor-not-allowed',
                    )}
                  >
                    {vehicle.status === action.status ? `✓ ${action.label.replace('Marcar ', '')}` : action.label}
                  </button>
                </form>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Leads vinculados */}
      <Card className="bg-card/50 border-white/5">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-foreground">
            Leads Vinculados{' '}
            <span className="text-zinc-600 font-normal">({vehicle.leads.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vehicle.leads.length === 0 ? (
            <p className="text-zinc-600 text-sm py-4 text-center">Nenhum lead vinculado a este veículo.</p>
          ) : (
            <div className="space-y-2">
              {vehicle.leads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/admin/leads/${lead.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.07] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                      {lead.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{lead.name}</p>
                      <p className="text-[10px] text-zinc-500">{lead.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={cn('text-[10px] font-bold border-none', leadStatusStyle[lead.status])}>
                      {leadStatusLabel[lead.status] ?? lead.status}
                    </Badge>
                    <span className="text-[10px] text-zinc-600">
                      {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(lead.createdAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
