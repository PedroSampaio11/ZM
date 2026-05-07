'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Loader2, Building2, Zap } from 'lucide-react'
import { createLoja } from '@/lib/partner-actions'
import { cn } from '@/lib/utils'

const inputCls  = 'w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all'
const selectCls = `${inputCls} [&>option]:bg-zinc-900 cursor-pointer`

const BR_STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

type DmsField = { name: string; label: string; placeholder: string; type?: string }
type DmsOption = { value: string; label: string; note: string; fields: DmsField[] }

const DMS_OPTIONS: DmsOption[] = [
  {
    value: 'AUTOCERTO',
    label: 'AutoCerto',
    note: 'API REST — OAuth2',
    fields: [
      { name: 'dmsUsername', label: 'Usuário / Login', placeholder: 'usuario@autocerto.com' },
      { name: 'dmsPassword', label: 'Senha', placeholder: '••••••••', type: 'password' },
    ],
  },
  {
    value: 'REVENDA_MAIS',
    label: 'Revenda Mais',
    note: 'API REST — JWT',
    fields: [
      { name: 'dmsUsername', label: 'Usuário / Login', placeholder: 'usuario@revendamais.com.br' },
      { name: 'dmsPassword', label: 'Senha', placeholder: '••••••••', type: 'password' },
    ],
  },
  {
    value: 'COCKPIT',
    label: 'Cockpit DMS',
    note: 'API REST — API Key',
    fields: [
      { name: 'dmsApiKey',    label: 'API Key',    placeholder: 'ck_xxxxxxxxxxxxxxxx' },
      { name: 'dmsEmpresaId', label: 'Empresa ID', placeholder: '1234' },
    ],
  },
  {
    value: 'MOTOR21',
    label: 'Motor21',
    note: 'OAuth2 — Client Credentials',
    fields: [
      { name: 'dmsClientId',     label: 'Client ID',     placeholder: 'client_...' },
      { name: 'dmsClientSecret', label: 'Client Secret', placeholder: '••••••••', type: 'password' },
    ],
  },
  {
    value: 'MANUAL',
    label: 'Manual',
    note: 'Cadastro manual pelo painel',
    fields: [],
  },
]

export function AddLojaDialog() {
  const [open, setOpen]   = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dms, setDms]     = useState('AUTOCERTO')
  const [isPending, startTransition] = useTransition()

  const selectedDms = DMS_OPTIONS.find(d => d.value === dms)!

  function handleSubmit(formData: FormData) {
    formData.set('dms', dms)
    setError(null)
    startTransition(async () => {
      const result = await createLoja(formData)
      if (result?.error) { setError(result.error) }
      else { setOpen(false); setDms('AUTOCERTO') }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); setError(null) }}>
      <DialogTrigger className="px-5 py-2.5 bg-primary rounded-xl text-xs font-bold text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
        <Plus size={15} /> Adicionar Loja
      </DialogTrigger>

      <DialogContent className="bg-[#1E1E26] border border-white/10 text-white max-w-lg rounded-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 size={18} className="text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-white">Adicionar Loja Parceira</DialogTitle>
            </DialogHeader>
          </div>
          <p className="text-zinc-500 text-xs mt-2 ml-12">Cadastre a loja e configure a integração para sincronização automática do estoque.</p>
        </div>

        <form action={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Informações da Loja */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Informações da Loja</p>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nome da Empresa *</label>
              <input name="name" required placeholder="Ex: Daitan Motors" className={inputCls} />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">CNPJ (somente números) *</label>
              <input name="document" required placeholder="00000000000000" maxLength={14} pattern="\d{14}" className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Cidade *</label>
                <input name="city" required placeholder="São Paulo" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Estado *</label>
                <select name="state" required defaultValue="SP" className={selectCls}>
                  {BR_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* DMS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-primary" />
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sistema de Gestão (DMS)</p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {DMS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDms(opt.value)}
                  className={cn(
                    'p-3 rounded-xl text-left border transition-all',
                    dms === opt.value
                      ? 'bg-primary/10 border-primary/40 text-primary'
                      : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'
                  )}
                >
                  <p className="text-xs font-bold">{opt.label}</p>
                  <p className="text-[9px] text-zinc-600 mt-0.5">{opt.note}</p>
                </button>
              ))}
            </div>

            {selectedDms.fields.length > 0 && (
              <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Credenciais {selectedDms.label}
                </p>
                {selectedDms.fields.map(field => (
                  <div key={field.name} className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{field.label} *</label>
                    <input
                      name={field.name}
                      required
                      placeholder={field.placeholder}
                      type={field.type ?? 'text'}
                      autoComplete="off"
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <p className="text-red-400 text-xs font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 py-3 rounded-xl text-sm font-bold text-zinc-400 bg-white/5 hover:bg-white/10 transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {isPending ? <><Loader2 size={14} className="animate-spin" /> Cadastrando...</> : 'Cadastrar Loja'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
