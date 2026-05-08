import { Car } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { Prisma, VehicleStatus } from '@prisma/client'
import { NewVehicleDialog } from '@/components/forms/new-vehicle-dialog'
import { InventoryFilters } from '@/components/inventory-filters'
import { Suspense } from 'react'
import Link from 'next/link'
import { getActiveStore } from '@/lib/get-store'

const statusConfig: Record<VehicleStatus, { label: string; dot: string; badge: string }> = {
  AVAILABLE: { label: 'Disponível', dot: 'bg-green-500',  badge: 'bg-green-600/20 text-green-400' },
  RESERVED:  { label: 'Reservado',  dot: 'bg-primary',    badge: 'bg-primary/20 text-primary' },
  SOLD:      { label: 'Vendido',    dot: 'bg-zinc-500',   badge: 'bg-zinc-700 text-zinc-400' },
  ARCHIVED:  { label: 'Arquivado', dot: 'bg-zinc-700',   badge: 'bg-zinc-800 text-zinc-600' },
}

type SearchParams = {
  status?:    string
  search?:    string
  partnerId?: string
  brand?:     string
}

export default async function InventoryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { status: statusParam, search, partnerId: partnerParam, brand: brandParam } = await searchParams

  const store = await getActiveStore()

  const validStatus = Object.keys(statusConfig) as VehicleStatus[]
  const statusFilter = validStatus.includes(statusParam as VehicleStatus) ? (statusParam as VehicleStatus) : undefined

  const searchText   = search?.trim() || ''
  const partnerFilter = partnerParam?.trim() || ''
  const brandFilter   = brandParam?.trim() || ''

  const baseWhere: Prisma.VehicleWhereInput = {
    ...(store      ? { storeId: store.id } : {}),
    ...(statusFilter  ? { status: statusFilter } : {}),
    ...(partnerFilter ? { partnerId: partnerFilter } : {}),
    ...(brandFilter   ? { brand: { equals: brandFilter, mode: Prisma.QueryMode.insensitive } } : {}),
    ...(searchText    ? {
      OR: [
        { brand:   { contains: searchText, mode: Prisma.QueryMode.insensitive } },
        { model:   { contains: searchText, mode: Prisma.QueryMode.insensitive } },
        { version: { contains: searchText, mode: Prisma.QueryMode.insensitive } },
      ],
    } : {}),
  }

  const [vehicles, counts, partners, distinctBrands] = await Promise.all([
    prisma.vehicle.findMany({
      where:   baseWhere,
      orderBy: { updatedAt: 'desc' },
      include: { partner: { select: { name: true, city: true } } },
    }),
    prisma.vehicle.groupBy({
      by:    ['status'],
      where: store ? { storeId: store.id } : {},
      _count: { status: true },
    }),
    prisma.partner.findMany({
      where:   { ...(store ? { storeId: store.id } : {}), isActive: true },
      select:  { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.vehicle.findMany({
      where:   { ...(store ? { storeId: store.id } : {}), status: { not: 'ARCHIVED' } },
      select:  { brand: true },
      distinct: ['brand'],
      orderBy:  { brand: 'asc' },
    }),
  ])

  const countMap   = Object.fromEntries(counts.map(c => [c.status, c._count.status]))
  const totalCount = Object.values(countMap).reduce((s, v) => s + v, 0)
  const brands     = distinctBrands.map(v => v.brand)

  const filterTabs = [
    { label: 'Todos',      value: '',          count: totalCount },
    { label: 'Disponível', value: 'AVAILABLE', count: countMap['AVAILABLE'] ?? 0 },
    { label: 'Reservado',  value: 'RESERVED',  count: countMap['RESERVED']  ?? 0 },
    { label: 'Vendido',    value: 'SOLD',      count: countMap['SOLD']      ?? 0 },
    { label: 'Arquivado',  value: 'ARCHIVED',  count: countMap['ARCHIVED']  ?? 0 },
  ]

  const baseUrl = '/gestao/inventory'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Estoque</h1>
          <p className="text-zinc-500">
            {countMap['AVAILABLE'] ?? 0} disponíveis · {countMap['RESERVED'] ?? 0} reservados · {countMap['SOLD'] ?? 0} vendidos
          </p>
        </div>
        {store && partners.length > 0 && (
          <NewVehicleDialog storeId={store.id} partners={partners} />
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {filterTabs.map(tab => {
          const href = tab.value ? `${baseUrl}?status=${tab.value}` : baseUrl
          const isActive = (statusParam ?? '') === tab.value
          return (
            <Link
              key={tab.value}
              href={href}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all',
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-zinc-900/50 text-zinc-500 border border-white/5 hover:bg-zinc-800 hover:text-white'
              )}
            >
              {tab.label}
              <span className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black', isActive ? 'bg-white/20' : 'bg-white/5')}>
                {tab.count}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Filters */}
      <Suspense>
        <InventoryFilters partners={partners} brands={brands} />
      </Suspense>

      {/* Results count */}
      {(searchText || partnerFilter || brandFilter) && (
        <p className="text-xs text-zinc-600">
          {vehicles.length} resultado{vehicles.length !== 1 ? 's' : ''} encontrado{vehicles.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Grid */}
      {vehicles.length === 0 ? (
        <Card className="bg-zinc-900/50 border-white/5 border-dashed">
          <CardContent className="p-16 flex flex-col items-center gap-4">
            <Car size={40} className="text-zinc-700" />
            <p className="text-zinc-500 font-medium">
              {searchText || partnerFilter || brandFilter
                ? 'Nenhum veículo encontrado com esses filtros.'
                : statusFilter
                  ? `Nenhum veículo ${statusConfig[statusFilter].label.toLowerCase()}.`
                  : 'Nenhum veículo cadastrado ainda.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {vehicles.map(vehicle => {
            const status = statusConfig[vehicle.status]
            return (
              <Link key={vehicle.id} href={`/gestao/inventory/${vehicle.id}`}>
              <Card className="bg-zinc-900/50 border-white/5 overflow-hidden group hover:border-white/10 hover:border-primary/20 transition-all cursor-pointer">
                {/* Imagem placeholder */}
                <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Car size={36} className="text-zinc-700 group-hover:text-zinc-600 transition-colors" />
                  </div>
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-2">
                    <Badge className={cn('text-[9px] font-black border-none', status.badge)}>
                      {status.label}
                    </Badge>
                    <Badge className="text-[9px] font-black border-none bg-black/50 text-zinc-300 backdrop-blur-sm max-w-[120px] truncate">
                      {vehicle.partner.name}
                    </Badge>
                  </div>
                  {vehicle.externalId && (
                    <span className="absolute bottom-2 right-2 text-[8px] font-mono text-zinc-600 bg-black/40 px-1.5 py-0.5 rounded">
                      SYNC
                    </span>
                  )}
                </div>

                <CardContent className="p-4">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-0.5">
                    {vehicle.brand}
                  </p>
                  <h3 className="font-bold text-white leading-tight mb-1 text-sm">
                    {vehicle.model}{vehicle.version && <span className="text-zinc-500 font-medium"> {vehicle.version}</span>}
                  </h3>
                  <p className="text-[10px] text-zinc-600 mb-3">
                    {vehicle.year} · {vehicle.mileage.toLocaleString('pt-BR')} km
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-base font-black text-white">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Number(vehicle.price))}
                    </p>
                    <div className={cn('w-2 h-2 rounded-full', status.dot)} />
                  </div>
                </CardContent>
              </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
