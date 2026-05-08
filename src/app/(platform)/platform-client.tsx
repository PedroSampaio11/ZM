'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Vehicle } from '@/modules/inventory/types';
import { VehicleCard } from '@/components/vehicle-card';
import { LeadBottomSheet } from '@/components/lead-bottom-sheet';
import {
  ShieldCheck, Search, ArrowRight, Mouse, Shield,
  Cloud, Zap, MessageSquare, Cpu, LayoutGrid, Database, Car, Globe, Heart
} from 'lucide-react';
import { ComparisonSlider } from '@/components/comparison-slider';
import { LiveTimeBadge } from '@/components/live-time-badge';
import { ZmChat } from '@/components/zm-chat';

// ── Padronizado: eyebrow de seção ────────────────────────────
function SectionEyebrow({ label, dark = false }: { label: string; dark?: boolean }) {
  const color = dark ? 'rgba(255,255,255,0.45)' : 'var(--mz-ink)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
      <div style={{ width: '28px', height: '1px', background: color, opacity: 0.4 }} />
      <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color, opacity: 0.6 }}>{label}</span>
    </div>
  );
}


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
    title: 'Estoque 100% Real',
    desc:  'Nossa tecnologia sincroniza com as lojas em tempo real. Se você está vendo o carro aqui, ele está disponível lá. Sem anúncios fantasmas.',
    tag:   'Sync em tempo real',
  },
  {
    icon:  <Zap size={32} />,
    color: '#FFC107',
    title: 'Conexão Imediata',
    desc:  'Esqueça formulários lentos. Em menos de 2 minutos você está conversando com o consultor responsável pelo veículo.',
    tag:   'Resposta ultra-rápida',
  },
  {
    icon:  <Cpu size={32} />,
    color: '#A855F7',
    title: 'Busca Inteligente',
    desc:  'Nossa IA analisa milhares de opções para encontrar o carro que realmente combina com seu estilo de vida e orçamento.',
    tag:   'IA personalizada',
  },
  {
    icon:  <Shield size={32} />,
    color: '#22C55E',
    title: 'Segurança Certificada',
    desc:  'Apenas lojas que passam por nossa auditoria rigorosa podem anunciar. Dados, fotos e preços são validados por nós.',
    tag:   'Lojas verificadas',
  },
];

function matchesPrice(price: number, range: PriceRange): boolean {
  if (range === 'all')      return true;
  if (range === 'under150') return price < 150_000;
  if (range === '150to400') return price >= 150_000 && price <= 400_000;
  return price > 400_000;
}

function useTypingAnimation(texts: string[], typingSpeed = 100, deletingSpeed = 50, delayBetween = 2000) {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const currentText = texts[textIndex];
    let timer: NodeJS.Timeout;

    if (isDeleting) {
      timer = setTimeout(() => {
        setDisplayText(currentText.substring(0, displayText.length - 1));
      }, deletingSpeed);
    } else {
      timer = setTimeout(() => {
        setDisplayText(currentText.substring(0, displayText.length + 1));
      }, typingSpeed);
    }

    if (!isDeleting && displayText === currentText) {
      timer = setTimeout(() => setIsDeleting(true), delayBetween);
    } else if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setTextIndex((prev) => (prev + 1) % texts.length);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, textIndex, texts, typingSpeed, deletingSpeed, delayBetween]);

  return displayText;
}

