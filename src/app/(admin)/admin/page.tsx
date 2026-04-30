import { Users, Car, TrendingUp, ArrowUpRight, Clock, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { prisma } from "@/lib/prisma"

export default async function AdminDashboard() {
  const [totalLeads, totalVehicles, availableVehicles, recentLeads, soldVehicles] = await Promise.all([
    prisma.lead.count(),
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
    prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        vehicle: { select: { brand: true, model: true } },
      },
    }),
    prisma.vehicle.count({ where: { status: 'SOLD' } }),
  ])

  const stats = [
    { name: 'Total Leads', value: String(totalLeads), change: 'cadastrados', icon: Users },
    { name: 'Carros em Estoque', value: String(availableVehicles), change: `de ${totalVehicles} total`, icon: Car },
    { name: 'Vendidos', value: String(soldVehicles), change: 'no sistema', icon: TrendingUp },
    { name: 'Evolution API', value: 'Pendente', change: 'Task 3.2', icon: Clock },
  ]

  const statusStyle: Record<string, string> = {
    NEW: 'bg-zinc-700/50 text-zinc-300',
    AI_QUALIFYING: 'bg-purple-600/20 text-purple-400',
    QUALIFIED: 'bg-green-600/20 text-green-400',
    HANDOFF_HUMAN: 'bg-orange-600/20 text-orange-400',
    LOST: 'bg-red-600/20 text-red-400',
    CONVERTED: 'bg-blue-600/20 text-blue-400',
  }

  const statusLabel: Record<string, string> = {
    NEW: 'Novo',
    AI_QUALIFYING: 'IA',
    QUALIFIED: 'Qualificado',
    HANDOFF_HUMAN: 'Humano',
    LOST: 'Perdido',
    CONVERTED: 'Convertido',
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Overview</h1>
          <p className="text-zinc-500">Painel de controle da Super Loja.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-zinc-400 hover:bg-white/10 transition-all flex items-center gap-2">
            <Filter size={14} /> Filtros
          </button>
          <button className="px-4 py-2 bg-blue-600 rounded-xl text-xs font-bold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20">
            Relatório
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="bg-zinc-900/50 border-white/5 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                {stat.name}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3 text-zinc-600" />
                <span className="text-[10px] text-zinc-600">{stat.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leads recentes */}
        <Card className="lg:col-span-2 bg-zinc-900/50 border-white/5 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-white">Leads Recentes</CardTitle>
            <a href="/leads" className="text-xs font-bold text-blue-500 hover:underline">Ver Todos</a>
          </CardHeader>
          <CardContent>
            {recentLeads.length === 0 ? (
              <p className="text-zinc-600 text-sm">Nenhum lead ainda.</p>
            ) : (
              <div className="space-y-4">
                {recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                        {lead.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{lead.name}</p>
                        <p className="text-xs text-zinc-500">
                          {lead.vehicle ? `${lead.vehicle.brand} ${lead.vehicle.model}` : lead.phone}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={cn("mb-1 text-[10px] font-bold border-none", statusStyle[lead.status])}>
                        {statusLabel[lead.status] ?? lead.status}
                      </Badge>
                      <p className="text-[10px] text-zinc-600">
                        {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(lead.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status do Sistema */}
        <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white">Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {[
                { label: 'Supabase DB', ok: true },
                { label: 'Prisma ORM', ok: true },
                { label: 'Evolution API', ok: false },
                { label: 'Agentes IA', ok: false },
              ].map(({ label, ok }) => (
                <div key={label} className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500">{label}</span>
                  <span className={cn("font-bold flex items-center gap-1.5", ok ? "text-green-500" : "text-zinc-600")}>
                    <div className={cn("w-1.5 h-1.5 rounded-full", ok ? "bg-green-500 animate-pulse" : "bg-zinc-600")} />
                    {ok ? 'Operacional' : 'Pendente'}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Fase 1</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-green-500 h-full w-full" />
                </div>
                <span className="text-[10px] font-black text-green-500">100%</span>
              </div>
              <p className="text-[10px] text-zinc-600 mt-2">Fundação &amp; Infra completa</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
