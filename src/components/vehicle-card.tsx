'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Vehicle } from '@/modules/inventory/types';
import { LayoutGrid, MessageCircle } from 'lucide-react';

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

export function VehicleCard({ vehicle, onInterest, index = 0, featured = false }: VehicleCardProps) {
  const [imgError, setImgError] = useState(false);

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
      {featured && <div className="special-badge" style={{ zIndex: 10 }}>DESTAQUE</div>}
      
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

        {/* Top-left: Year Tag */}
        <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 5 }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(12px)',
            padding: '6px 12px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 800,
            color: 'white',
            letterSpacing: '0.02em',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {vehicle.year}
          </div>
        </div>

        {/* Bottom-left: Tech badge */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          padding: '6px 10px',
          borderRadius: '8px',
          fontSize: '10px',
          fontWeight: 800,
          color: 'var(--mz-ink)',
          boxShadow: 'var(--shadow-sm)',
          textTransform: 'uppercase',
          border: '1px solid rgba(255, 255, 255, 0.5)',
        }}>
          <LayoutGrid size={12} />
          Tecnologia Ativa
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--mz-royal)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
            {vehicle.brand}
          </p>
          <h3 style={{ fontSize: '22px', lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: '8px', minHeight: '2.2em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
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

        {/* Footer */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '20px' }}>
          <div>
            <p style={{ fontSize: '10px', color: 'var(--text-faint)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>
              Preço Motorz
            </p>
            <div className="price-tag" style={{ color: 'var(--mz-royal)', fontWeight: 900, fontSize: '24px', letterSpacing: '-0.02em' }}>
              {formatCurrency(vehicle.price)}
            </div>
          </div>
          <button
            onClick={() => onInterest(vehicle)}
            className="btn-primary"
            style={{ padding: '10px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', gap: '8px', boxShadow: 'none', position: 'relative', zIndex: 2 }}
          >
            <MessageCircle size={16} />
            Interesse
          </button>
        </div>
      </div>
    </div>
  );
}
