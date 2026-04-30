import { Handshake, Search, Plus, MapPin } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { prisma } from "@/lib/prisma"

export default async function PartnersPage() {
  const partners = await prisma.partner.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { vehicles: true, leads: true } },
    },
  })

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Parceiros</h1>
          <p className="text-zinc-500">
            {partners.length} lojista{partners.length !== 1 ? 's' : ''} credenciado{partners.length !== 1 ? 's' : ''}.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              className="pl-10 bg-zinc-900/50 border-white/5 w-64 h-10 rounded-xl"
              placeholder="Buscar parceiro..."
            />
          </div>
          <button className="px-4 py-2 bg-blue-600 rounded-xl text-xs font-bold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2">
            <Plus size={16} /> Novo Parceiro
          </button>
        </div>
      </div>

      {partners.length === 0 ? (
        <Card className="bg-zinc-900/50 border-white/5 border-dashed">
          <CardContent className="p-16 flex flex-col items-center gap-4">
            <Handshake size={40} className="text-zinc-700" />
            <p className="text-zinc-500 font-medium">Nenhum parceiro cadastrado ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {partners.map((partner) => (
            <Card
              key={partner.id}
              className="bg-zinc-900/50 border-white/5 backdrop-blur-xl group hover:border-white/10 transition-all"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/5 group-hover:border-white/10">
                      <Handshake className="w-6 h-6 text-zinc-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg leading-none mb-1">{partner.name}</h3>
                      <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                        <MapPin size={12} /> {partner.city}, {partner.state}
                      </div>
                    </div>
                  </div>
                  <Badge className={cn(
                    "text-[9px] font-black border-none",
                    partner.isActive ? "bg-green-600/20 text-green-500" : "bg-zinc-800 text-zinc-500"
                  )}>
                    {partner.isActive ? 'ATIVO' : 'INATIVO'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 py-4 border-y border-white/5">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Carros</p>
                    <p className="text-xl font-black text-white">{partner._count.vehicles}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Leads</p>
                    <p className="text-xl font-black text-white">{partner._count.leads}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Comissão</p>
                    <p className="text-xl font-black text-white">{partner.commission}%</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <p className="text-[10px] text-zinc-700 font-mono">{partner.document}</p>
                  <div className="flex gap-3">
                    <button className="text-xs font-bold text-zinc-500 hover:text-white transition-colors">Relatório</button>
                    <button className="text-xs font-bold text-blue-500 hover:underline">Configurar Sync</button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
