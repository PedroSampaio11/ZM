'use client';

import { useState } from 'react';
import { Vehicle } from '@/modules/inventory/types';
import { VehicleCard } from '@/components/vehicle-card';
import { LeadBottomSheet } from '@/components/lead-bottom-sheet';
import {
  ShieldCheck, Search, ArrowRight, Mouse, Shield,
  Cloud, Zap, MessageSquare, Cpu, LayoutGrid,
} from 'lucide-react';

interface Props {
  vehicles:      Vehicle[];
  totalVehicles: number;
  totalPartners: number;
  brands:        string[];
  partners:      { name: string; initial: string }[];
}

type PriceRange = 'all' | 'under150' | '150to400' | 'over400';

const PRICE_OPTIONS: { label: string; value: PriceRange }[] = [
  { label: 'Todos os preços', value: 'all'       },
  { label: 'Até R$ 150k',     value: 'under150'  },
  { label: 'R$ 150k – 400k', value: '150to400'  },
  { label: 'Acima R$ 400k',  value: 'over400'   },
];

const TECH_FEATURES = [
  {
    icon:  <Cloud size={32} />,
    color: '#3B82F6',
    title: 'Sync em Tempo Real',
    desc:  'Estoque sincronizado automaticamente direto do DMS de cada parceiro. Sem digitação manual, sem atraso.',
    tag:   'AutoCerto · Cockpit · Motor21',
  },
  {
    icon:  <Zap size={32} />,
    color: '#FFC700',
    title: 'Velocidade',
    desc:  'Da visita ao contato com o consultor em menos de 2 minutos. Sem call center, sem burocracia.',
    tag:   'Resposta imediata',
  },
  {
    icon:  <Cpu size={32} />,
    color: '#A855F7',
    title: 'IA de Qualificação',
    desc:  'Nossa inteligência artificial conversa via WhatsApp, entende o que você busca e te conecta ao carro certo.',
    tag:   'Beta · Em breve',
  },
  {
    icon:  <Shield size={32} />,
    color: '#22C55E',
    title: 'Parceiros Verificados',
    desc:  'Cada loja passa por auditoria antes de entrar na rede. Dados reais, fotos reais, preços reais.',
    tag:   'Curadoria humana',
  },
];

function matchesPrice(price: number, range: PriceRange): boolean {
  if (range === 'all')      return true;
  if (range === 'under150') return price < 150_000;
  if (range === '150to400') return price >= 150_000 && price <= 400_000;
  return price > 400_000;
}

