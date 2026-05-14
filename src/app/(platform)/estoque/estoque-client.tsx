'use client';

import { useState, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Vehicle } from '@/modules/inventory/types';
import { VehicleCard } from '@/components/vehicle-card';
import { LeadBottomSheet } from '@/components/lead-bottom-sheet';
import { Search, MapPin, Sparkles, X } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft02Icon, ArrowRight02Icon } from '@hugeicons/core-free-icons';

type SemanticFilters = {
  brand?:        string;
  model?:        string;
  priceMax?:     number;
  priceMin?:     number;
  fuel?:         'FLEX' | 'GASOLINE' | 'ETHANOL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';
  transmission?: 'AUTOMATIC' | 'MANUAL' | 'CVT';
  keywords?:     string[];
};

const BRAND_ALIASES: Record<string, string> = {
  'volkswagen': 'Volkswagen', 'vw': 'Volkswagen',
  'honda': 'Honda', 'toyota': 'Toyota', 'hyundai': 'Hyundai',
  'chevrolet': 'Chevrolet', 'chevy': 'Chevrolet',
  'ford': 'Ford', 'fiat': 'Fiat', 'nissan': 'Nissan',
  'renault': 'Renault', 'mitsubishi': 'Mitsubishi',
  'jeep': 'Jeep', 'bmw': 'BMW', 'mercedes': 'Mercedes-Benz',
  'audi': 'Audi', 'kia': 'Kia', 'peugeot': 'Peugeot',
  'citroen': 'Citroën', 'subaru': 'Subaru', 'chery': 'Chery',
  'caoa': 'CAOA', 'byd': 'BYD', 'volvo': 'Volvo',
};

// Normaliza valores de câmbio do banco (ex: 'Automático', 'AUTO', 'PDK') para o enum semântico
function normalizeTransmission(t: string | null | undefined): 'AUTOMATIC' | 'MANUAL' | 'CVT' | null {
  if (!t) return null
  const v = t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  if (v === 'cvt') return 'CVT'
  if (/automat|auto$|pdk|semi/.test(v)) return 'AUTOMATIC'
  if (/manual/.test(v)) return 'MANUAL'
  return null
}

function parseQuery(raw: string, knownBrands: string[]): SemanticFilters | null {
  if (raw.trim().length < 8 || !raw.includes(' ')) return null;

  // Normaliza: minúsculas, sem acento
  const q = raw.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  const f: SemanticFilters = {};

  // Preço máximo: "até 80k", "até 80 mil", "menos de 80000", "até R$ 80.000"
  const priceMax = q.match(/(?:ate|menos de|abaixo de|por ate|max)\s*r?\$?\s*([\d.,]+)\s*(mil|k)?/);
  if (priceMax) {
    let n = parseFloat(priceMax[1].replace('.', '').replace(',', '.'));
    const unit = priceMax[2];
    if (unit === 'mil' || unit === 'k') n *= 1000;
    else if (n < 2000) n *= 1000;
    f.priceMax = n;
  }

  // Câmbio
  if (/automat|cambio auto/.test(q))  f.transmission = 'AUTOMATIC';
  else if (/\bmanual\b/.test(q))       f.transmission = 'MANUAL';
  else if (/\bcvt\b/.test(q))          f.transmission = 'CVT';

  // Combustível
  if (/eletric|electric|ev\b/.test(q)) f.fuel = 'ELECTRIC';
  else if (/hibrid/.test(q))            f.fuel = 'HYBRID';
  else if (/diesel/.test(q))            f.fuel = 'DIESEL';
  else if (/etanol/.test(q))            f.fuel = 'ETHANOL';
  else if (/gasolina/.test(q))          f.fuel = 'GASOLINE';
  else if (/\bflex\b/.test(q))          f.fuel = 'FLEX';

  // Marca via aliases fixos
  for (const [alias, brand] of Object.entries(BRAND_ALIASES)) {
    if (new RegExp(`\\b${alias}\\b`).test(q)) { f.brand = brand; break; }
  }
  // Marca via lista real do estoque
  if (!f.brand) {
    for (const brand of knownBrands) {
      if (q.includes(brand.toLowerCase())) { f.brand = brand; break; }
    }
  }

  // Palavras-chave de carroceria
  const bodyMap: Record<string, string> = { suv: 'SUV', sedan: 'sedan', hatch: 'hatch', pickup: 'pickup', caminhonete: 'pickup', minivan: 'minivan' };
  for (const [pt, en] of Object.entries(bodyMap)) {
    if (q.includes(pt)) { f.keywords = [en]; break; }
  }

  const hasContent = Object.values(f).some(v => v !== undefined);
  return hasContent ? f : null;
}

export type EstoqueVehicle = Vehicle & { partnerCity?: string | null };

type PriceRange = 'all' | 'under150' | '150to400' | 'over400';

