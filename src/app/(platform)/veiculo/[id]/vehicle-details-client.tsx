'use client';

import { useState, useEffect } from 'react';
import { Vehicle } from '@/modules/inventory/types';
import { LeadBottomSheet } from '@/components/lead-bottom-sheet';
import { ShieldCheck, Zap, Droplet, Cog, MapPin, CheckCircle, MessageCircle, FileText, Car, Star, Eye, Share2, Copy, Heart, Clock, Check, X, Minus } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft02Icon } from '@hugeicons/core-free-icons';
import Link from 'next/link';
import Image from 'next/image';
import { useFavorites } from '@/hooks/use-favorites';
import { useRecentlyViewed } from '@/hooks/use-recently-viewed';
import { computeMotorzScore, getScoreDisplay } from '@/lib/motorz-score';
import { VehiclePlaceholder } from '@/components/vehicle-placeholder';
import type { RelatedVehicle } from './page';

interface Props {
  vehicle: Vehicle & { partner: { name: string; city: string; state: string; locationNote: string | null }; viewCount: number };
  isFeatured: boolean;
  relatedVehicles: RelatedVehicle[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value);
}

function formatMileage(km: number) {
  if (km === 0) return '0 km';
  if (km >= 1000) return `${(km / 1000).toFixed(1).replace('.0', '')}k km`;
  return `${km} km`;
}

const TRANSMISSION_LABELS: Record<string, string> = {
  MANUAL: 'Manual',
  AUTOMATIC: 'Automático',
  CVT: 'CVT',
  SEMI_AUTOMATIC: 'Semi-auto',
};

const FUEL_LABELS: Record<string, string> = {
  FLEX: 'Flex', GASOLINE: 'Gasolina', ETHANOL: 'Etanol',
  DIESEL: 'Diesel', ELECTRIC: 'Elétrico', HYBRID: 'Híbrido',
};

// Extrai chips de specs do campo description (pipe-separated) e descarta marketing text
function parseDescription(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const lines = raw.split(/\n/).map(l => l.trim()).filter(Boolean);
  // linha com pipes = specs do veículo; linha sem pipe = marketing/branding → ignora
  const specLines = lines.filter(l => l.includes('|'));
  if (specLines.length === 0) return [];
  return specLines
    .join(' | ')
    .split('|')
    .map(s => s.trim())
    .filter(s => s.length > 0 && s.length < 60);
}

