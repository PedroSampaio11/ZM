'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Vehicle } from '@/modules/inventory/types';
import { MessageCircle, Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';
import { computeMotorzScore, getScoreDisplay } from '@/lib/motorz-score';

interface VehicleCardProps {
  vehicle: Vehicle;
  onInterest: (vehicle: Vehicle) => void;
  index?: number;
  featured?: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value);
}

function formatMileage(km: number) {
  if (km >= 1000) return `${(km / 1000).toFixed(0)}k km`;
  return `${km} km`;
}

const TRANSMISSION_LABELS: Record<string, string> = {
  MANUAL: 'Manual',
  AUTOMATIC: 'Automático',
  CVT: 'CVT',
  SEMI_AUTOMATIC: 'Semi-auto',
};

function daysAgo(date: Date | string): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
}

export function VehicleCard({ vehicle, onInterest, index = 0, featured = false }: VehicleCardProps) {
  const [imgError, setImgError] = useState(false);
  const { toggle, isFav } = useFavorites();
  const age    = daysAgo(vehicle.createdAt);
  const isNew  = age <= 7;

  const imageUrl = !imgError && vehicle.images?.[0]
    ? vehicle.images[0]
    : `https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800`;

  return (
    <div
      className={`card-vehicle anim-fade-up ${featured ? 'card-featured' : ''}`}
      style={{ animationDelay: `${index * 80}ms`, position: 'relative' }}
    >
      {/* Stretched link — cobre todo o card, prefetch automático no hover */}
      <Link
        href={`/veiculo/${vehicle.id}`}
        aria-label={`Ver detalhes: ${vehicle.brand} ${vehicle.model}`}
        style={{ position: 'absolute', inset: 0, zIndex: 1 }}
      />
      {/* Image Container */}
      <div className="zoom-container" style={{ aspectRatio: '16/10', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <Image
          src={imageUrl}
          alt={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading={index < 4 ? 'eager' : 'lazy'}
          onError={() => setImgError(true)}
          style={{ objectFit: 'cover' }}
          unoptimized={!imageUrl.includes('unsplash.com') && !imageUrl.includes('supabase.co')}
        />

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent 60%, rgba(15, 23, 42, 0.3) 100%)',
        }} />

        {/* Motorz brand overlay — covers dealer logos/plate covers at bottom */}
        <div className="vehicle-img-overlay" />

        {/* Top-left: Destaque (if featured) */}
        {featured && (
          <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 5 }}>
            <div style={{
              background: 'var(--mz-royal)',
              padding: '6px 12px',
              borderRadius: '10px',
              fontSize: '10px',
              fontWeight: 900,
              color: 'white',
              letterSpacing: '0.1em',
              boxShadow: '0 4px 12px rgba(18, 67, 178, 0.3)',
              textTransform: 'uppercase',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              Destaque
            </div>
          </div>
        )}

        {/* Top-right: Favorite button */}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); toggle({ id: vehicle.id, brand: vehicle.brand, model: vehicle.model, year: vehicle.year, price: vehicle.price, image: vehicle.images?.[0] ?? null }); }}
          aria-label={isFav(vehicle.id) ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
          style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', transition: 'transform 0.15s', color: isFav(vehicle.id) ? '#e11d48' : 'var(--mz-slate)' }}
        >
          <Heart size={16} fill={isFav(vehicle.id) ? 'currentColor' : 'none'} strokeWidth={2} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: 'clamp(16px, 4vw, 24px)', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--mz-royal)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
              {vehicle.brand} • {vehicle.year}
            </p>
            {isNew && (
              <span style={{ 
                fontSize: '9px', 
                fontWeight: 900, 
                background: 'rgba(22, 163, 74, 0.1)', 
                color: '#16a34a', 
                padding: '2px 6px', 
                borderRadius: '4px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                Novo
              </span>
            )}
          </div>
          <h3 style={{ fontSize: '22px', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '8px', minHeight: '2.2em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {vehicle.model}
          </h3>
          {vehicle.version ? (
            <p style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: 500, lineHeight: 1.4, opacity: 0.8, minHeight: '2.8em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {vehicle.version}
            </p>
          ) : (
            <div style={{ minHeight: '2.8em' }} />
          )}
        </div>

        {/* Specs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {vehicle.mileage != null && (
            <span className="spec-pill" style={{ background: 'var(--mz-frost)', border: '1px solid var(--border)', fontSize: '11px', padding: '4px 10px', borderRadius: '8px', fontWeight: 600 }}>
              {formatMileage(vehicle.mileage)}
            </span>
          )}
          {vehicle.fuel && (
            <span className="spec-pill" style={{ background: 'var(--mz-frost)', border: '1px solid var(--border)', fontSize: '11px', padding: '4px 10px', borderRadius: '8px', fontWeight: 600 }}>
              {vehicle.fuel}
            </span>
          )}
          {vehicle.transmission && (
            <span className="spec-pill" style={{ background: 'var(--mz-frost)', border: '1px solid var(--border)', fontSize: '11px', padding: '4px 10px', borderRadius: '8px', fontWeight: 600 }}>
              {TRANSMISSION_LABELS[vehicle.transmission] ?? vehicle.transmission}
            </span>
          )}
        </div>

        {/* Motorz Score */}
        {(() => {
          const score = computeMotorzScore(vehicle);
          const { label, color, bg, ring } = getScoreDisplay(score);
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: `2px solid ${ring}`, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '10px', fontWeight: 900, color: ring }}>{score}</span>
              </div>
              <div>
                <p style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1px' }}>Motorz Score</p>
                <p style={{ fontSize: '11px', fontWeight: 800, color }}>{label}</p>
              </div>
            </div>
          );
        })()}

        {/* Footer */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '16px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '10px', color: 'var(--text-faint)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>
              Preço Motorz
            </p>
            <div className="price-tag" style={{ color: 'var(--mz-royal)', fontWeight: 900, fontSize: 'clamp(20px, 4vw, 24px)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              {formatCurrency(vehicle.price)}
            </div>
          </div>
          <button
            onClick={() => onInterest(vehicle)}
            className="btn-primary"
            style={{ padding: '10px 18px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', gap: '8px', boxShadow: 'none', position: 'relative', zIndex: 2, flexShrink: 0 }}
          >
            <MessageCircle size={16} />
            Interesse
          </button>
        </div>
      </div>
    </div>
  );
}