const PRICE_OPTIONS: { label: string; value: PriceRange }[] = [
  { label: 'Todos',         value: 'all'       },
  { label: 'Até R$ 150k',   value: 'under150'  },
  { label: 'R$ 150k–400k',  value: '150to400'  },
  { label: 'Acima R$ 400k', value: 'over400'   },
];

function matchesPrice(price: number, range: PriceRange): boolean {
  if (range === 'all')      return true;
  if (range === 'under150') return price < 150_000;
  if (range === '150to400') return price >= 150_000 && price <= 400_000;
  return price > 400_000;
}

const pill = (active: boolean): React.CSSProperties => ({
  flexShrink: 0,
  padding: '8px 16px',
  fontSize: '13px',
  fontWeight: 600,
  fontFamily: 'inherit',
  borderRadius: '10px',
  border: '1px solid',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'all 0.15s',
  background:  active ? '#1243B2' : 'white',
  borderColor: active ? '#1243B2' : 'var(--border)',
  color:       active ? 'white'   : 'var(--mz-slate)',
});

interface Props {
  vehicles:      EstoqueVehicle[];
  totalVehicles: number;
  brands:        string[];
  cities:        string[];
}

function buildParams(marca: string, preco: string, cidade: string, q: string): string {
  const sp = new URLSearchParams();
  if (marca && marca !== 'Todos') sp.set('marca', marca);
  if (preco && preco !== 'all')   sp.set('preco', preco);
  if (cidade && cidade !== 'Todas') sp.set('cidade', cidade);
  if (q) sp.set('q', q);
  return sp.size ? '?' + sp.toString() : '';
}

