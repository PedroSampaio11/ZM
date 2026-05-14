'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { VehiclePhotoUpload } from '@/components/forms/vehicle-photo-upload'
import { createVehicleFull } from '@/lib/vehicle-actions'
import { cn } from '@/lib/utils'
import { ArrowLeft, Loader2, Plus, Sparkles, CheckCircle } from 'lucide-react'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Partner { id: string; name: string; city: string }

interface VehicleFormProps {
  partners: Partner[]
}

const FUELS        = ['Flex', 'Gasolina', 'Diesel', 'Etanol', 'Elétrico', 'Híbrido']
const TRANSMISSIONS = ['Automático', 'Manual', 'CVT', 'PDK', 'Semi-automático']

function buildDescription(
  brand: string, model: string, version: string,
  year: number, mileage: number,
): string {
  const km = mileage > 0 ? `${mileage.toLocaleString('pt-BR')} km rodados` : '0 km (zero)'
  return (
    `${brand} ${model}${version ? ` ${version}` : ''} ${year} com ${km}. ` +
    `Veículo em excelente estado de conservação, revisado e com documentação em dia. ` +
    `Laudo cautelar aprovado. Financiamento facilitado — aceitamos seu usado na troca. ` +
    `Consulte condições especiais com nossos consultores.`
  )
}

// ─── Field helpers ────────────────────────────────────────────────────────────

const label = 'text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5 block'
const input = [
  'w-full rounded-xl bg-zinc-800/80 border border-white/5 px-4 py-2.5',
  'text-sm text-white placeholder:text-zinc-600',
  'focus:outline-none focus:ring-1 focus:ring-primary/50 transition',
].join(' ')
const select = [input, 'cursor-pointer'].join(' ')

// ─── Component ────────────────────────────────────────────────────────────────