export function PlatformClient({ vehicles, totalVehicles, totalPartners, brands, partners }: Props) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isSheetOpen,     setIsSheetOpen]     = useState(false);
  const [activeBrand,     setActiveBrand]     = useState('Todos');
  const [priceRange,      setPriceRange]      = useState<PriceRange>('all');
  const [searchQuery,     setSearchQuery]     = useState('');
  const [visibleCount,    setVisibleCount]    = useState(6);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const typingText = useTypingAnimation([
    'ganha movimento.',
    'acelera escolhas.',
    'trabalha por você.'
  ]);

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
      <section ref={heroRef} className="noise" style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px', position: 'relative', overflow: 'hidden' }}>
        <div className="mesh-bg" />
        <div className="tech-grid" />
        <div className="glow-spot" />

        {/* Orbital Ecosystem Background */}
        <div className="hidden lg:block" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
          {[
            { size: 900, duration: 80, nodes: [ 
              { label: 'AutoCerto', icon: <Database size={14}/>, angle: 45,  delay: 0 }, 
              { label: 'Eurobike',  icon: <Car size={14}/>,      angle: 135, delay: 1.2 },
              { label: 'Revenda Mais', icon: <Cloud size={14}/>, angle: 225, delay: 2.4 },
              { label: 'Stuttgart', icon: <Zap size={14}/>,      angle: 315, delay: 3.6 }
            ] },
            { size: 1250, duration: 110, nodes: [ 
              { label: 'Cockpit',       icon: <Cpu size={14}/>,    angle: 0,   delay: 0.5 }, 
              { label: 'Avantgarde',    icon: <Globe size={14}/>,  angle: 72,  delay: 1.3 },
              { label: 'Socarros',      icon: <Car size={14}/>,    angle: 144, delay: 2.1 },
              { label: 'Select Motors', icon: <Shield size={14}/>, angle: 216, delay: 3.0 },
              { label: 'Personal Car',  icon: <Heart size={14}/>,  angle: 288, delay: 3.8 }
            ] },
            { size: 1600, duration: 140, nodes: [ 
              { label: 'Motor21',    icon: <Globe size={14}/>,  angle: 30,  delay: 0.8 }, 
              { label: 'By Motors',  icon: <Car size={14}/>,    angle: 90,  delay: 1.6 },
              { label: 'Webmotors', icon: <Search size={14}/>, angle: 150, delay: 2.4 },
              { label: 'Icarros',   icon: <Car size={14}/>,    angle: 210, delay: 3.2 },
              { label: 'Kavak',     icon: <Zap size={14}/>,    angle: 270, delay: 4.0 },
              { label: 'Karvi',     icon: <Shield size={14}/>, angle: 330, delay: 4.8 }
            ] }
          ].map((ring, ringIdx) => (
            <div key={`ring-${ringIdx}`} style={{ position: 'absolute', top: '50%', left: '50%', width: ring.size, height: ring.size, transform: 'translate(-50%, -50%)', border: '1px solid rgba(18, 67, 178, 0.04)', borderRadius: '50%' }}>
              {ring.nodes.map((node, nodeIdx) => (
                <motion.div
                  key={`node-${nodeIdx}`}
                  initial={{ rotate: node.angle }}
                  animate={{ rotate: node.angle + 360 }}
                  transition={{ duration: ring.duration, repeat: Infinity, ease: 'linear' }}
                  style={{ position: 'absolute', top: '50%', left: '50%', width: ring.size, height: ring.size, marginLeft: -ring.size/2, marginTop: -ring.size/2, willChange: 'transform' }}
                >
                  <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <motion.div
                      initial={{ rotate: -node.angle }}
                      animate={{ rotate: -(node.angle + 360) }}
                      transition={{ duration: ring.duration, repeat: Infinity, ease: 'linear' }}
                      style={{ willChange: 'transform' }}
                    >
                      {/* Pulse via CSS — zero JS overhead */}
                      <div
                        className="orbital-node"
                        style={{
                          '--pulse-dur': `${3.5 + node.delay}s`,
                          animationDelay: `${node.delay}s`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '7px',
                          padding: '5px 13px',
                          background: 'rgba(255,255,255,0.65)',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          border: '1px solid rgba(18, 67, 178, 0.08)',
                          borderRadius: '100px',
                          color: 'var(--mz-slate-dim)',
                          fontWeight: 600,
                          fontSize: '11px',
                          whiteSpace: 'nowrap',
                        } as React.CSSProperties}
                      >
                        <span style={{ color: 'var(--mz-royal)', opacity: 0.7, display: 'flex' }}>{node.icon}</span>
                        {node.label}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
        
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="max-w-5xl mx-auto w-full relative z-10 text-center"
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <LiveTimeBadge />
            </motion.div>
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontSize: 'clamp(48px, 6vw, 84px)', lineHeight: 1.0, marginBottom: '32px', letterSpacing: '-0.05em', fontWeight: 900, color: 'var(--mz-ink)' }}
          >
            Onde o estoque<br />
            <span style={{ display: 'inline-block', whiteSpace: 'nowrap', minHeight: '1.2em' }}>
              {typingText}<span className="cursor-blink" />
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{ fontSize: 'clamp(16px, 1.5vw, 18px)', color: 'var(--text-dim)', maxWidth: '520px', margin: '0 auto 48px', fontWeight: 500, lineHeight: 1.6 }}
          >
            Estoque real, lojas certificadas e conexão direta com o consultor — sem anúncios fantasmas.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}
          >
            <a href="#estoque" className="btn-primary" style={{ padding: '20px 48px', fontSize: '18px', borderRadius: '20px' }}>
              Explorar Estoque <ArrowRight size={22} />
            </a>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '10px 24px', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.3)' }}>
              <div style={{ display: 'flex' }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid white', background: 'var(--mz-frost)', marginLeft: '-10px', overflow: 'hidden' }}>
                    <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="User" />
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--mz-ink)', margin: 0 }}>+500 negociações</p>
                <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--mz-slate-dim)', margin: 0 }}>realizadas este mês</p>
              </div>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            style={{ marginTop: '80px', display: 'flex', justifyContent: 'center', opacity: 0.25 }}
          >
            <div style={{ width: '24px', height: '40px', borderRadius: '12px', border: '1.5px solid var(--mz-slate-dim)', display: 'flex', justifyContent: 'center', paddingTop: '6px' }}>
              <motion.div 
                animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: '4px', height: '6px', background: 'var(--mz-slate-dim)', borderRadius: '2px' }} 
              />
            </div>
          </motion.div>
        </motion.div>
      </section>



      {/* ── INVENTORY ──────────────────────────────────────────── */}
      <section id="estoque" style={{ background: 'var(--mz-snow)', paddingTop: '120px', paddingBottom: '0' }}>



        {/* ── Section Header ── */}
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 48px', marginBottom: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap' }}>
            <div>
              <SectionEyebrow label="Catálogo Completo" />
              <h2 style={{ fontSize: 'clamp(36px, 5vw, 64px)', letterSpacing: '-0.05em', fontWeight: 900, lineHeight: 1, margin: 0, color: 'var(--mz-ink)' }}>
                Encontre seu<br />próximo carro
              </h2>
            </div>
            <p style={{ maxWidth: '380px', color: 'var(--text-dim)', fontSize: '17px', lineHeight: 1.6, fontWeight: 500, marginBottom: '8px' }}>
              {totalVehicles} veículos disponíveis de {totalPartners} lojas parceiras verificadas, com estoque em tempo real.
            </p>
          </div>
        </div>

        {/* ── Featured Carousel (bleeds into next section) ── */}
        {featuredVehicles.length > 0 && (
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 48px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFB800', boxShadow: '0 0 8px rgba(255,184,0,0.5)' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Seleção Especial</span>
              </div>
            </div>
            {/* Full-width bleed scroll — overflow visible so cards float over section seam */}
            <div style={{ paddingLeft: '48px', display: 'flex', gap: '24px', overflowX: 'auto', overflowY: 'visible', paddingBottom: '64px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
              {featuredVehicles.map((v, i) => (
                <div key={v.id} style={{ minWidth: 'clamp(300px, 30vw, 420px)', flex: '0 0 clamp(300px, 30vw, 420px)', filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.10))' }}>
                  <VehicleCard vehicle={v} onInterest={openSheet} index={i} featured />
                </div>
              ))}
              <div style={{ minWidth: '48px', flexShrink: 0 }} />
            </div>
          </div>
        )}

        {/* ── Filter Bar ── */}
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 48px' }}>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <Search size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mz-slate-dim)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Busque por marca, modelo ou versão..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setVisibleCount(6); }}
              style={{
                width: '100%',
                padding: '14px 44px',
                fontSize: '15px',
                fontFamily: 'inherit',
                fontWeight: 500,
                background: 'var(--mz-frost)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                outline: 'none',
                color: 'var(--mz-ink)',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#1243B2'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setVisibleCount(6); }} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'var(--mz-ash)', border: 'none', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', color: 'var(--mz-slate)', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            )}
          </div>

          {/* 3-column filter row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
            {/* Brand */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mz-slate-dim)', paddingLeft: '4px' }}>Marca</span>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' } as React.CSSProperties}>
                {allBrands.map(brand => (
                  <button
                    key={brand}
                    onClick={() => { setActiveBrand(brand); setVisibleCount(6); }}
                    style={{
                      flexShrink: 0,
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      fontFamily: 'inherit',
                      borderRadius: '10px',
                      border: '1px solid',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                      background: activeBrand === brand ? '#1243B2' : 'var(--mz-frost)',
                      borderColor: activeBrand === brand ? '#1243B2' : 'var(--border)',
                      color: activeBrand === brand ? 'white' : 'var(--mz-slate)',
                    }}
                  >{brand}</button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mz-slate-dim)', paddingLeft: '4px' }}>Valor</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {PRICE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setPriceRange(opt.value); setVisibleCount(6); }}
                    style={{
                      flexShrink: 0,
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      fontFamily: 'inherit',
                      borderRadius: '10px',
                      border: '1px solid',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                      background: priceRange === opt.value ? '#1243B2' : 'var(--mz-frost)',
                      borderColor: priceRange === opt.value ? '#1243B2' : 'var(--border)',
                      color: priceRange === opt.value ? 'white' : 'var(--mz-slate)',
                    }}
                  >{opt.label}</button>
                ))}
              </div>
            </div>

          </div>

          {/* Results bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dim)' }}>
              {filtered.length} veículo{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </span>
            {hasActiveFilter && (
              <button onClick={resetFilters} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 700, color: 'var(--mz-royal)', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.02em' }}>
                × Limpar filtros
              </button>
            )}
          </div>

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


          {/* Ver todo estoque */}
          <div style={{ textAlign: 'center', padding: '60px 0 80px' }}>
            <Link
              href="/estoque"
              className="btn-primary"
              style={{ padding: '18px 40px', fontSize: '16px', borderRadius: '16px', gap: '10px', display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
            >
              Ver todo o estoque <ArrowRight size={20} />
            </Link>
            <p style={{ marginTop: '16px', color: 'var(--text-dim)', fontSize: '13px', fontWeight: 500 }}>
              {totalVehicles} veículos disponíveis · Atualizado em tempo real
            </p>
          </div>
        </div>
      </section>

      {/* ── CURADORIA (PROCESSO) ────────────────────────────────── */}
      <section id="curadoria" style={{ background: '#fff', padding: '120px 24px', borderTop: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* Eyebrow + headline — full left-align, editorial */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '80px', marginBottom: '96px', flexWrap: 'wrap' }}>
            <div style={{ flex: '0 0 auto' }}>
              <SectionEyebrow label="Curadoria" />
              <h2 style={{ fontSize: 'clamp(40px, 5vw, 68px)', letterSpacing: '-0.05em', fontWeight: 900, color: 'var(--mz-ink)', lineHeight: 0.95, margin: 0, maxWidth: '520px' }}>
                Cada loja aqui foi aprovada pela nossa equipe.
              </h2>
            </div>
            <div style={{ flex: '1 1 280px', paddingTop: '16px' }}>
              <p style={{ fontSize: '17px', color: 'var(--text-dim)', lineHeight: 1.75, margin: '0 0 28px', maxWidth: '400px' }}>
                Motorz não é um portal de anúncios. É uma rede fechada de revendas que passaram por triagem, auditoria e são monitoradas continuamente.
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-dim)', lineHeight: 1.7, margin: 0, maxWidth: '400px', opacity: 0.75 }}>
                Se um veículo aparece aqui, ele existe. O preço é real. A loja é verificada. Simples assim.
              </p>
            </div>
          </div>

          {/* Cards with Tech Features - Integrated into curation flow */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '80px' }}>
            {TECH_FEATURES.map((feat, i) => (
              <div key={i} style={{ padding: '40px 32px', borderRadius: '28px', background: 'var(--mz-frost)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ display: 'inline-flex', padding: '14px', borderRadius: '18px', background: `${feat.color}15`, color: feat.color, flexShrink: 0 }}>
                    {feat.icon}
                  </div>
                  <div style={{ display: 'inline-flex', alignSelf: 'center', alignItems: 'center', background: `${feat.color}10`, border: `1px solid ${feat.color}30`, borderRadius: '100px', padding: '4px 12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: feat.color }}>{feat.tag}</span>
                  </div>
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px', color: 'var(--mz-ink)', letterSpacing: '-0.03em' }}>{feat.title}</h3>
                <p style={{ color: 'var(--text-dim)', lineHeight: 1.6, fontWeight: 500, margin: 0 }}>{feat.desc}</p>
              </div>
            ))}
          </div>

          {/* Process — horizontal ruled list, typographic steps */}
          <div style={{ borderTop: '1px solid var(--border)' }}>
            {[
              {
                n: '01',
                title: 'Análise e Aprovação',
                desc: 'CNPJ ativo, histórico no mercado, reputação em plataformas e entrevista presencial ou por vídeo com nossa equipe comercial.',
              },
              {
                n: '02',
                title: 'Auditoria de Estoque',
                desc: 'Cada veículo tem fotos, quilometragem, histórico e precificação validados antes de entrar ao vivo. Discrepâncias bloqueiam o anúncio automaticamente.',
              },
              {
                n: '03',
                title: 'Monitoramento em Tempo Real',
                desc: 'Nosso sistema monitora o estoque 24h. Lojas com quedas de qualidade são suspensas — sem aviso prévio e sem negociação.',
              },
            ].map((item) => (
              <div key={item.n} style={{ display: 'grid', gridTemplateColumns: '64px 1fr 2fr', gap: '40px', alignItems: 'start', padding: '36px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--mz-ink)', opacity: 0.2, fontFamily: "'Cal Sans', sans-serif", letterSpacing: '0.04em', paddingTop: '3px' }}>{item.n}</span>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--mz-ink)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{item.title}</h3>
                <p style={{ fontSize: '15px', color: 'var(--text-dim)', margin: 0, lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Bottom seal row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px', marginTop: '56px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1.5px solid var(--mz-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}>
                <ShieldCheck size={18} color="var(--mz-ink)" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--mz-ink)', opacity: 0.6, letterSpacing: '-0.01em' }}>Rede de lojas verificadas pelo Motorz</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['CNPJ ativo', 'Fotos reais', 'Preço justo', 'Sem anúncio fantasma', 'Consultor real'].map((tag) => (
                <span key={tag} style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mz-ink)', opacity: 0.5, border: '1px solid currentColor', borderRadius: '100px', padding: '4px 12px', whiteSpace: 'nowrap' }}>{tag}</span>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── PARTNERS (CLEAN PREMIUM CAROUSEL) ───────────────── */}
      <section id="parceiros" className="partners-section">
        {/* Background Detail - Soft Complementary Color */}
        <div className="partners-bg-glow" />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <SectionEyebrow label="Rede de Confiança" />
          </div>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 64px)', letterSpacing: '-0.04em', marginBottom: '24px', color: 'var(--mz-ink)', fontWeight: 900 }}>
            Ecossistema de Qualidade
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '18px', lineHeight: 1.6, fontWeight: 500 }}>
            Conectamos você apenas a parceiros que compartilham nosso compromisso com a transparência e a excelência automotiva.
          </p>
        </div>
        
        <div className="carousel-wrapper" style={{ marginTop: '80px' }}>
          <div className="carousel-container-clean">
            <div className="carousel-track-clean">
              {Array.from({ length: 20 }).flatMap(() => displayPartners).map((p, i) => (
                <div key={i} className="partner-item-clean">
                  <div className="partner-logo-circle-clean">
                    {p.initial}
                  </div>
                  <span className="partner-name-clean">
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── QUEM SOMOS ───────────────────────────────────────────── */}
      <section id="quem-somos" style={{ background: 'var(--mz-snow)', padding: '140px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
            <div>
              <SectionEyebrow label="Nossa História" />
              <h2 style={{ fontSize: 'clamp(40px, 5vw, 64px)', letterSpacing: '-0.05em', fontWeight: 900, lineHeight: 1.05, color: 'var(--mz-ink)', marginBottom: '28px' }}>
                Nascemos para<br />mudar o jogo
              </h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '18px', lineHeight: 1.7, fontWeight: 500, marginBottom: '20px' }}>
                A Motorz surgiu da frustração com um mercado opaco, cheio de anúncios fantasmas e lojas não verificadas. Construímos uma plataforma onde estoque real, tecnologia e transparência andam juntos.
              </p>
              <p style={{ color: 'var(--text-dim)', fontSize: '18px', lineHeight: 1.7, fontWeight: 500, marginBottom: '48px' }}>
                Conectamos compradores a lojas certificadas com sincronização em tempo real — sem intermediários, sem surpresas.
              </p>
              <Link href="/seja-parceiro" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '16px 36px', fontSize: '16px', borderRadius: '16px', textDecoration: 'none' }}>
                Quero ser parceiro <ArrowRight size={20} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { value: '500+',  label: 'Negociações realizadas', color: '#1243B2' },
                { value: '100%',  label: 'Estoque verificado',      color: '#22C55E' },
                { value: '<2min', label: 'Tempo de resposta',       color: '#F59E0B' },
                { value: 'A+',    label: 'Lojas auditadas',         color: '#A855F7' },
              ].map((stat, i) => (
                <div key={i} style={{ padding: '36px 28px', borderRadius: '24px', background: 'white', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, letterSpacing: '-0.04em', color: stat.color, marginBottom: '8px' }}>{stat.value}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)', lineHeight: 1.3 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARISON ────────────────────────────────────────── */}
      <section id="comparacao" style={{ padding: '140px 24px', background: 'linear-gradient(to bottom, #1243B2 0%, #0A1931 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.15), transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <SectionEyebrow label="Antes e Depois" dark />
            </div>
            <h2 style={{ fontSize: 'clamp(48px, 8vw, 96px)', color: 'white', letterSpacing: '-0.04em', lineHeight: 1.05, fontWeight: 900 }}>
              Com a Motorz.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '20px', maxWidth: '600px', margin: '32px auto 0', lineHeight: 1.6, fontWeight: 500 }}>
              Arraste para ver como a Motorz transforma horas de busca frustrante em segundos de clareza e confiança.
            </p>
          </div>
          <div style={{ borderRadius: '32px', padding: '1px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.05))', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>
            <div style={{ borderRadius: '31px', overflow: 'hidden', background: '#0A1931' }}>
              <ComparisonSlider
                beforeImage="/assets/images/searching-chaos.png"
                afterImage="/assets/images/motorz-success.png"
              />
            </div>
          </div>
          
          <div style={{ marginTop: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
            <div style={{ width: '24px', height: '40px', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.8)', display: 'flex', justifyContent: 'center', paddingTop: '6px' }}>
              <motion.div
                animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: '4px', height: '6px', background: 'white', borderRadius: '2px' }}
              />
            </div>
          </div>
        </div>
      </section>

      <LeadBottomSheet
        vehicle={selectedVehicle}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
      
      <ZmChat />
    </div>
  );
}
