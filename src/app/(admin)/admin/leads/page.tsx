import { MessageSquare, Search, Filter, UserPlus } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { prisma } from "@/lib/prisma"
import { LeadStatus } from "@prisma/client"

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  NEW:            { label: 'Novo',           className: 'bg-zinc-700 text-zinc-300' },
  AI_QUALIFYING:  { label: 'IA Qualificando', className: 'bg-purple-600/20 text-purple-400' },
  QUALIFIED:      { label: 'Qualificado',    className: 'bg-green-600/20 text-green-400' },
  HANDOFF_HUMAN:  { label: 'Humano',         className: 'bg-orange-600/20 text-orange-400' },
  LOST:           { label: 'Perdido',        className: 'bg-red-600/20 text-red-400' },
  CONVERTED:      { label: 'Convertido',     className: 'bg-blue-600/20 text-blue-400' },
}

export default async function LeadsPage() {
  const [leads, counts] = await Promise.all([
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        vehicle: { select: { brand: true, model: true, year: true } },
        partner: { select: { name: true } },
        _count: { select: { interactions: true } },
      },
    }),
    prisma.lead.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
  ])

  const statusCounts = Object.fromEntries(counts.map(c => [c.status, c._count.status]))
  const total = leads.length
  const qualified = (statusCounts['QUALIFIED'] ?? 0) + (statusCounts['CONVERTED'] ?? 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Leads</h1>
          <p className="text-zinc-500">
            {total} leads · {qualified} qualificados
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              className="pl-10 bg-zinc-900/50 border-white/5 w-64 h-10 rounded-xl"
              placeholder="Buscar lead..."
            />
          </div>
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:bg-white/10 transition-all flex items-center gap-2">
            <Filter size={14} /> Filtros
          </button>
        </div>
      </div>

      {/* Stats por status */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {(Object.keys(statusConfig) as LeadStatus[]).map(s => (
          <Card key={s} className="bg-zinc-900/50 border-white/5">
            <CardContent className="p-4">
              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">
                {statusConfig[s].label}
              </p>
              <p className="text-2xl font-black text-white">{statusCounts[s] ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabela */}
      <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-xl">
        <CardContent className="p-0">
          {leads.length === 0 ? (
            <div className="p-16 flex flex-col items-center gap-4">
              <UserPlus size={40} className="text-zinc-700" />
              <p className="text-zinc-500 font-medium">Nenhum lead cadastrado ainda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="p-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Lead</th>
                    <th className="p-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                    <th className="p-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Interesse</th>
                    <th className="p-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Score</th>
                    <th className="p-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Interações</th>
                    <th className="p-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Origem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leads.map((lead) => {
                    const status = statusConfig[lead.status]
                    return (
                      <tr key={lead.id} className="hover:bg-white/5 transition-colors group">
                        <td className="p-6">
                          <p className="font-bold text-white text-sm">{lead.name}</p>
                          <p className="text-xs text-zinc-500">{lead.phone}</p>
                        </td>
                        <td className="p-6">
                          <Badge className={cn("text-[10px] font-bold border-none", status.className)}>
                            {status.label}
                          </Badge>
                        </td>
                        <td className="p-6 text-sm text-zinc-300 font-medium">
                          {lead.vehicle
                            ? `${lead.vehicle.brand} ${lead.vehicle.model} ${lead.vehicle.year}`
                            : <span className="text-zinc-600">—</span>}
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-white/5 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  lead.score >= 80 ? "bg-green-500" :
                                  lead.score >= 50 ? "bg-blue-500" : "bg-zinc-500"
                                )}
                                style={{ width: `${lead.score}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-zinc-400">{lead.score}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-1.5 text-zinc-500">
                            <MessageSquare size={12} />
                            <span className="text-xs font-bold">{lead._count.interactions}</span>
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          <span className="text-[10px] font-bold text-zinc-600">
                            {lead.origin ?? 'Orgânico'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
