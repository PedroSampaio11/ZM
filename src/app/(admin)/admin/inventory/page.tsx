import { Car, Search, Plus, Filter } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { prisma } from "@/lib/prisma"
import { VehicleStatus } from "@prisma/client"

const statusConfig: Record<VehicleStatus, { label: string; className: string }> = {
  AVAILABLE: { label: 'Disponível', className: 'bg-green-600 text-white' },
  RESERVED:  { label: 'Reservado',  className: 'bg-blue-600 text-white' },
  SOLD:      { label: 'Vendido',    className: 'bg-zinc-700 text-zinc-400' },
  ARCHIVED:  { label: 'Arquivado', className: 'bg-zinc-800 text-zinc-500' },
}

export default async function InventoryPage() {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { createdAt: 'desc' },
    include: { partner: { select: { name: true, city: true } } },
  })

  const counts = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === 'AVAILABLE').length,
    reserved:  vehicles.filter(v => v.status === 'RESERVED').length,
    sold:      vehicles.filter(v => v.status === 'SOLD').length,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Inventário</h1>
          <p className="text-zinc-500">
            {counts.available} disponíveis · {counts.reserved} reservados · {counts.sold} vendidos
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              className="pl-10 bg-zinc-900/50 border-white/5 w-64 h-10 rounded-xl focus:ring-blue-500/20"
              placeholder="Buscar veículo..."
            />
          </div>
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:bg-white/10 transition-all flex items-center gap-2">
            <Filter size={14} /> Filtros
          </button>
          <button className="px-4 py-2 bg-blue-600 rounded-xl text-xs font-bold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2">
            <Plus size={16} /> Novo Carro
          </button>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: counts.total, color: 'text-white' },
          { label: 'Disponíveis', value: counts.available, color: 'text-green-400' },
          { label: 'Reservados', value: counts.reserved, color: 'text-blue-400' },
          { label: 'Vendidos', value: counts.sold, color: 'text-zinc-500' },
        ].map(stat => (
          <Card key={stat.label} className="bg-zinc-900/50 border-white/5">
            <CardContent className="p-5">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className={cn("text-3xl font-black", stat.color)}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grid de veículos */}
      {vehicles.length === 0 ? (
        <Card className="bg-zinc-900/50 border-white/5 border-dashed">
          <CardContent className="p-16 flex flex-col items-center justify-center gap-4">
            <Car size={40} className="text-zinc-700" />
            <p className="text-zinc-500 font-medium">Nenhum veículo cadastrado ainda.</p>
            <p className="text-zinc-600 text-sm">Adicione um parceiro e sincronize o estoque.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vehicles.map((vehicle) => {
            const status = statusConfig[vehicle.status]
            return (
              <Card key={vehicle.id} className="bg-zinc-900/50 border-white/5 backdrop-blur-xl overflow-hidden group">
                <div className="aspect-video bg-zinc-800 relative">
                  <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                    <Car size={40} className="text-white" />
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge className={cn("text-[9px] font-black border-none", status.className)}>
                      {status.label}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-5">
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">
                    {vehicle.brand}
                  </p>
                  <h3 className="font-bold text-white mb-2">{vehicle.model}</h3>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-lg font-black text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                          Number(vehicle.price)
                        )}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {vehicle.year} · {vehicle.partner.name} · {vehicle.mileage.toLocaleString('pt-BR')} km
                      </p>
                    </div>
                    <button className="text-[10px] font-bold text-zinc-600 hover:text-white transition-colors">
                      Editar
                    </button>
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