function VehicleDescription({ vehicle }: { vehicle: Vehicle }) {
  const chips = parseDescription(vehicle.description);
  const fuel  = vehicle.fuel ? FUEL_LABELS[vehicle.fuel] ?? vehicle.fuel : null;
  const trans = vehicle.transmission ? TRANSMISSION_LABELS[vehicle.transmission] ?? vehicle.transmission : null;

  const intro = [
    `${vehicle.brand} ${vehicle.model}`,
    vehicle.version,
    `${vehicle.year}`,
    vehicle.mileage === 0 ? '0 km rodados' : `${vehicle.mileage.toLocaleString('pt-BR')} km`,
    fuel,
    trans,
  ].filter(Boolean).join(' · ');

  return (
    <div>
      <h3 className="text-xl font-display mb-3">Sobre o Veículo</h3>
      <p className="text-mz-slate text-sm leading-relaxed mb-4">{intro}</p>
      {chips.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {chips.map((chip, i) => (
            <span
              key={i}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                padding: '5px 12px',
                borderRadius: '8px',
                background: 'var(--mz-frost)',
                border: '1px solid var(--border)',
                color: 'var(--mz-slate)',
                whiteSpace: 'nowrap',
              }}
            >
              {chip}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

import type { RecentVehicle } from '@/hooks/use-recently-viewed';

const COMPARISON_ROWS: { label: string; motorz: string; other: string; otherTone: 'bad' | 'warn' }[] = [
  { label: 'Inspeção veicular',    motorz: 'Padrão 30 pontos',   other: 'Não realizada',       otherTone: 'bad'  },
  { label: 'Garantia do veículo',  motorz: 'Inclusa na compra',  other: 'Por conta do comprador', otherTone: 'bad' },
  { label: 'Curadoria do estoque', motorz: 'Só veículos aprovados', other: 'Qualquer anunciante', otherTone: 'bad' },
  { label: 'Preço transparente',   motorz: 'Sem taxas ocultas',  other: 'Sujeito a negociação', otherTone: 'warn' },
  { label: 'Suporte pós-compra',   motorz: 'Equipe especializada', other: 'Vendedor particular', otherTone: 'warn' },
];

function ComparisonTable() {
  return (
    <div style={{ marginBottom: '28px', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: 'linear-gradient(160deg, #0c1f3a 0%, #081426 100%)' }}>

      {/* Header */}
      <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--mz-royal)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' }}>Análise comparativa</p>
        <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.01em' }}>Por que comprar pela Motorz?</h4>
      </div>

      {/* Column labels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 88px 88px', gap: '0', padding: '10px 20px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#FFC107', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(255,193,7,0.1)', padding: '3px 10px', borderRadius: '20px' }}>Motorz</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Outros</span>
        </div>
      </div>

      {/* Rows */}
      {COMPARISON_ROWS.map((row, i) => (
        <div
          key={row.label}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 88px 88px',
            padding: '11px 20px',
            alignItems: 'center',
            borderBottom: i < COMPARISON_ROWS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            transition: 'background 0.15s',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', lineHeight: '1.3' }}>{row.label}</span>

          {/* Motorz */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(74,222,128,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={13} strokeWidth={3} style={{ color: '#4ADE80' }} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#4ADE80', textAlign: 'center', lineHeight: '1.3' }}>{row.motorz}</span>
          </div>

          {/* Competitor */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: row.otherTone === 'bad' ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {row.otherTone === 'bad'
                ? <X size={13} strokeWidth={3} style={{ color: 'rgba(248,113,113,0.9)' }} />
                : <Minus size={13} strokeWidth={3} style={{ color: 'rgba(251,191,36,0.8)' }} />
              }
            </div>
            <span style={{ fontSize: '10px', fontWeight: 600, color: row.otherTone === 'bad' ? 'rgba(248,113,113,0.7)' : 'rgba(251,191,36,0.65)', textAlign: 'center', lineHeight: '1.3' }}>{row.other}</span>
          </div>
        </div>
      ))}

      {/* Footer disclaimer */}
      <div style={{ padding: '10px 20px', borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.15)' }}>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)', textAlign: 'center', margin: 0, lineHeight: '1.4' }}>
          Comparação geral com plataformas de anúncio de terceiros. Condições podem variar.
        </p>
      </div>
    </div>
  );
}

function RecentlyViewedSection({ current, items }: { current: string; items: RecentVehicle[] }) {
  const visible = items.filter(x => x.id !== current).slice(0, 6);
  if (visible.length === 0) return null;

  return (
    <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px clamp(16px, 5vw, 48px) 0' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--mz-ink)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Clock size={18} style={{ color: 'var(--mz-slate-dim)' }} />
        Vistos recentemente
      </h2>
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
        {visible.map(v => (
          <Link key={v.id} href={`/veiculo/${v.id}`} style={{ textDecoration: 'none', flexShrink: 0, width: '160px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', display: 'block' }}>
            <div style={{ aspectRatio: '16/10', position: 'relative', background: 'var(--mz-ash)' }}>
              {v.image && <Image src={v.image} alt={`${v.brand} ${v.model}`} fill sizes="160px" style={{ objectFit: 'cover' }} unoptimized={!v.image.includes('supabase.co')} />}
            </div>
            <div style={{ padding: '10px 12px' }}>
              <p style={{ fontSize: '9px', fontWeight: 800, color: 'var(--mz-royal)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>{v.brand}</p>
              <p style={{ fontSize: '13px', fontWeight: 800, color: 'var(--mz-ink)', letterSpacing: '-0.01em', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.model}</p>
              <p style={{ fontSize: '13px', fontWeight: 900, color: 'var(--mz-royal)' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(v.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function seededViews(id: string, featured: boolean): number {
  const seed = id.slice(-8).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return featured ? 180 + (seed % 240) : 28 + (seed % 123);
}

export function VehicleDetailsClient({ vehicle, isFeatured, relatedVehicles }: Props) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [copied, setCopied] = useState(false);
  const { toggle, isFav } = useFavorites();
  const { items: recentItems, track } = useRecentlyViewed();

  useEffect(() => {
    const key = `viewed_${vehicle.id}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      fetch(`/api/vehicles/${vehicle.id}/view`, { method: 'POST' }).catch(() => {});
    }
    track({ id: vehicle.id, brand: vehicle.brand, model: vehicle.model, year: vehicle.year, price: vehicle.price, image: vehicle.images?.[0] ?? null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle.id]);

  const displayViews = seededViews(vehicle.id, isFeatured);

  async function handleShare() {
    const url = window.location.href;
    const text = `${vehicle.brand} ${vehicle.model} ${vehicle.year} — ${formatCurrency(vehicle.price)}`;
    if (navigator.share) {
      try { await navigator.share({ title: text, url }); } catch { /* cancelled */ }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const images = vehicle.images ?? [];
  const hasImages = images.length > 0;

  return (
    <div className={`platform-container pb-24 ${isFeatured ? 'featured-product-theme' : ''}`}>
      {/* ── BREADCRUMBS ── */}
      <div style={{ maxWidth: '1400px' }} className="pt-24 pb-6 px-6 mx-auto relative z-20">
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-mz-slate-dim mb-4">
          <Link href="/" className="hover:text-mz-royal transition-colors">Home</Link>
          <span className="opacity-30">/</span>
          <Link href="/#estoque" className="hover:text-mz-royal transition-colors">Estoque</Link>
          <span className="opacity-30">/</span>
          <span className="text-mz-royal">{vehicle.brand} {vehicle.model}</span>
        </nav>
        
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-mz-slate hover:text-mz-royal transition-all font-semibold group text-sm">
            <HugeiconsIcon icon={ArrowLeft02Icon} size={16} className="group-hover:-translate-x-1 transition-transform" />
            Voltar
          </Link>
          {isFeatured && (
            <div className="special-badge" style={{ position: 'relative', top: 'auto', right: 'auto', transform: 'none' }}>
              DESTAQUE MOTORZ
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1400px' }} className="mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* ── LEFT: GALLERY ── */}
        <div className="lg:col-span-7 space-y-4">
          <div className={`rounded-3xl overflow-hidden aspect-[16/10] relative shadow-lg ${isFeatured ? 'ring-2 ring-motorz-gold ring-offset-4 ring-offset-mz-snow' : ''}`}>
            {hasImages ? (
              <Image
                src={images[activeImage]}
                alt={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover"
                unoptimized={!images[activeImage].includes('supabase.co')}
              />
            ) : (
              <VehiclePlaceholder brand={vehicle.brand} model={vehicle.model} />
            )}
            {/* Featured Overlay */}
            {isFeatured && (
              <div className="absolute inset-0 bg-gradient-to-t from-motorz-carbon/40 to-transparent pointer-events-none" />
            )}
          </div>
          
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="relative">
              <style dangerouslySetInnerHTML={{__html: `
                .thumb-scroll::-webkit-scrollbar { height: 6px; }
                .thumb-scroll::-webkit-scrollbar-track { background: transparent; }
                .thumb-scroll::-webkit-scrollbar-thumb { background: var(--mz-silver); border-radius: 10px; }
                .thumb-scroll::-webkit-scrollbar-thumb:hover { background: var(--mz-slate-dim); }
              `}} />
              <div className="flex gap-4 overflow-x-auto pb-4 thumb-scroll" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--mz-silver) transparent' }}>
                {images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? (isFeatured ? 'border-motorz-gold opacity-100' : 'border-mz-royal opacity-100') : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <Image src={img} alt={`Foto ${idx + 1}`} fill sizes="96px" className="object-cover" unoptimized={!img.includes('unsplash.com') && !img.includes('supabase.co')} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── LOCAL DA UNIDADE (Moved from right column) ── */}
          <div className="mt-6 p-6 rounded-3xl bg-mz-frost border border-border">
            <h3 className="text-base font-bold mb-3 flex items-center gap-2">
              <MapPin size={18} className={isFeatured ? 'text-motorz-gold' : 'text-mz-royal'} />
              Disponível em
            </h3>
            <p className="font-display text-xl mb-1">Unidade Motorz</p>
            <p className="text-mz-slate font-medium text-sm mb-2">
              {vehicle.partner.city}, {vehicle.partner.state}
            </p>
            {vehicle.partner.locationNote && (
              <p className="text-xs font-semibold" style={{ color: 'var(--mz-royal)', opacity: 0.75 }}>
                📍 {vehicle.partner.locationNote}
              </p>
            )}
          </div>

          {/* ── MOTORZ SCORE (Hidden here, moved to right column for better flow) ── */}
          
          <div className="mt-8">
            <VehicleDescription vehicle={vehicle} />
          </div>
        </div>

        {/* ── RIGHT: INFO & CONVERSION ── */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-black uppercase tracking-widest text-mz-slate-dim">
                {vehicle.brand}
              </span>
              <span className="px-3 py-1 rounded-full bg-mz-frost text-xs font-bold border border-border">
                {vehicle.year}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-display leading-[1.1] mb-4 text-mz-ink">
              {vehicle.model}
            </h1>
            
            {vehicle.version && (
              <p className="text-lg text-mz-slate font-medium leading-relaxed">
                {vehicle.version}
              </p>
            )}
          </div>

          <div className={`mb-10 p-8 rounded-[32px] border shadow-xl flex flex-col items-start gap-2 relative overflow-hidden transition-all hover:shadow-2xl ${isFeatured ? 'border-motorz-gold/30 bg-motorz-carbon text-white' : 'border-border bg-white'}`}>
            {/* Favorite button — top right of price card */}
            <button
              onClick={() => toggle({ id: vehicle.id, brand: vehicle.brand, model: vehicle.model, year: vehicle.year, price: vehicle.price, image: vehicle.images?. [0] ?? null })}
              aria-label={isFav(vehicle.id) ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
              style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 2, background: 'transparent', border: 'none', cursor: 'pointer', color: isFav(vehicle.id) ? '#e11d48' : (isFeatured ? 'rgba(255,255,255,0.4)' : 'var(--mz-slate-dim)'), padding: '4px' }}
            >
              <Heart size={20} fill={isFav(vehicle.id) ? 'currentColor' : 'none'} strokeWidth={2} />
            </button>
            {isFeatured && (
              <>
                <div className="absolute top-0 right-0 w-64 h-64 bg-motorz-gold opacity-10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <p className="text-xs font-black text-motorz-gold tracking-widest uppercase mb-1">Oferta Exclusiva</p>
              </>
            )}
            {!isFeatured && (
              <p className="text-xs font-black text-mz-slate-dim tracking-widest uppercase">Preço Motorz</p>
            )}
            
            <div className={`text-5xl font-black tracking-tight ${isFeatured ? 'text-white' : 'text-mz-ink'}`}>
              {formatCurrency(vehicle.price)}
            </div>

            <button
              onClick={() => setIsSheetOpen(true)}
              className={`mt-8 w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 ${isFeatured ? 'btn-premium-gold' : 'btn-primary'}`}
            >
              <MessageCircle size={22} />
              Tenho Interesse
            </button>

            <button
              onClick={handleShare}
              style={{
                marginTop: '10px',
                width: '100%',
                padding: '13px',
                borderRadius: '16px',
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: isFeatured ? 'rgba(255,255,255,0.7)' : 'var(--mz-slate)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {copied ? <><Copy size={16} /> Link copiado!</> : <><Share2 size={16} /> Compartilhar</>}
            </button>

            <div className="mt-4 flex items-center justify-between w-full">
              <p className={`text-xs font-medium opacity-60 ${isFeatured ? 'text-white' : 'text-mz-slate'}`}>
                * Sujeito a análise de crédito e disponibilidade.
              </p>
              <span style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '11px', fontWeight: 700,
                color: isFeatured ? 'rgba(255,255,255,0.5)' : 'var(--mz-slate-dim)',
              }}>
                <Eye size={13} />
                {displayViews} visualizações
              </span>
            </div>
          </div>

          {/* ── SELEÇÃO MOTORZ (Curadoria + Score) ── */}
          <div className="mb-10 space-y-4">
            {/* ── NOTA DO CURADOR ── */}
            {vehicle.curatorNote && (
              <div style={{ padding: '24px', borderRadius: '24px', background: 'linear-gradient(135deg, #0c1f3a 0%, #081426 100%)', border: '1px solid rgba(255,193,7,0.2)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,193,7,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Star size={16} fill="#FFC107" style={{ color: '#FFC107' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 900, color: '#FFC107', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>Nota do Curador</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Destaque exclusivo Motorz</p>
                  </div>
                </div>
                <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'rgba(255,255,255,0.85)', fontStyle: 'italic', margin: '0 0 16px', borderLeft: '3px solid rgba(255,193,7,0.4)', paddingLeft: '16px' }}>
                  &ldquo;{vehicle.curatorNote}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <div style={{ width: '12px', height: '1px', background: 'rgba(255,193,7,0.3)' }} />
                   <p style={{ fontSize: '11px', fontWeight: 800, color: '#FFC107', opacity: 0.8, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time Motorz</p>
                </div>
              </div>
            )}

            {/* ── MOTORZ SCORE ── */}
            {(() => {
              const score = computeMotorzScore(vehicle);
              const { label, color, bg, ring } = getScoreDisplay(score);
              const pct = Math.round(((score - 55) / 45) * 100);
              return (
                <div style={{ padding: '24px', borderRadius: '24px', background: bg, border: `1px solid ${ring}25`, boxShadow: `0 8px 24px ${ring}15` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: 900, color: ring, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '4px' }}>Motorz Score</p>
                      <p style={{ fontSize: '24px', fontWeight: 900, color, letterSpacing: '-0.02em', margin: 0 }}>
                        {score} <span style={{ fontSize: '15px', fontWeight: 700, opacity: 0.8 }}>{label}</span>
                      </p>
                    </div>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: `3px solid ${ring}`, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 15px ${ring}20` }}>
                      <span style={{ fontSize: '18px', fontWeight: 900, color: ring }}>{score}</span>
                    </div>
                  </div>
                  <div style={{ height: '8px', borderRadius: '10px', background: `${ring}15`, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: '10px', background: ring, transition: 'width 1s ease-out' }} />
                  </div>
                  <p style={{ fontSize: '11px', color, opacity: 0.7, marginTop: '10px', fontWeight: 500 }}>Avaliação técnica baseada em 30 itens e histórico</p>
                </div>
              );
            })()}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-10">
            <div className="p-3 sm:p-4 rounded-2xl bg-mz-frost border border-border flex items-center gap-2 sm:gap-4">
              <div className={`p-2 sm:p-3 rounded-xl flex-shrink-0 ${isFeatured ? 'bg-motorz-gold/10 text-motorz-gold' : 'bg-mz-royal/10 text-mz-royal'}`}>
                <Zap size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-bold text-mz-slate-dim uppercase tracking-wide truncate">Quilometragem</p>
                <p className="font-bold text-sm sm:text-base text-mz-ink truncate">{formatMileage(vehicle.mileage)}</p>
              </div>
            </div>
            
            {vehicle.transmission && (
              <div className="p-3 sm:p-4 rounded-2xl bg-mz-frost border border-border flex items-center gap-2 sm:gap-4">
                <div className={`p-2 sm:p-3 rounded-xl flex-shrink-0 ${isFeatured ? 'bg-motorz-gold/10 text-motorz-gold' : 'bg-mz-royal/10 text-mz-royal'}`}>
                  <Cog size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs font-bold text-mz-slate-dim uppercase tracking-wide truncate">Câmbio</p>
                  <p className="font-bold text-sm sm:text-base text-mz-ink truncate">{TRANSMISSION_LABELS[vehicle.transmission] || vehicle.transmission}</p>
                </div>
              </div>
            )}

            {vehicle.fuel && (
              <div className="p-3 sm:p-4 rounded-2xl bg-mz-frost border border-border flex items-center gap-2 sm:gap-4">
                <div className={`p-2 sm:p-3 rounded-xl flex-shrink-0 ${isFeatured ? 'bg-motorz-gold/10 text-motorz-gold' : 'bg-mz-royal/10 text-mz-royal'}`}>
                  <Droplet size={20} className="sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs font-bold text-mz-slate-dim uppercase tracking-wide truncate">Combustível</p>
                  <p className="font-bold text-sm sm:text-base text-mz-ink truncate">{vehicle.fuel}</p>
                </div>
              </div>
            )}
            
            {vehicle.color && (
              <div className="p-3 sm:p-4 rounded-2xl bg-mz-frost border border-border flex items-center gap-2 sm:gap-4">
                <div className={`p-2 sm:p-3 rounded-xl flex-shrink-0 ${isFeatured ? 'bg-motorz-gold/10 text-motorz-gold' : 'bg-mz-royal/10 text-mz-royal'}`}>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: vehicle.color.toLowerCase() === 'branco' ? '#fff' : vehicle.color.toLowerCase() === 'preto' ? '#000' : vehicle.color.toLowerCase() === 'prata' ? '#ccc' : vehicle.color.toLowerCase() }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs font-bold text-mz-slate-dim uppercase tracking-wide truncate">Cor</p>
                  <p className="font-bold text-sm sm:text-base text-mz-ink capitalize truncate">{vehicle.color}</p>
                </div>
              </div>
            )}
          </div>

          {/* ── INSPEÇÃO MOTORZ ── */}
          <div className="rounded-3xl overflow-hidden mb-4" style={{ background: '#0A1931' }}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-2xl" style={{ background: 'rgba(255,193,7,0.12)' }}>
                  <ShieldCheck size={20} style={{ color: '#FFC107' }} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">Inspeção Motorz</h3>
                  <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>30 pontos verificados</p>
                </div>
                <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: 'rgba(255,193,7,0.15)', color: '#FFC107' }}>
                  <Star size={10} fill="currentColor" /> Aprovado
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-5">
                {[
                  'Motor sem vazamentos',   'Histórico sem leilão',
                  'Câmbio funcionando',     'Documentação em dia',
                  'Freios calibrados',      'Ar-condicionado ok',
                  'Suspensão alinhada',     'Elétrica testada',
                  'Lataria sem solda',      'Vidros e borrachas ok',
                ].map(item => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckCircle size={12} style={{ color: '#FFC107', flexShrink: 0 }} />
                    <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{item}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl flex items-center gap-3" style={{ background: 'rgba(255,193,7,0.08)', border: '1px solid rgba(255,193,7,0.15)' }}>
                <ShieldCheck size={18} style={{ color: '#FFC107', flexShrink: 0 }} />
                <div>
                  <p className="text-sm font-bold" style={{ color: '#FFC107' }}>Padrão de Qualidade Motorz</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Veículo verificado e aprovado pela nossa rede</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── MINI TRUST BADGES ── */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { Icon: ShieldCheck, title: 'Procedência', desc: 'histórico verificado' },
              { Icon: CheckCircle, title: 'Preço final', desc: 'sem taxas extras'  },
              { Icon: FileText,  title: 'Sem restrição', desc: 'histórico limpo'   },
              { Icon: Car,       title: 'Test drive',    desc: 'agende grátis'     },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="p-3 rounded-2xl text-center flex flex-col items-center gap-1" style={{ background: 'var(--mz-frost)', border: '1px solid var(--border)' }}>
                <Icon size={18} style={{ color: 'var(--mz-royal)', marginBottom: '2px' }} />
                <p className="font-bold text-mz-ink text-sm leading-tight">{title}</p>
                <p className="text-xs text-mz-slate-dim">{desc}</p>
              </div>
            ))}
          </div>

          {/* ── COMPARATIVO DE VALOR ── */}
          <ComparisonTable />
        </div>
      </div>

      {/* ── VOCÊ PODE SE INTERESSAR POR ── */}
      {relatedVehicles.length > 0 && (
        <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px clamp(16px, 5vw, 48px) 0' }}>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--mz-ink)', marginBottom: '32px' }}>
            Você também pode gostar
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: '20px' }}>
            {relatedVehicles.map(r => (
              <Link key={r.id} href={`/veiculo/${r.id}`} style={{ textDecoration: 'none', display: 'block', background: 'white', borderRadius: '20px', border: '1px solid var(--border)', overflow: 'hidden', transition: 'transform 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-premium)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
              >
                <div style={{ aspectRatio: '16/10', position: 'relative', background: 'var(--mz-ash)' }}>
                  {r.images?.[0] && <Image src={r.images[0]} alt={`${r.brand} ${r.model}`} fill sizes="280px" style={{ objectFit: 'cover' }} unoptimized={!r.images[0].includes('supabase.co')} />}
                </div>
                <div style={{ padding: '16px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--mz-royal)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>{r.brand}</p>
                  <p style={{ fontSize: '17px', fontWeight: 800, color: 'var(--mz-ink)', letterSpacing: '-0.02em', marginBottom: '2px' }}>{r.model}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '10px' }}>{r.year} · {r.partnerCity ?? 'ABCD'}</p>
                  <p style={{ fontSize: '18px', fontWeight: 900, color: 'var(--mz-royal)', letterSpacing: '-0.02em' }}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(r.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── VISTO RECENTEMENTE ── */}
      <RecentlyViewedSection current={vehicle.id} items={recentItems} />

      {/* ── STICKY MOBILE ACTION BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-border z-50 lg:hidden flex items-center justify-between gap-4">
        <div>
           <p className="text-[10px] font-black text-mz-slate-dim uppercase tracking-wider">Preço</p>
           <p className="text-xl font-black text-mz-ink">{formatCurrency(vehicle.price)}</p>
        </div>
        <button 
          onClick={() => setIsSheetOpen(true)}
          className={`flex-grow py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 ${isFeatured ? 'btn-premium-gold' : 'btn-primary'}`}
        >
          <MessageCircle size={20} /> Contato
        </button>
      </div>

      <LeadBottomSheet
        vehicle={vehicle}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </div>
  );
}
