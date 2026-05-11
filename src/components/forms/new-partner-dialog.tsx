'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Plus, Loader2, Handshake } from 'lucide-react'
import { createPartner } from '@/lib/partner-actions'

const inputCls = 'w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all'
const selectCls = `${inputCls} [&>option]:bg-zinc-900 cursor-pointer`

const BR_STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

interface Props { storeId: string }

export function NewPartnerDialog({ storeId }: Props) {
  const [open, setOpen]   = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await createPartner(formData)
      if (result?.error) { setError(result.error) }
      else { setOpen(false) }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="px-4 py-2.5 bg-primary rounded-xl text-xs font-bold text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
        <Plus size={15} /> Novo Parceiro
      </DialogTrigger>

      <DialogContent className="bg-[#1E1E26] border border-white/10 text-white max-w-lg rounded-2xl p-0 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Handshake size={18} className="text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-white">Novo Parceiro</DialogTitle>
            </DialogHeader>
          </div>
          <p className="text-zinc-500 text-xs ml-12">Cadastre uma concessionária ou lojista.</p>
        </div>

        <form action={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <input type="hidden" name="storeId" value={storeId} />

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nome da Empresa</Label>
              <Input name="name" required placeholder="Ex: Daitan Motors" className={inputCls} />
            </div>

            <div className="col-span-2 space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">CNPJ (14 dígitos)</Label>
              <Input name="document" required placeholder="00000000000000" maxLength={14} className={inputCls} />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">E-mail</Label>
              <Input name="email" type="email" placeholder="contato@empresa.com" className={inputCls} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Telefone</Label>
              <Input name="phone" placeholder="11999990000" className={inputCls} />
            </div>

            <div className="col-span-2 space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Endereço</Label>
              <Input name="address" placeholder="Av. Paulista, 1000" className={inputCls} />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Cidade</Label>
              <Input name="city" required placeholder="São Paulo" className={inputCls} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Estado</Label>
              <select name="state" required defaultValue="SP" className={selectCls}>
                {BR_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Comissão (%)</Label>
              <Input name="commission" type="number" step="0.1" min="0" max="100" defaultValue="2.5" className={inputCls} />
            </div>

            <div className="col-span-2 space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Referência de Localização</Label>
              <Input name="locationNote" placeholder="Ex: 12 min do centro, Próximo ao Shopping Grand Plaza" maxLength={120} className={inputCls} />
              <p className="text-[10px] text-zinc-600">Aparece na página do veículo como gatilho de proximidade.</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <p className="text-red-400 text-xs font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 py-3 rounded-xl text-sm font-bold text-zinc-400 bg-white/5 hover:bg-white/10 transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {isPending ? <><Loader2 size={14} className="animate-spin" /> Salvando...</> : 'Cadastrar'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