export function PlatformClient({ vehicles, totalVehicles, totalPartners, brands, partners }: Props) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isSheetOpen,     setIsSheetOpen]     = useState(false);
  const [activeBrand,     setActiveBrand]     = useState('Todos');
  const [priceRange,      setPriceRange]      = useState<PriceRange>('all');
  const [searchQuery,     setSearchQuery]     = useState('');
  const [visibleCount,    setVisibleCount]    = useState(6);

  const allBrands = ['Todos', ...brands];

  const filtered = vehicles.filter(v => {
    const matchBrand  = activeBrand === 'Todos' || v.brand?.toLowerCase() === activeBrand.toLowerCase();
    const matchSearch = !searchQuery || `${v.brand} ${v.model} ${v.version}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPrice  = matchesPrice(v.price, priceRange);
    return matchBrand && matchSearch && matchPrice;
  });

  const featuredVehicles = vehicles.slice(0, 3);
  const hasActiveFilter  = activeBrand !== 'Todos' || priceRange !== 'all' || searchQuery !== '';

  function openSheet(vehicle: Vehicle) {
    setSelectedVehicle(vehicle);
    setIsSheetOpen(true);
  }

  function resetFilters() {
    setActiveBrand('Todos');
    setPriceRange('all');
    setSearchQuery('');
    setVisibleCount(6);
  }

  const displayPartners = partners.length > 0 ? partners : [
    { name: 'Sua loja aqui', initial: 'SL' },
    { name: 'Seja parceiro', initial: 'SP' },
  ];

  return (
    <div className="platform-container">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-hero-gradient noise" style={{ minHeight: '92svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 100px', textAlign: 'center', position: 'relative' }}>
        <div className="hero-glow" />

        <div className="chip-premium anim-fade-up" style={{ marginBottom: '32px', position: 'relative', zIndex: 1 }}>
          <ShieldCheck size={18} />
          {totalVehicles > 0 ? `${totalVehicles} veículos curados com segurança` : 'Curadoria Premium'}
        </div>

        <h1 className="anim-fade-up" style={{ fontSize: 'clamp(56px, 14vw, 120px)', lineHeight: 0.85, marginBottom: '32px', maxWidth: '1200px', position: 'relative', zIndex: 1, letterSpacing: '-0.06em' }}>
          Onde a tecnologia<br /> encontra sua <span className="text-gradient-blue">paixão.</span>
        </h1>

        <p className="anim-fade-up" style={{ fontSize: 'clamp(18px, 4vw, 22px)', color: 'var(--text-dim)', maxWidth: '700px', marginBottom: '56px', fontWeight: 500, lineHeight: 1.5, position: 'relative', zIndex: 1 }}>
          A nova forma de comprar seu próximo veículo — transparência total, curadoria de elite e tecnologia de ponta.
        </p>

        <div className="anim-fade-up" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <a href="#estoque" className="btn-primary" style={{ padding: '22px 48px', fontSize: '18px', borderRadius: '18px' }}>
            Explorar Estoque <ArrowRight size={22} />
          </a>
          <a href="#tecnologia" className="btn-ghost" style={{ padding: '22px 48px', fontSize: '18px', borderRadius: '18px' }}>
            Nossa Tecnologia
          </a>
        </div>

        <div className="anim-fade-up" style={{ marginTop: '80px', display: 'flex', gap: '48px', position: 'relative', zIndex: 1, opacity: 0.6 }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--mz-ink)' }}>{totalPartners}+</div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--mz-slate-dim)' }}>Lojas Parceiras</div>
          </div>
          <div style={{ textAlign: 'left', paddingLeft: '48px', borderLeft: '1px solid var(--border)' }}>
            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--mz-ink)' }}>{totalVehicles > 0 ? `${totalVehicles}` : '–'}</div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--mz-slate-dim)' }}>Veículos disponíveis</div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '40px', color: 'var(--mz-slate-dim)' }} className="anim-fade-up">
          <Mouse size={28} className="float" />
        </div>
      </section>

      {/* ── INVENTORY ──────────────────────────────────────────── */}
      <section id="estoque" className="section-pad" style={{ background: 'var(--mz-snow)', paddingTop: '100px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>

          {/* Highlights */}
          {featuredVehicles.length > 0 && (
            <div style={{ marginBottom: '100px', background: 'var(--mz-frost)', padding: '60px 40px', borderRadius: '48px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'radial-gradient(circle at top right, rgba(18, 67, 178, 0.05), transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', gap: '24px', flexWrap: 'wrap' }}>
                <div>
                  <div className="section-label" style={{ marginBottom: '12px' }}><ShieldCheck size={18} /> Seleção Especial</div>
                  <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', letterSpacing: '-0.05em' }}>Destaques Motorz</h2>
                </div>
                <p style={{ maxWidth: '400px', color: 'var(--text-dim)', fontSize: '16px', lineHeight: 1.6 }}>
                  Veículos com o selo de inspeção 360º e condições exclusivas de financiamento.
                </p>
              </div>
              <div className="highlights-scroll" style={{ padding: '10px 0 30px', margin: '0 -40px', paddingLeft: '40px' }}>
                {featuredVehicles.map((v, i) => (
                  <div key={v.id} className="highlights-item" style={{ minWidth: '380px' }}>
                    <VehicleCard vehicle={v} onInterest={openSheet} index={i} featured />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Catalog Header */}
          <div style={{ marginBottom: '60px', textAlign: 'center' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}><Search size={18} /> Catálogo Completo</div>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 56px)', marginBottom: '24px' }}>Encontre seu próximo carro</h2>
          </div>

          {/* Search */}
          <div className="search-bar" style={{ maxWidth: '800px', margin: '0 auto 40px', padding: '16px 32px' }}>
            <Search size={24} color="var(--mz-royal)" />
            <input
              type="text"
              placeholder="Busque por marca, modelo, versão ou ano..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setVisibleCount(6); }}
              style={{ fontSize: '18px' }}
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setVisibleCount(6); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mz-slate-dim)', fontSize: '18px', lineHeight: 1, padding: '0 4px' }}>×</button>
            )}
          </div>

          {/* Brand Filter */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '16px' }}>
            {allBrands.map(brand => (
              <button
                key={brand}
                onClick={() => { setActiveBrand(brand); setVisibleCount(6); }}
                className={`filter-pill ${activeBrand === brand ? 'active' : ''}`}
                style={{ padding: '10px 22px', fontSize: '14px' }}
              >
                {brand}
              </button>
            ))}
          </div>

          {/* Price Filter */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '48px' }}>
            {PRICE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => { setPriceRange(opt.value); setVisibleCount(6); }}
                className={`filter-pill filter-pill-price ${priceRange === opt.value ? 'active' : ''}`}
                style={{ padding: '8px 20px', fontSize: '13px' }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Active filter summary + reset */}
          {hasActiveFilter && (
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-dim)' }}>
                {filtered.length} veículo{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
              </span>
              <button onClick={resetFilters} style={{ marginLeft: '16px', background: 'none', border: '1px solid var(--border)', borderRadius: '100px', padding: '4px 14px', fontSize: '13px', color: 'var(--mz-royal)', cursor: 'pointer', fontWeight: 600 }}>
                Limpar filtros
              </button>
            </div>
          )}

          {/* Grid */}
          {filtered.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
              {filtered.slice(0, visibleCount).map((v, i) => (
                <VehicleCard key={v.id} vehicle={v} onInterest={openSheet} index={i} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <p style={{ fontSize: '18px', color: 'var(--text-dim)', marginBottom: '16px' }}>Nenhum veículo encontrado com esses filtros.</p>
              <button onClick={resetFilters} className="btn-ghost" style={{ padding: '12px 32px' }}>Ver todos</button>
            </div>
          )}

          {visibleCount < filtered.length && (
            <button className="btn-load-more" onClick={() => setVisibleCount(prev => prev + 6)} style={{ marginTop: '80px' }}>
              Carregar mais veículos <ArrowRight size={20} />
            </button>
          )}
        </div>
      </section>

      {/* ── PARTNERS (ULTRA PREMIUM) ────────────────────────── */}
      <section className="partners-section">
        {/* Background Signature */}
        <div className="partners-signature">Motorz</div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '80px', flexWrap: 'wrap', gap: '48px' }}>
            <div style={{ maxWidth: '600px' }}>
              <div className="section-label"><LayoutGrid size={18} /> Partner Ecosystem</div>
              <h2 style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 0.9, letterSpacing: '-0.06em', textTransform: 'uppercase' }}>
                Parceiros<br />
                <span className="text-mz-slate-dim">& Tecnologias</span>
              </h2>
            </div>
            <div style={{ maxWidth: '400px', marginTop: '32px' }}>
              <p style={{ color: 'var(--text-dim)', fontSize: '20px', lineHeight: 1.6, fontWeight: 500 }}>
                Colaboramos com os melhores parceiros e integradores para entregar performance real em qualquer escala.
              </p>
            </div>
          </div>
          
          <div className="carousel-container">
            <div className="carousel-track">
              {[...displayPartners, ...displayPartners, ...displayPartners].map((p, i) => (
                <div key={i} className="partner-item">
                  <div className="partner-logo-circle" style={{ background: 'white', border: '1px solid var(--border)', width: '56px', height: '56px' }}>
                    {p.initial}
                  </div>
                  <span className="partner-name" style={{ fontSize: '24px', letterSpacing: '-0.02em', fontWeight: 800 }}>
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TECHNOLOGY ───────────────────────────────────────── */}
      <section id="tecnologia" style={{ padding: '160px 24px', background: '#0F172A', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'radial-gradient(var(--motorz-gold) 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }} />
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '100px' }}>
            <div className="section-label" style={{ justifyContent: 'center', color: 'var(--motorz-gold)', border: 'none' }}>
              <Zap size={16} fill="var(--motorz-gold)" /> Por que motorz
            </div>
            <h2 style={{ fontSize: 'clamp(44px, 7vw, 84px)', marginBottom: '32px', color: 'white', letterSpacing: '-0.06em', lineHeight: 0.9 }}>
              Inteligência que <br />
              <span style={{ background: 'linear-gradient(135deg, #FFC700, #FFE066)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                acelera seu negócio.
              </span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '22px', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6, fontWeight: 400 }}>
              Não somos apenas um portal. Somos a infraestrutura tecnológica que conecta o estoque real ao cliente qualificado.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {TECH_FEATURES.map((item, i) => (
              <div key={i} className="tech-card">
                <div style={{ color: item.color, marginBottom: '28px' }}>{item.icon}</div>
                <h4 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '12px', letterSpacing: '-0.02em' }}>
                  {item.title}
                </h4>
                <p style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, fontSize: '15px', marginBottom: '24px', flexGrow: 1 }}>
                  {item.desc}
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: '100px', background: `${item.color}18`, border: `1px solid ${item.color}35`, color: item.color, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {item.tag}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <a href="#estoque" className="btn-premium-gold" style={{ padding: '20px 56px', fontSize: '17px', borderRadius: '16px' }}>
              Explorar Estoque <ArrowRight size={20} />
            </a>
          </div>
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