function EstoqueInner({ vehicles, totalVehicles, brands, cities }: Props) {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [activeBrand,  setActiveBrand]  = useState(searchParams.get('marca')  ?? 'Todos');
  const [priceRange,   setPriceRange]   = useState<PriceRange>((searchParams.get('preco') as PriceRange) ?? 'all');
  const [activeCity,   setActiveCity]   = useState(searchParams.get('cidade') ?? 'Todas');
  const [searchQuery,  setSearchQuery]  = useState(searchParams.get('q')      ?? '');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isSheetOpen,  setIsSheetOpen]  = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  const semanticFilters = useMemo(() => parseQuery(searchQuery, brands), [searchQuery, brands]);

  const allBrands = ['Todos', ...brands];
  const allCities = ['Todas', ...cities];

  const filtered = vehicles.filter(v => {
    const matchBrand  = activeBrand === 'Todos' || v.brand?.toLowerCase() === activeBrand.toLowerCase();
    const matchPrice  = matchesPrice(v.price, priceRange);
    const matchCity   = activeCity === 'Todas' || v.partnerCity === activeCity;

    if (semanticFilters) {
      const sf = semanticFilters;
      if (sf.brand       && !v.brand?.toLowerCase().includes(sf.brand.toLowerCase())) return false;
      if (sf.model       && !v.model?.toLowerCase().includes(sf.model.toLowerCase())) return false;
      if (sf.priceMax    && v.price > sf.priceMax)   return false;
      if (sf.priceMin    && v.price < sf.priceMin)   return false;
      if (sf.fuel        && v.fuel !== sf.fuel)        return false;
      if (sf.transmission && normalizeTransmission(v.transmission) !== sf.transmission) return false;
      if (sf.keywords?.length) {
        const haystack = `${v.brand} ${v.model} ${v.version} ${v.description}`.toLowerCase();
        if (!sf.keywords.every(k => haystack.includes(k.toLowerCase()))) return false;
      }
      return matchCity && matchBrand && matchPrice;
    }

    const matchSearch = !searchQuery || `${v.brand} ${v.model} ${v.version}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchBrand && matchSearch && matchPrice && matchCity;
  });

  const hasFilter = activeBrand !== 'Todos' || priceRange !== 'all' || activeCity !== 'Todas' || !!searchQuery || !!semanticFilters;

  function syncUrl(marca: string, preco: string, cidade: string, q: string) {
    router.replace('/estoque' + buildParams(marca, preco, cidade, q), { scroll: false });
  }

  function setBrand(brand: string) {
    setActiveBrand(brand); setVisibleCount(12);
    syncUrl(brand, priceRange, activeCity, searchQuery);
  }
  function setPrice(price: PriceRange) {
    setPriceRange(price); setVisibleCount(12);
    syncUrl(activeBrand, price, activeCity, searchQuery);
  }
  function setCity(city: string) {
    setActiveCity(city); setVisibleCount(12);
    syncUrl(activeBrand, priceRange, city, searchQuery);
  }
  function setSearch(q: string) {
    setSearchQuery(q); setVisibleCount(12);
    syncUrl(activeBrand, priceRange, activeCity, q);
  }
  function reset() {
    setActiveBrand('Todos'); setPriceRange('all'); setActiveCity('Todas');
    setSearchQuery(''); setVisibleCount(12);
    router.replace('/estoque', { scroll: false });
  }

  return (
    <div className="platform-container">

      {/* ── HEADER / FILTERS ── */}
      <section style={{ background: 'var(--mz-snow)', paddingTop: '140px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(16px, 5vw, 48px)' }}>

          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--mz-slate)', textDecoration: 'none' }}>
              <HugeiconsIcon icon={ArrowLeft02Icon} size={14} /> Início
            </Link>
            <span style={{ color: 'var(--border)', fontSize: '13px' }}>·</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mz-royal)' }}>Catálogo Completo</span>
          </nav>

          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--mz-ink)', margin: 0 }}>
                Todo o estoque
              </h1>
              <p style={{ color: 'var(--text-dim)', fontSize: '17px', fontWeight: 500, marginTop: '12px', marginBottom: 0 }}>
                {totalVehicles} veículos · curadoria motorz
              </p>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(18,67,178,0.06)', border: '1px solid rgba(18,67,178,0.12)', borderRadius: '100px', flexShrink: 0 }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1243B2', boxShadow: '0 0 6px rgba(18,67,178,0.5)' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', color: '#1243B2', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Tempo real</span>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <Search size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mz-slate-dim)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Busque por marca, modelo ou versão..."
              value={searchQuery}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '16px 44px', fontSize: '15px', fontFamily: 'inherit', fontWeight: 500, background: 'white', border: '1px solid var(--border)', borderRadius: '16px', outline: 'none', color: 'var(--mz-ink)', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#1243B2'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'}
            />
            {searchQuery && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'var(--mz-ash)', border: 'none', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', color: 'var(--mz-slate)', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            )}
          </div>

          {/* Busca Inteligente indicator */}
          {semanticFilters && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'rgba(18,67,178,0.06)', border: '1px solid rgba(18,67,178,0.15)', borderRadius: '12px', marginTop: '8px' }}>
              <Sparkles size={15} style={{ color: '#1243B2', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#1243B2', flex: 1 }}>
                Busca inteligente ativa
                {semanticFilters.brand && ` · ${semanticFilters.brand}`}
                {semanticFilters.model && ` ${semanticFilters.model}`}
                {semanticFilters.priceMax && ` · até ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(semanticFilters.priceMax)}`}
                {semanticFilters.transmission === 'AUTOMATIC' && ' · Automático'}
                {semanticFilters.transmission === 'MANUAL' && ' · Manual'}
                {semanticFilters.fuel && ` · ${semanticFilters.fuel}`}
              </span>
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1243B2', display: 'flex', padding: 0 }}>
                <X size={14} />
              </button>
            </div>
          )}

          {/* Filters — stacked vertically, each row scrolls horizontal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>

            {/* Região */}
            {cities.length > 0 && (
              <div>
                <span className="filter-row-label">
                  <MapPin size={11} /> Região
                </span>
                <div className="filter-scroll-row">
                  {allCities.map(city => (
                    <button key={city} onClick={() => setCity(city)} style={pill(activeCity === city)}>
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Marca */}
            <div>
              <span className="filter-row-label">Marca</span>
              <div className="filter-scroll-row">
                {allBrands.map(brand => (
                  <button key={brand} onClick={() => setBrand(brand)} style={pill(activeBrand === brand)}>
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {/* Preço */}
            <div>
              <span className="filter-row-label">Faixa de Preço</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {PRICE_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setPrice(opt.value)} style={pill(priceRange === opt.value)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dim)' }}>
              {filtered.length} veículo{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </span>
            {hasFilter && (
              <button onClick={reset} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 700, color: 'var(--mz-royal)', cursor: 'pointer', fontFamily: 'inherit' }}>
                × Limpar filtros
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── VEHICLE GRID ── */}
      <section style={{ background: 'var(--mz-snow)', padding: '60px 0 120px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(16px, 5vw, 48px)' }}>
          {filtered.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: '32px' }}>
              {filtered.slice(0, visibleCount).map((v, i) => (
                <VehicleCard key={v.id} vehicle={v} onInterest={v => { setSelectedVehicle(v); setIsSheetOpen(true); }} index={i} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <p style={{ fontSize: '18px', color: 'var(--text-dim)', marginBottom: '16px' }}>Nenhum veículo encontrado com esses filtros.</p>
              <button onClick={reset} className="btn-ghost" style={{ padding: '12px 32px' }}>Ver todos</button>
            </div>
          )}

          {visibleCount < filtered.length && (
            <button className="btn-load-more" onClick={() => setVisibleCount(prev => prev + 12)} style={{ marginTop: '80px' }}>
              Carregar mais veículos <HugeiconsIcon icon={ArrowRight02Icon} size={20} />
            </button>
          )}
        </div>
      </section>

      <LeadBottomSheet
        vehicle={selectedVehicle}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </div>
  );
}

export function EstoqueClient(props: Props) {
  return (
    <Suspense fallback={
      <div style={{ paddingTop: '200px', display: 'flex', justifyContent: 'center', color: 'var(--mz-slate-dim)', fontSize: '15px', fontWeight: 600 }}>
        Carregando estoque...
      </div>
    }>
      <EstoqueInner {...props} />
    </Suspense>
  );
}