export function VehicleForm({ partners }: VehicleFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [images, setImages] = useState<string[]>([])
  const [status, setStatus] = useState<'AVAILABLE' | 'INCOMING'>('AVAILABLE')
  const [error,  setError]  = useState<string | null>(null)
  const [done,   setDone]   = useState(false)

  const [f, setF] = useState({
    partnerId:    partners[0]?.id ?? '',
    brand:        '',
    model:        '',
    version:      '',
    year:         new Date().getFullYear(),
    mileage:      0,
    price:        0,
    fuel:         '',
    transmission: '',
    color:        '',
    description:  '',
  })

  const set = (key: keyof typeof f) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setF(prev => ({ ...prev, [key]: e.target.value }))

  const setNum = (key: 'year' | 'mileage' | 'price') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setF(prev => ({ ...prev, [key]: Number(e.target.value.replace(/\D/g, '')) || 0 }))

  function autoDesc() {
    if (!f.brand || !f.model) return
    setF(prev => ({
      ...prev,
      description: buildDescription(f.brand, f.model, f.version, f.year, f.mileage),
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!f.partnerId)       { setError('Selecione um parceiro');     return }
    if (!f.brand.trim())    { setError('Informe a marca');           return }
    if (!f.model.trim())    { setError('Informe o modelo');          return }
    if (f.price <= 0)       { setError('Informe o preço do veículo');return }

    startTransition(async () => {
      const result = await createVehicleFull({
        partnerId:    f.partnerId,
        brand:        f.brand.trim(),
        model:        f.model.trim(),
        version:      f.version.trim() || undefined,
        year:         f.year,
        mileage:      f.mileage,
        price:        f.price,
        fuel:         f.fuel || undefined,
        transmission: f.transmission || undefined,
        color:        f.color.trim() || undefined,
        description:  f.description.trim() || undefined,
        images,
        status,
      })

      if (result.error) { setError(result.error); return }
      setDone(true)
      setTimeout(() => router.push('/gestao/inventory'), 1200)
    })
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle size={32} className="text-green-400" />
        </div>
        <p className="text-lg font-bold text-white">Veículo cadastrado!</p>
        <p className="text-sm text-zinc-500">Redirecionando para o estoque…</p>
      </div>
    )
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/gestao/inventory"
            className="w-9 h-9 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center hover:bg-zinc-700 transition"
          >
            <ArrowLeft size={16} className="text-zinc-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Novo veículo</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Preencha os dados e adicione as fotos</p>
          </div>
        </div>

        {/* Status toggle */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-white/5 rounded-xl p-1">
          {(['AVAILABLE', 'INCOMING'] as const).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-xs font-bold transition-all',
                status === s
                  ? s === 'AVAILABLE'
                    ? 'bg-green-600/20 text-green-400'
                    : 'bg-amber-500/20 text-amber-400'
                  : 'text-zinc-500 hover:text-zinc-300',
              )}
            >
              {s === 'AVAILABLE' ? 'Publicar direto' : 'Salvar rascunho'}
            </button>
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

        {/* ── LEFT: form fields ── */}
        <div className="lg:col-span-3 space-y-6">

          {/* Parceiro */}
          <section className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Parceiro</h2>
            <div>
              <label className={label}>Loja / Concessionária *</label>
              <select value={f.partnerId} onChange={set('partnerId')} className={select}>
                <option value="" disabled>Selecione o parceiro</option>
                {partners.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {p.city}</option>
                ))}
              </select>
            </div>
          </section>

          {/* Identificação */}
          <section className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Identificação</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>Marca *</label>
                <input
                  value={f.brand} onChange={set('brand')} className={input}
                  placeholder="Toyota, Honda, VW…"
                />
              </div>
              <div>
                <label className={label}>Modelo *</label>
                <input
                  value={f.model} onChange={set('model')} className={input}
                  placeholder="Corolla, Civic, Polo…"
                />
              </div>
            </div>

            <div>
              <label className={label}>Versão / Acabamento</label>
              <input
                value={f.version} onChange={set('version')} className={input}
                placeholder="EXL 2.0 CVT, XRE 1.4 TSI, Track…"
              />
            </div>
          </section>

          {/* Dados técnicos */}
          <section className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Dados técnicos</h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={label}>Ano *</label>
                <input
                  type="number" min={1990} max={new Date().getFullYear() + 1}
                  value={f.year || ''} onChange={setNum('year')} className={input}
                  placeholder={String(new Date().getFullYear())}
                />
              </div>
              <div>
                <label className={label}>Quilometragem</label>
                <input
                  value={f.mileage > 0 ? f.mileage.toLocaleString('pt-BR') : ''}
                  onChange={setNum('mileage')} className={input}
                  placeholder="0"
                />
              </div>
              <div>
                <label className={label}>Preço (R$) *</label>
                <input
                  value={f.price > 0 ? f.price.toLocaleString('pt-BR') : ''}
                  onChange={setNum('price')} className={input}
                  placeholder="85.000"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={label}>Combustível</label>
                <select value={f.fuel} onChange={set('fuel')} className={select}>
                  <option value="">—</option>
                  {FUELS.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Câmbio</label>
                <select value={f.transmission} onChange={set('transmission')} className={select}>
                  <option value="">—</option>
                  {TRANSMISSIONS.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Cor</label>
                <input
                  value={f.color} onChange={set('color')} className={input}
                  placeholder="Prata, Branco…"
                />
              </div>
            </div>
          </section>

          {/* Descrição */}
          <section className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Descrição</h2>
              <button
                type="button"
                onClick={autoDesc}
                disabled={!f.brand || !f.model}
                className={cn(
                  'flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all',
                  f.brand && f.model
                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                    : 'text-zinc-600 cursor-not-allowed',
                )}
              >
                <Sparkles size={11} />
                Gerar automaticamente
              </button>
            </div>
            <textarea
              value={f.description} onChange={set('description')}
              rows={5}
              placeholder="Descreva o veículo: diferenciais, estado de conservação, extras incluídos…"
              className={cn(input, 'resize-none leading-relaxed')}
            />
          </section>
        </div>

        {/* ── RIGHT: photos ── */}
        <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-6">
          <section className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Fotos</h2>
            <p className="text-[11px] text-zinc-600 -mt-2">
              A primeira foto será a capa do anúncio.
            </p>
            <VehiclePhotoUpload
              value={images}
              onChange={setImages}
              folder={f.partnerId || 'temp'}
            />
          </section>
        </div>
      </div>

      {/* Footer: error + submit */}
      <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/5">
        {error ? (
          <p className="text-sm text-red-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            {error}
          </p>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-3">
          <Link
            href="/gestao/inventory"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 px-7 py-2.5 bg-primary hover:bg-mz-royal-light text-white font-bold rounded-xl text-sm transition-all disabled:opacity-60"
          >
            {pending ? (
              <><Loader2 size={15} className="animate-spin" /> Salvando…</>
            ) : (
              <><Plus size={15} /> {status === 'AVAILABLE' ? 'Publicar veículo' : 'Salvar rascunho'}</>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
