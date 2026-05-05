import { ArrowLeft, User, Phone, Mail, Car, MessageSquare, TrendingUp, Clock, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const statusConfig = {
  NEW:           { label: 'Novo',           className: 'bg-zinc-700 text-zinc-300' },
  AI_QUALIFYING: { label: 'IA Qualificando',className: 'bg-purple-600/20 text-purple-400' },
  QUALIFIED:     { label: 'Qualificado',    className: 'bg-green-600/20 text-green-400' },
  HANDOFF_HUMAN: { label: 'Humano',         className: 'bg-orange-600/20 text-orange-400' },
  LOST:          { label: 'Perdido',        className: 'bg-red-600/20 text-red-400' },
  CONVERTED:     { label: 'Convertido',     className: 'bg-primary/20 text-primary' },
}

const originLabel: Record<string, string> = {
  FACEBOOK_ADS: 'Facebook Ads',
  GOOGLE_ADS:   'Google Ads',
  ORGANIC:      'Orgânico',
  WHATSAPP:     'WhatsApp',
  REFERRAL:     'Indicação',
  PARTNER:      'Parceiro',
  PLATFORM_WEB: 'Site',
}

async function updateLeadStatus(leadId: string, formData: FormData) {
  'use server'
  const status = formData.get('status') as string
  await prisma.lead.update({ where: { id: leadId }, data: { status: status as never } })
  revalidatePath(`/admin/leads/${leadId}`)
}

async function addInteraction(leadId: string, formData: FormData) {
  'use server'
  const content   = formData.get('content') as string
  const direction = (formData.get('direction') as string) || 'OUTBOUND'
  if (!content?.trim()) return
  await prisma.interaction.create({
    data: { leadId, channel: 'INTERNAL', direction: direction as never, content },
  })
  revalidatePath(`/admin/leads/${leadId}`)
}

type Params = { params: Promise<{ id: string }> }

export default async function LeadDetailPage({ params }: Params) {
  const { id } = await params

  const lead = await prisma.lead.findUnique({
    where:   { id },
    include: {
      vehicle:      { select: { id: true, brand: true, model: true, version: true, year: true, price: true } },
      partner:      { select: { id: true, name: true, city: true, state: true } },
      interactions: { orderBy: { createdAt: 'asc' } },
      simulations:  { orderBy: { createdAt: 'desc' }, take: 3 },
    },
  })

  if (!lead) notFound()

  const status     = statusConfig[lead.status as keyof typeof statusConfig]
  const scoreColor = lead.score >= 80 ? 'text-green-400' : lead.score >= 50 ? 'text-primary' : 'text-zinc-500'
  const scoreBar   = lead.score >= 80 ? 'bg-green-500' : lead.score >= 50 ? 'bg-primary' : 'bg-zinc-600'

  const updateStatus = updateLeadStatus.bind(null, lead.id)
  const addNote      = addInteraction.bind(null, lead.id)

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/admin/leads" className="flex items-center gap-1.5 text-zinc-500 hover:text-white text-sm transition-colors">
          <ArrowLeft size={14} /> Leads
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-zinc-300 text-sm font-bold">{lead.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna esquerda — info do lead */}
        <div className="space-y-6">
          {/* Card principal */}
          <Card className="bg-zinc-900/50 border-white/5">
            <CardContent className="p-6">
              {/* Avatar + nome */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                  <span className="text-2xl font-black text-primary">{lead.name[0].toUpperCase()}</span>
                </div>
                <h2 className="text-xl font-black text-white">{lead.name}</h2>
                <Badge className={cn("mt-2 text-[10px] font-bold border-none", status.className)}>
                  {status.label}
                </Badge>
              </div>

              {/* Score */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Score IA</span>
                  <span className={cn("text-lg font-black", scoreColor)}>{lead.score}</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all", scoreBar)} style={{ width: `${lead.score}%` }} />
                </div>
              </div>

              {/* Contato */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <Phone size={14} className="text-zinc-600 flex-shrink-0" />
                  <span className="font-medium">{lead.phone}</span>
                </div>
                {lead.email && (
                  <div className="flex items-center gap-3 text-sm text-zinc-400">
                    <Mail size={14} className="text-zinc-600 flex-shrink-0" />
                    <span className="font-medium truncate">{lead.email}</span>
                  </div>
                )}
                {lead.origin && (
                  <div className="flex items-center gap-3 text-sm text-zinc-400">
                    <TrendingUp size={14} className="text-zinc-600 flex-shrink-0" />
                    <span className="font-medium">{originLabel[lead.origin] ?? lead.origin}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <Clock size={14} className="text-zinc-600 flex-shrink-0" />
                  <span className="font-medium">
                    {new Intl.DateTimeFormat('pt-BR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }).format(new Date(lead.createdAt))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Veículo de interesse */}
          {lead.vehicle && (
            <Card className="bg-zinc-900/50 border-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Car size={12} /> Interesse
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs font-bold text-primary uppercase">{lead.vehicle.brand}</p>
                <p className="font-bold text-white">
                  {lead.vehicle.model} {lead.vehicle.version}
                </p>
                <p className="text-xs text-zinc-500">{lead.vehicle.year}</p>
                <p className="text-lg font-black text-white mt-2">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Number(lead.vehicle.price))}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Alterar status */}
          <Card className="bg-zinc-900/50 border-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Alterar Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map(s => (
                <form key={s} action={updateStatus}>
                  <input type="hidden" name="status" value={s} />
                  <button
                    type="submit"
                    className={cn(
                      "w-full py-2 px-3 rounded-xl text-xs font-bold text-left transition-all",
                      lead.status === s
                        ? cn("border-none", statusConfig[s].className)
                        : "text-zinc-600 hover:text-zinc-300 hover:bg-white/5"
                    )}
                  >
                    {statusConfig[s].label}
                  </button>
                </form>
              ))}
            </CardContent>
          </Card>

          {/* Resumo IA */}
          {lead.summary && (
            <Card className="bg-purple-900/10 border border-purple-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-bold text-purple-400 uppercase tracking-widest">Resumo da IA</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-zinc-300 leading-relaxed">{lead.summary}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Coluna direita — interações */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-zinc-900/50 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
              <CardTitle className="font-bold text-white flex items-center gap-2">
                <MessageSquare size={16} className="text-primary" />
                Histórico de Interações
              </CardTitle>
              <span className="text-xs text-zinc-600">{lead.interactions.length} mensagens</span>
            </CardHeader>

            {/* Timeline */}
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
                {lead.interactions.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageSquare size={28} className="text-zinc-700 mx-auto mb-2" />
                    <p className="text-zinc-600 text-sm">Nenhuma interação registrada ainda.</p>
                  </div>
                ) : (
                  lead.interactions.map((interaction) => (
                    <div
                      key={interaction.id}
                      className={cn(
                        "p-5 flex gap-4",
                        interaction.direction === 'OUTBOUND' ? "bg-primary/3" : ""
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold",
                        interaction.direction === 'INBOUND'
                          ? "bg-zinc-700 text-zinc-300"
                          : "bg-primary/20 text-primary"
                      )}>
                        {interaction.direction === 'INBOUND' ? <User size={14} /> : <Send size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                            {interaction.direction === 'INBOUND' ? 'Cliente' : 'Equipe'}
                          </span>
                          <span className="text-[9px] text-zinc-700">
                            {interaction.channel}
                          </span>
                          <span className="text-[9px] text-zinc-700 ml-auto">
                            {new Intl.DateTimeFormat('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }).format(new Date(interaction.createdAt))}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed">{interaction.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add interaction form */}
              <form action={addNote} className="p-5 border-t border-white/5 space-y-3">
                <textarea
                  name="content"
                  required
                  rows={2}
                  placeholder="Adicionar nota ou mensagem..."
                  className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                />
                <div className="flex gap-3">
                  <select
                    name="direction"
                    className="bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-zinc-400 text-xs font-bold focus:outline-none [&>option]:bg-zinc-900"
                  >
                    <option value="OUTBOUND">Saída (Equipe)</option>
                    <option value="INBOUND">Entrada (Cliente)</option>
                  </select>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Send size={12} /> Registrar
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Simulações */}
          {lead.simulations.length > 0 && (
            <Card className="bg-zinc-900/50 border-white/5">
              <CardHeader>
                <CardTitle className="font-bold text-white text-sm flex items-center gap-2">
                  <TrendingUp size={14} className="text-zmove-gold" />
                  Simulações F&I
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lead.simulations.map(sim => (
                  <div key={sim.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Entrada</p>
                        <p className="text-sm font-black text-white">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Number(sim.downPayment))}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">{sim.installments}x de</p>
                        <p className="text-sm font-black text-zmove-gold">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Number(sim.monthlyPayment))}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Total</p>
                        <p className="text-sm font-black text-white">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Number(sim.totalAmount))}
                        </p>
                      </div>
                    </div>
                    {sim.bankName && (
                      <p className="text-[10px] text-zinc-600 text-center mt-2">{sim.bankName} · {sim.monthlyRate}% a.m.</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
