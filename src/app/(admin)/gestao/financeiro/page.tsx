import { DollarSign, Target, TrendingUp, Car, Trophy, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/get-store'
import { updatePartnerFinancial } from '@/lib/partner-actions'
import { revalidatePath } from 'next/cache'

async function savePartnerFinancial(formData: FormData) {
  'use server'
  await updatePartnerFinancial(formData)
  revalidatePath('/gestao/financeiro')
}

const fmt = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n)

const pct = (n: number) => `${n.toFixed(1)}%`

export default async function FinanceiroPage() {
  const store = await getActiveStore()
  const sid   = store?.id

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const partners = await prisma.partner.findMany({
    where:   { ...(sid ? { storeId: sid } : {}), isActive: true },
    orderBy: { name: 'asc' },
    select: {
      id:         true,
      name:       true,
      city:       true,
      state:      true,
      commission: true,
      monthlyGoal: true,
      vehicles: {
        where:  { status: 'AVAILABLE' },
        select: { price: true },
      },
      leads: {
        where:  { status: 'CONVERTED', createdAt: { gte: startOfMonth } },
        select: { vehicle: { select: { price: true } } },
      },
      _count: {
        select: {
          vehicles: { where: { status: 'AVAILABLE' } },
          leads:    { where: { status: 'CONVERTED' } },
        },
      },
    },
  })

  // ── Calcular métricas por parceiro ──────────────────────────────────────────
  const enriched = partners.map((p) => {
    const portfolioValue    = p.vehicles.reduce((s, v) => s + Number(v.price), 0)
    const projectedRevenue  = portfolioValue * (p.commission / 100)
    const revenueThisMonth  = p.leads
      .filter((l) => l.vehicle?.price)
      .reduce((s, l) => s + Number(l.vehicle!.price) * (p.commission / 100), 0)
    const goal              = p.monthlyGoal ? Number(p.monthlyGoal) : null
    const remainingGoal     = goal !== null ? Math.max(0, goal - revenueThisMonth) : null
    const goalProgress      = goal ? Math.min(100, (revenueThisMonth / goal) * 100) : null
    const avgVehicleRevenue = p._count.vehicles > 0 ? projectedRevenue / p._count.vehicles : 0
    const carsNeeded        = remainingGoal && avgVehicleRevenue > 0
      ? Math.ceil(remainingGoal / avgVehicleRevenue)
      : null

    return { ...p, portfolioValue, projectedRevenue, revenueThisMonth, goal, remainingGoal, goalProgress, carsNeeded }
  })

  // Ordenar por portfólio (ranking)
  const ranked = [...enriched].sort((a, b) => b.portfolioValue - a.portfolioValue)

  // ── Métricas globais ─────────────────────────────────────────────────────────
  const totalPortfolio       = enriched.reduce((s, p) => s + p.portfolioValue, 0)
  const totalProjected       = enriched.reduce((s, p) => s + p.projectedRevenue, 0)
  const totalRevenueMonth    = enriched.reduce((s, p) => s + p.revenueThisMonth, 0)
  const totalGoal            = enriched.reduce((s, p) => s + (p.goal ?? 0), 0)
  const globalProgress       = totalGoal > 0 ? Math.min(100, (totalRevenueMonth / totalGoal) * 100) : null

  const topStats = [
    {
      label: 'Portfólio Total',
      value: fmt(totalPortfolio),
      sub:   `${enriched.reduce((s, p) => s + p._count.vehicles, 0)} veículos disponíveis`,
      icon:  Car,
      color: 'text-motorz-cyan',
    },
    {
      label: 'Receita Projetada',
      value: fmt(totalProjected),
      sub:   'se vender todo estoque disponível',
      icon:  TrendingUp,
      color: 'text-primary',
    },
    {
      label: 'Meta Global do Mês',
      value: totalGoal > 0 ? fmt(totalGoal) : '—',
      sub:   totalGoal > 0 ? `${pct(globalProgress ?? 0)} atingido` : 'Defina metas por loja abaixo',
      icon:  Target,
      color: 'text-motorz-gold',
    },
    {
      label: 'Receita do Mês',
      value: fmt(totalRevenueMonth),
      sub:   `${enriched.reduce((s, p) => s + p.leads.length, 0)} conversões em ${new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date())}`,
      icon:  DollarSign,
      color: totalRevenueMonth >= totalGoal && totalGoal > 0 ? 'text-green-400' : 'text-white',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Financeiro</h1>
        <p className="text-zinc-500 mt-1">Portfólio, metas e receita projetada por parceiro.</p>
      </div>

      {/* Stats globais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topStats.map((s) => (
          <Card key={s.label} className="bg-card/50 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                {s.label}
              </CardTitle>
              <div className={cn('p-1.5 rounded-lg bg-white/5', s.color)}>
                <s.icon className="w-3.5 h-3.5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn('text-2xl font-black', s.color)}>{s.value}</div>
              <p className="text-[11px] text-zinc-500 mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Barra de progresso global */}
      {globalProgress !== null && (
        <Card className="bg-card/50 border-white/5">
          <CardContent className="pt-5">
            <div className="flex justify-between text-xs mb-2">
              <span className="font-bold text-white">Progresso Global da Meta</span>
              <span className={cn('font-black', globalProgress >= 100 ? 'text-green-400' : 'text-motorz-gold')}>
                {pct(globalProgress)} — {fmt(totalRevenueMonth)} de {fmt(totalGoal)}
              </span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', globalProgress >= 100 ? 'bg-green-500' : 'bg-motorz-gold')}
                style={{ width: `${Math.min(100, globalProgress)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de parceiros */}
      <Card className="bg-card/50 border-white/5">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <Trophy size={16} className="text-motorz-gold" /> Ranking de Parceiros
          </CardTitle>
          <p className="text-[10px] text-zinc-600">Ordenado por portfólio · Clique na linha para editar meta</p>
        </CardHeader>
        <CardContent>
          {ranked.length === 0 ? (
            <p className="text-zinc-600 text-sm py-8 text-center">Nenhum parceiro ativo. Adicione lojas em /gestao/lojas.</p>
          ) : (
            <div className="space-y-3">
              {ranked.map((p, idx) => (
                <details key={p.id} className="group rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
                  {/* Linha resumo */}
                  <summary className="flex items-center gap-4 p-4 cursor-pointer list-none hover:bg-white/[0.04] transition-all">
                    {/* Rank */}
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0',
                      idx === 0 ? 'bg-motorz-gold/20 text-motorz-gold' :
                      idx === 1 ? 'bg-zinc-400/20 text-zinc-300' :
                      idx === 2 ? 'bg-orange-700/20 text-orange-500' :
                      'bg-white/5 text-zinc-500'
                    )}>
                      {idx + 1}
                    </div>

                    {/* Nome */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">{p.name}</p>
                      <p className="text-[10px] text-zinc-500">{p.city}, {p.state}</p>
                    </div>

                    {/* Veículos */}
                    <div className="text-center hidden sm:block w-20">
                      <p className="font-black text-white text-sm">{p._count.vehicles}</p>
                      <p className="text-[9px] text-zinc-600 uppercase tracking-wide">Veículos</p>
                    </div>

                    {/* Portfólio */}
                    <div className="text-right hidden md:block w-32">
                      <p className="font-black text-motorz-cyan text-sm">{fmt(p.portfolioValue)}</p>
                      <p className="text-[9px] text-zinc-600 uppercase tracking-wide">Portfólio</p>
                    </div>

                    {/* Comissão */}
                    <div className="text-center w-16">
                      <p className="font-black text-primary text-sm">{p.commission}%</p>
                      <p className="text-[9px] text-zinc-600 uppercase tracking-wide">Comissão</p>
                    </div>

                    {/* Receita projetada */}
                    <div className="text-right hidden lg:block w-28">
                      <p className="font-black text-motorz-gold text-sm">{fmt(p.projectedRevenue)}</p>
                      <p className="text-[9px] text-zinc-600 uppercase tracking-wide">Projetado</p>
                    </div>

                    {/* Status da meta */}
                    <div className="w-28 hidden xl:block">
                      {p.goal ? (
                        <div>
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span className={p.goalProgress! >= 100 ? 'text-green-400 font-bold' : 'text-zinc-400'}>
                              {pct(p.goalProgress!)}
                            </span>
                            {p.goalProgress! >= 100
                              ? <CheckCircle size={11} className="text-green-400" />
                              : <AlertCircle size={11} className="text-motorz-gold" />
                            }
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={cn('h-full rounded-full', p.goalProgress! >= 100 ? 'bg-green-500' : 'bg-motorz-gold')}
                              style={{ width: `${Math.min(100, p.goalProgress!)}%` }}
                            />
                          </div>
                          <p className="text-[9px] text-zinc-600 mt-1">meta {fmt(p.goal)}</p>
                        </div>
                      ) : (
                        <p className="text-[10px] text-zinc-600 italic">Sem meta</p>
                      )}
                    </div>
                  </summary>

                  {/* Painel expandido — Detalhes + editar meta */}
                  <div className="border-t border-white/5 px-4 pb-4 pt-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Insights */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Insights do mês</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/[0.03] rounded-xl p-3">
                          <p className="text-[10px] text-zinc-500">Receita realizada</p>
                          <p className="font-black text-green-400">{fmt(p.revenueThisMonth)}</p>
                        </div>
                        <div className="bg-white/[0.03] rounded-xl p-3">
                          <p className="text-[10px] text-zinc-500">Conversões no mês</p>
                          <p className="font-black text-white">{p.leads.length}</p>
                        </div>
                        {p.carsNeeded !== null && (
                          <div className="bg-motorz-gold/5 border border-motorz-gold/10 rounded-xl p-3 col-span-2">
                            <p className="text-[10px] text-motorz-gold/70">Para bater a meta ainda falta</p>
                            <p className="font-black text-motorz-gold text-lg">{p.carsNeeded} venda{p.carsNeeded !== 1 ? 's' : ''}</p>
                            <p className="text-[9px] text-zinc-600">Faltam {fmt(p.remainingGoal!)} · média {fmt(p.portfolioValue / (p._count.vehicles || 1))} por carro</p>
                          </div>
                        )}
                        {p.goal && p.goalProgress! >= 100 && (
                          <div className="bg-green-600/10 border border-green-600/20 rounded-xl p-3 col-span-2">
                            <p className="text-xs font-bold text-green-400">✓ Meta atingida este mês!</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Formulário de edição */}
                    <div>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Editar meta e comissão</p>
                      <form action={savePartnerFinancial} className="space-y-3">
                        <input type="hidden" name="partnerId" value={p.id} />
                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">
                            Comissão (%)
                          </label>
                          <input
                            name="commission"
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            defaultValue={p.commission}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">
                            Meta mensal (R$)
                          </label>
                          <input
                            name="monthlyGoal"
                            type="number"
                            step="100"
                            min="0"
                            defaultValue={p.goal ?? ''}
                            placeholder="Ex: 50000"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 rounded-lg py-2 text-xs font-bold transition-all"
                        >
                          Salvar
                        </button>
                      </form>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
