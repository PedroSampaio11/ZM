'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Vehicle } from '@/modules/inventory/types';
import { VehicleCard } from '@/components/vehicle-card';
import { LeadBottomSheet } from '@/components/lead-bottom-sheet';
import { Search, ArrowLeft, ArrowRight, MapPin } from 'lucide-react';

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

  const allBrands = ['Todos', ...brands];
  const allCities = ['Todas', ...cities];

  const filtered = vehicles.filter(v => {
    const matchBrand  = activeBrand === 'Todos' || v.brand?.toLowerCase() === activeBrand.toLowerCase();
    const matchSearch = !searchQuery || `${v.brand} ${v.model} ${v.version}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPrice  = matchesPrice(v.price, priceRange);
    const matchCity   = activeCity === 'Todas' || v.partnerCity === activeCity;
    return matchBrand && matchSearch && matchPrice && matchCity;
  });

  const hasFilter = activeBrand !== 'Todos' || priceRange !== 'all' || activeCity !== 'Todas' || !!searchQuery;

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
              <ArrowLeft size={14} /> Início
            </Link>
            <span style={{ color: 'var(--border)', fontSize: '13px' }}>·</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mz-royal)' }}>Catálogo Completo</span>
          </nav>

          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, color: 'var(--mz-ink)', margin: 0 }}>
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
              Carregar mais veículos <ArrowRight size={20} />
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
