'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Settings, Loader2, RefreshCw, CheckCircle2, AlertCircle, Zap } from 'lucide-react'
import { configureIntegration, syncPartnerNow } from '@/lib/partner-actions'
import { cn } from '@/lib/utils'

const ADAPTER_LABELS: Record<string, string> = {
  AUTOCERTO:    'AutoCerto',
  COCKPIT:      'Cockpit DMS',
  REVENDA_MAIS: 'Revenda Mais',
  MOTOR21:      'Motor21',
  MANUAL:       'Manual',
}

const ADAPTER_STATUS: Record<string, { available: boolean; note: string }> = {
  AUTOCERTO:    { available: true,  note: 'Integração ativa — credenciais via .env' },
  COCKPIT:      { available: false, note: 'Em breve' },
  REVENDA_MAIS: { available: false, note: 'Em breve' },
  MOTOR21:      { available: false, note: 'Em breve' },
  MANUAL:       { available: true,  note: 'Cadastro manual via painel' },
}

interface Integration {
  id: string
  adapter: string
  isActive: boolean
  lastSyncAt: Date | null
  lastSyncStatus: string | null
}

interface Props {
  partnerId: string
  partnerName: string
  storeId: string
  integrations: Integration[]
}

export function SyncConfigDialog({ partnerId, partnerName, storeId, integrations }: Props) {
  const [open, setOpen]           = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [syncResult, setSyncResult] = useState<string | null>(null)
  const [selectedAdapter, setSelectedAdapter] = useState('AUTOCERTO')
  const [isPending, startTransition]           = useTransition()
  const [isSyncing, startSync]                 = useTransition()

  const activeIntegration = integrations.find(i => i.isActive && i.adapter !== 'MANUAL')

  function handleConfigure(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await configureIntegration(formData)
      if (result?.error) setError(result.error)
      else setError(null)
    })
  }

  function handleSync(integrationId: string) {
    setSyncResult(null)
    startSync(async () => {
      const result = await syncPartnerNow(integrationId)
      if (result?.error) {
        setSyncResult(`Erro: ${result.error}`)
      } else if (result?.result) {
        const r = result.result
        setSyncResult(`✓ ${r.upserted} sincronizados · ${r.archived} arquivados · ${r.errors} erros`)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); setSyncResult(null); setError(null) }}>
      <DialogTrigger className="text-xs font-bold text-zinc-500 hover:text-primary transition-colors flex items-center gap-1.5">
        <Settings size={12} /> Config. Sync
      </DialogTrigger>

      <DialogContent className="bg-[#1E1E26] border border-white/10 text-white max-w-md rounded-2xl p-0 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap size={18} className="text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-white">Sync — {partnerName}</DialogTitle>
            </DialogHeader>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Integrações ativas */}
          {integrations.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Integrações Configuradas</p>
              {integrations.map(i => (
                <div key={i.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", i.isActive ? "bg-green-500" : "bg-zinc-600")} />
                    <div>
                      <p className="text-sm font-bold text-white">{ADAPTER_LABELS[i.adapter] ?? i.adapter}</p>
                      {i.lastSyncAt && (
                        <p className="text-[10px] text-zinc-500">
                          Último sync: {new Intl.DateTimeFormat('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }).format(new Date(i.lastSyncAt))}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {i.lastSyncStatus && (
                      <Badge className={cn("text-[9px] border-none", i.lastSyncStatus === 'OK' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400')}>
                        {i.lastSyncStatus}
                      </Badge>
                    )}
                    {i.isActive && i.adapter !== 'MANUAL' && (
                      <button
                        onClick={() => handleSync(i.id)}
                        disabled={isSyncing}
                        className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all disabled:opacity-50"
                        title="Sincronizar agora"
                      >
                        <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {syncResult && (
                <div className={cn("flex items-center gap-2 p-3 rounded-xl text-xs font-medium", syncResult.startsWith('Erro') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400')}>
                  {syncResult.startsWith('Erro')
                    ? <AlertCircle size={14} />
                    : <CheckCircle2 size={14} />}
                  {syncResult}
                </div>
              )}
            </div>
          )}

          {/* Adicionar nova integração */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Adicionar Integração</p>
            <form action={handleConfigure} className="space-y-3">
              <input type="hidden" name="partnerId" value={partnerId} />
              <input type="hidden" name="storeId"   value={storeId} />
              <input type="hidden" name="adapter"   value={selectedAdapter} />

              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ADAPTER_LABELS).map(([key, label]) => {
                  const status = ADAPTER_STATUS[key]
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => status?.available && setSelectedAdapter(key)}
                      disabled={!status?.available}
                      className={cn(
                        "p-3 rounded-xl text-left border transition-all",
                        !status?.available && "opacity-40 cursor-not-allowed",
                        selectedAdapter === key
                          ? "bg-primary/10 border-primary/40 text-primary"
                          : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10"
                      )}
                    >
                      <p className="text-xs font-bold">{label}</p>
                      <p className="text-[9px] text-zinc-600 mt-0.5">{status?.note}</p>
                    </button>
                  )
                })}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <p className="text-red-400 text-xs">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isPending || !ADAPTER_STATUS[selectedAdapter]?.available}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isPending ? <><Loader2 size={14} className="animate-spin" /> Ativando...</> : `Ativar ${ADAPTER_LABELS[selectedAdapter]}`}
              </button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
