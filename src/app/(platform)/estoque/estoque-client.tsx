'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Vehicle } from '@/modules/inventory/types';
import { VehicleCard } from '@/components/vehicle-card';
import { LeadBottomSheet } from '@/components/lead-bottom-sheet';
import { Search, ArrowLeft, ArrowRight } from 'lucide-react';

type PriceRange = 'all' | 'under150' | '150to400' | 'over400';

const PRICE_OPTIONS: { label: string; value: PriceRange }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Até R$ 150k', value: 'under150' },
  { label: 'R$ 150k – 400k', value: '150to400' },
  { label: 'Acima R$ 400k', value: 'over400' },
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
  background:   active ? '#1243B2' : 'white',
  borderColor:  active ? '#1243B2' : 'var(--border)',
  color:        active ? 'white'   : 'var(--mz-slate)',
});

interface Props {
  vehicles:      Vehicle[];
  totalVehicles: number;
  totalPartners: number;
  brands:        string[];
}

export function EstoqueClient({ vehicles, totalVehicles, totalPartners, brands }: Props) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isSheetOpen,     setIsSheetOpen]     = useState(false);
  const [activeBrand,     setActiveBrand]     = useState('Todos');
  const [priceRange,      setPriceRange]      = useState<PriceRange>('all');
  const [searchQuery,     setSearchQuery]     = useState('');
  const [visibleCount,    setVisibleCount]    = useState(12);

  const allBrands = ['Todos', ...brands];
  const hasFilter = activeBrand !== 'Todos' || priceRange !== 'all' || searchQuery !== '';

  const filtered = vehicles.filter(v => {
    const matchBrand  = activeBrand === 'Todos' || v.brand?.toLowerCase() === activeBrand.toLowerCase();
    const matchSearch = !searchQuery || `${v.brand} ${v.model} ${v.version}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPrice  = matchesPrice(v.price, priceRange);
    return matchBrand && matchSearch && matchPrice;
  });

  function openSheet(vehicle: Vehicle) {
    setSelectedVehicle(vehicle);
    setIsSheetOpen(true);
  }

  function reset() {
    setActiveBrand('Todos');
    setPriceRange('all');
    setSearchQuery('');
    setVisibleCount(12);
  }

  return (
    <div className="platform-container">

      {/* ── HEADER / FILTERS ── */}
      <section style={{ background: 'var(--mz-snow)', paddingTop: '140px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 48px' }}>

          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--mz-slate)', textDecoration: 'none' }}>
              <ArrowLeft size={14} /> Início
            </Link>
            <span style={{ color: 'var(--border)', fontSize: '13px' }}>·</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mz-royal)' }}>Catálogo Completo</span>
          </nav>

          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap', marginBottom: '48px' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, color: 'var(--mz-ink)', margin: 0 }}>
                Todo o estoque
              </h1>
              <p style={{ color: 'var(--text-dim)', fontSize: '18px', fontWeight: 500, marginTop: '12px', marginBottom: 0 }}>
                {totalVehicles} veículos disponíveis · {totalPartners} lojas verificadas
              </p>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(18,67,178,0.06)', border: '1px solid rgba(18,67,178,0.12)', borderRadius: '100px', flexShrink: 0 }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1243B2', boxShadow: '0 0 6px rgba(18,67,178,0.5)' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', color: '#1243B2', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Atualizado em tempo real</span>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <Search size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mz-slate-dim)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Busque por marca, modelo ou versão..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setVisibleCount(12); }}
              style={{ width: '100%', padding: '16px 44px', fontSize: '15px', fontFamily: 'inherit', fontWeight: 500, background: 'white', border: '1px solid var(--border)', borderRadius: '16px', outline: 'none', color: 'var(--mz-ink)', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#1243B2'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'}
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setVisibleCount(12); }} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'var(--mz-ash)', border: 'none', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', color: 'var(--mz-slate)', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            )}
          </div>

          {/* Brand + Price filters */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mz-slate-dim)', display: 'block', marginBottom: '8px', paddingLeft: '4px' }}>Marca</span>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' } as React.CSSProperties}>
                {allBrands.map(brand => (
                  <button key={brand} onClick={() => { setActiveBrand(brand); setVisibleCount(12); }} style={pill(activeBrand === brand)}>{brand}</button>
                ))}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mz-slate-dim)', display: 'block', marginBottom: '8px', paddingLeft: '4px' }}>Faixa de Preço</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {PRICE_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => { setPriceRange(opt.value); setVisibleCount(12); }} style={pill(priceRange === opt.value)}>{opt.label}</button>
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
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 48px' }}>
          {filtered.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
              {filtered.slice(0, visibleCount).map((v, i) => (
                <VehicleCard key={v.id} vehicle={v} onInterest={openSheet} index={i} />
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
