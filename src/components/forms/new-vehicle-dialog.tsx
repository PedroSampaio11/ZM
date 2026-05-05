'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Plus, Loader2, Car } from 'lucide-react'
import { createVehicle } from '@/lib/vehicle-actions'

const inputCls = 'w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all'
const selectCls = `${inputCls} [&>option]:bg-zinc-900 cursor-pointer`

interface Partner { id: string; name: string }
interface Props { storeId: string; partners: Partner[] }

const currentYear = new Date().getFullYear()

export function NewVehicleDialog({ storeId, partners }: Props) {
  const [open, setOpen]   = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await createVehicle(formData)
      if (result?.error) { setError(result.error) }
      else { setOpen(false) }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="px-4 py-2.5 bg-primary rounded-xl text-xs font-bold text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
        <Plus size={15} /> Novo Veículo
      </DialogTrigger>

      <DialogContent className="bg-[#1E1E26] border border-white/10 text-white max-w-lg rounded-2xl p-0 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Car size={18} className="text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-white">Novo Veículo</DialogTitle>
            </DialogHeader>
          </div>
          <p className="text-zinc-500 text-xs ml-12">Cadastro manual — sem integração com DMS.</p>
        </div>

        <form action={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <input type="hidden" name="storeId" value={storeId} />

          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Parceiro</Label>
            <select name="partnerId" required className={selectCls}>
              <option value="">Selecione um parceiro...</option>
              {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Marca</Label>
              <Input name="brand" required placeholder="Ex: BMW" className={inputCls} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Modelo</Label>
              <Input name="model" required placeholder="Ex: M4 Competition" className={inputCls} />
            </div>

            <div className="col-span-2 space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Versão</Label>
              <Input name="version" placeholder="Ex: xDrive, PDK, V8..." className={inputCls} />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ano</Label>
              <Input name="year" type="number" required min="1990" max={currentYear + 1} defaultValue={currentYear} className={inputCls} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">KM</Label>
              <Input name="mileage" type="number" required min="0" defaultValue="0" className={inputCls} />
            </div>

            <div className="col-span-2 space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Preço (R$)</Label>
              <Input name="price" type="number" required min="1" step="0.01" placeholder="Ex: 150000" className={inputCls} />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Combustível</Label>
              <select name="fuel" className={selectCls}>
                <option value="">—</option>
                <option>Gasolina</option>
                <option>Flex</option>
                <option>Diesel</option>
                <option>Elétrico</option>
                <option>Híbrido</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Câmbio</Label>
              <select name="transmission" className={selectCls}>
                <option value="">—</option>
                <option>Automático</option>
                <option>Manual</option>
                <option>PDK</option>
                <option>CVT</option>
              </select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Cor</Label>
              <Input name="color" placeholder="Ex: Preto, Branco Pearl..." className={inputCls} />
            </div>

            <div className="col-span-2 space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Descrição</Label>
              <textarea
                name="description"
                rows={3}
                placeholder="Opcionais, estado de conservação..."
                className={`${inputCls} resize-none`}
              />
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
