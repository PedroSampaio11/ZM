'use client'

import { useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Plus, Loader2, Building2 } from 'lucide-react'
import { createStore } from '@/lib/store-actions'

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

const inputCls = 'w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all'
const selectCls = `${inputCls} [&>option]:bg-zinc-900 cursor-pointer`

export function NewStoreDialog() {
  const [open, setOpen]       = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [slug, setSlug]       = useState('')
  const [isPending, startTransition] = useTransition()

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(slugify(e.target.value))
  }

  function handleSubmit(formData: FormData) {
    formData.set('slug', slug)
    setError(null)
    startTransition(async () => {
      const result = await createStore(formData)
      if (result?.error) { setError(result.error) }
      else { setOpen(false); setSlug('') }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="px-4 py-2.5 bg-primary rounded-xl text-xs font-bold text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
        <Plus size={15} /> Nova Loja
      </DialogTrigger>

      <DialogContent className="bg-[#1E1E26] border border-white/10 text-white max-w-md rounded-2xl p-0 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 size={18} className="text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-white">Nova Loja</DialogTitle>
            </DialogHeader>
          </div>
          <p className="text-zinc-500 text-xs ml-12">Crie um novo tenant no marketplace.</p>
        </div>

        <form action={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nome da Loja</Label>
            <Input
              name="name"
              required
              placeholder="Ex: Via Brasil Multimarcas"
              className={inputCls}
              onChange={handleNameChange}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Slug (URL)</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">motorz.com/</span>
              <input
                name="slug"
                required
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="via-brasil"
                className={`${inputCls} pl-32`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Plano</Label>
              <select name="plan" defaultValue="STARTER" className={selectCls}>
                <option value="STARTER">Starter</option>
                <option value="PROFESSIONAL">Professional</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">CNPJ (opcional)</Label>
              <Input
                name="document"
                placeholder="14 dígitos"
                maxLength={14}
                className={inputCls}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <p className="text-red-400 text-xs font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-zinc-400 bg-white/5 hover:bg-white/10 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isPending ? <><Loader2 size={14} className="animate-spin" /> Criando...</> : 'Criar Loja'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
