'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useRef } from 'react'
import { Search, X } from 'lucide-react'

interface Props {
  partners: { id: string; name: string }[]
  brands:   string[]
}

export function InventoryFilters({ partners, brands }: Props) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => updateParam('search', e.target.value), 400)
  }

  function clearAll() {
    router.push(pathname)
  }

  const hasFilters = searchParams.get('search') || searchParams.get('partnerId') || searchParams.get('brand')

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Busca */}
      <div className="relative flex-1 min-w-48">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
        <input
          type="text"
          placeholder="Buscar marca, modelo, versão..."
          defaultValue={searchParams.get('search') ?? ''}
          onChange={handleSearch}
          className="w-full bg-zinc-900/80 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
        />
      </div>

      {/* Filtro de loja */}
      <select
        value={searchParams.get('partnerId') ?? ''}
        onChange={e => updateParam('partnerId', e.target.value)}
        className="bg-zinc-900/80 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-zinc-400 font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 [&>option]:bg-zinc-900 transition-all"
      >
        <option value="">Todas as lojas</option>
        {partners.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      {/* Filtro de marca */}
      {brands.length > 0 && (
        <select
          value={searchParams.get('brand') ?? ''}
          onChange={e => updateParam('brand', e.target.value)}
          className="bg-zinc-900/80 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-zinc-400 font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 [&>option]:bg-zinc-900 transition-all"
        >
          <option value="">Todas as marcas</option>
          {brands.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      )}

      {/* Limpar filtros */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
        >
          <X size={12} /> Limpar
        </button>
      )}
    </div>
  )
}
