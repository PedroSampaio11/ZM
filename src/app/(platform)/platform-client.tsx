'use client';

import { useState } from 'react';
import { Vehicle } from '@/modules/inventory/types';
import { VehicleCard } from '@/components/vehicle-card';
import { LeadBottomSheet } from '@/components/lead-bottom-sheet';
import { MessageSquare, Cloud, ShieldCheck, Search, ArrowRight, CheckCircle, LayoutGrid, Mouse, Shield } from 'lucide-react';

interface Props {
  vehicles: Vehicle[];
  totalVehicles: number;
  totalPartners: number;
}

const BRANDS = ['Todos', 'Toyota', 'Honda', 'Chevrolet', 'Volkswagen', 'Hyundai', 'Ford', 'Fiat'];

const PARTNERS = [
  { name: 'Elite Motors', initial: 'EM' },
  { name: 'Prime Autos', initial: 'PA' },
  { name: 'Luxury Wheels', initial: 'LW' },
  { name: 'Premium Cars', initial: 'PC' },
  { name: 'Speed Select', initial: 'SS' },
  { name: 'Global Fleet', initial: 'GF' },
  { name: 'Iconic Drive', initial: 'ID' },
  { name: 'Master Garage', initial: 'MG' },
];

export function PlatformClient({ vehicles, totalVehicles, totalPartners }: Props) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activeBrand, setActiveBrand] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);

  const filtered = vehicles.filter(v => {
    const matchBrand = activeBrand === 'Todos' || v.brand?.toLowerCase() === activeBrand.toLowerCase();
    const matchSearch = !searchQuery || 
      `${v.brand} ${v.model} ${v.version}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchBrand && matchSearch;
  });

  const featuredVehicles = vehicles.slice(0, 3);

  function openSheet(vehicle: Vehicle) {
    setSelectedVehicle(vehicle);
    setIsSheetOpen(true);
  }

  return (
    <div className="platform-container">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="bg-hero-gradient noise" style={{ minHeight: '85svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 20px 80px', textAlign: 'center', position: 'relative' }}>
        <div className="chip-premium anim-fade-up" style={{ marginBottom: '32px' }}>
          <ShieldCheck size={18} className="text-accent" />
          {totalVehicles > 0 ? `${totalVehicles} veículos curados com segurança` : 'Curadoria Premium'}
        </div>

        <h1 className="anim-fade-up" style={{ fontSize: 'clamp(48px, 12vw, 110px)', lineHeight: 0.9, marginBottom: '32px', maxWidth: '1100px' }}>
          Onde a tecnologia <br/> encontra sua <span className="text-gradient-blue">paixão.</span>
        </h1>

        <p className="anim-fade-up" style={{ fontSize: 'clamp(18px, 4vw, 24px)', color: 'var(--text-dim)', maxWidth: '750px', marginBottom: '64px', fontWeight: 500, lineHeight: 1.5 }}>
          A nova forma de comprar seu próximo veículo com transparência total, curadoria de elite e tecnologia de ponta.
        </p>

        <div className="anim-fade-up" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="#estoque" className="btn-primary" style={{ padding: '20px 48px', fontSize: '18px' }}>
            Explorar Estoque <ArrowRight size={22} />
          </a>
          <a href="#sobre" className="btn-ghost" style={{ padding: '20px 48px', fontSize: '18px' }}>Nossa Tecnologia</a>
        </div>

        <div style={{ marginTop: '80px', color: 'var(--mz-slate-dim)' }} className="anim-fade-up">
          <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px' }}>Scroll para descobrir</div>
          <Mouse size={32} className="float" />
        </div>
      </section>

      {/* ── MAIN INVENTORY (HIGHLIGHTS + GRID) ──────────── */}
      <section id="estoque" className="section-pad" style={{ background: 'var(--mz-snow)', paddingTop: '80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          
          {/* ── HIGHLIGHTS (INTEGRATED) ── */}
          <div style={{ marginBottom: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div className="section-label" style={{ marginBottom: 0 }}><ShieldCheck size={18} /> Seleção Motorz</div>
              <h2 style={{ fontSize: '24px', letterSpacing: '-0.04em' }}>Destaques da Semana</h2>
            </div>
            <div className="highlights-scroll" style={{ padding: '10px 0 30px', margin: '0 -20px', paddingLeft: '20px' }}>
              {featuredVehicles.map((v, i) => (
                <div key={v.id} className="highlights-item">
                  <VehicleCard vehicle={v} onInterest={openSheet} index={i} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '60px', textAlign: 'center' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}><Search size={18} /> Catálogo Completo</div>
            <h2 style={{ fontSize: ' clamp(32px, 5vw, 56px)', marginBottom: '24px' }}>Encontre seu próximo carro</h2>
          </div>

          <div className="search-bar" style={{ maxWidth: '700px', margin: '0 auto 40px' }}>
            <Search size={24} color="var(--text-faint)" />
            <input type="text" placeholder="Busque por marca, modelo ou versão..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '32px', justifyContent: 'center', scrollbarWidth: 'none' }}>
            {BRANDS.map(brand => (
              <button key={brand} onClick={() => { setActiveBrand(brand); setVisibleCount(6); }} className={`filter-pill ${activeBrand === brand ? 'active' : ''}`}>{brand}</button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
            {filtered.slice(0, visibleCount).map((v, i) => (
              <VehicleCard key={v.id} vehicle={v} onInterest={openSheet} index={i} />
            ))}
          </div>

          {visibleCount < filtered.length && (
            <button className="btn-load-more" onClick={() => setVisibleCount(prev => prev + 6)}>
              Carregar mais veículos <ArrowRight size={20} />
            </button>
          )}
        </div>
      </section>

      {/* ── PARTNERS SECTION (INFINITE CAROUSEL) ─────────── */}
      <section className="partners-section">
        <div className="partners-content" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '80px', flexWrap: 'wrap', gap: '32px' }}>
            <div>
              <div className="section-label"><LayoutGrid size={18} /> Rede de Confiança</div>
              <h2 style={{ fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1 }}>Lojas <br/> Parceiras</h2>
            </div>
            <p style={{ maxWidth: '400px', color: 'var(--text-dim)', fontSize: '18px', lineHeight: 1.6 }}>Conectamos você aos estoques das concessionárias mais prestigiadas do país.</p>
          </div>
          
          <div className="carousel-container">
            <div className="carousel-track">
              {[...PARTNERS, ...PARTNERS].map((p, i) => (
                <div key={i} className="partner-item">
                  <div className="partner-logo-circle">{p.initial}</div>
                  <span className="partner-name">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SAFETY / TRUST ───────────────────────────────── */}
      <section id="sobre" style={{ padding: '120px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <div className="section-label" style={{ justifyContent: 'center' }}><CheckCircle size={18} /> Segurança Motorz</div>
          <h2 style={{ fontSize: ' clamp(32px, 5vw, 48px)', marginBottom: '60px' }}>Sua segurança em primeiro lugar.</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            {[
              { title: 'Vistoria 360º', desc: 'Cada parafuso é verificado por especialistas certificados.', icon: <LayoutGrid size={40} /> },
              { title: 'Dados Protegidos', desc: 'Criptografia de ponta a ponta em todas as negociações.', icon: <Shield size={40} /> },
              { title: 'Suporte VIP', desc: 'Atendimento humanizado para tirar todas as suas dúvidas.', icon: <MessageSquare size={40} /> },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'left', padding: '40px', borderRadius: '32px', background: 'var(--mz-frost)', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--motorz-gold)', marginBottom: '24px' }}>{item.icon}</div>
                <h4 style={{ fontSize: '20px', marginBottom: '12px' }}>{item.title}</h4>
                <p style={{ color: 'var(--text-dim)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
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
