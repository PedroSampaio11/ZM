'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface ActivityItem {
  name: string;
  city: string;
  brand: string;
  model: string;
  year: number;
  image: string | null;
  ago: string;
}

const FIRST_NAMES = ['Lucas', 'Matheus', 'Gabriel', 'Rafael', 'Felipe', 'Bruno', 'Thiago', 'Rodrigo', 'Amanda', 'Fernanda', 'Juliana', 'Camila', 'Patricia', 'Renata', 'Eduardo', 'Anderson'];
const LAST_INITIALS = ['S', 'M', 'O', 'C', 'L', 'F', 'R', 'A', 'P', 'G', 'N', 'B'];
const CITIES = ['Santo André', 'São Bernardo', 'São Caetano', 'Diadema', 'Mauá', 'Guarulhos', 'SP'];
const AGONAMES = ['agora mesmo', 'há 4 min', 'há 12 min', 'há 28 min', 'há 1h'];

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return Math.abs(s) / 0x80000000; };
}

function buildActivities(vehicles: { id: string; brand: string; model: string; year: number; images: string[] }[]): ActivityItem[] {
  return vehicles.slice(0, 10).map((v, i) => {
    const rng = seededRng(v.id.charCodeAt(0) * 31 + i * 7);
    const fn  = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
    const li  = LAST_INITIALS[Math.floor(rng() * LAST_INITIALS.length)];
    const city = CITIES[Math.floor(rng() * CITIES.length)];
    const ago  = AGONAMES[Math.floor(rng() * AGONAMES.length)];
    return { name: `${fn} ${li}.`, city, brand: v.brand, model: v.model, year: v.year, image: v.images?.[0] ?? null, ago };
  });
}

interface Props {
  vehicles: { id: string; brand: string; model: string; year: number; images: string[] }[];
}

export function LiveActivity({ vehicles }: Props) {
  const activities = useRef<ActivityItem[]>([]);
  const [current, setCurrent] = useState<ActivityItem | null>(null);
  const [visible, setVisible] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (vehicles.length === 0) return;
    activities.current = buildActivities(vehicles);

    // primeira exibição após 12s (não incomoda imediatamente)
    const init = setTimeout(() => show(), 12_000);
    return () => clearTimeout(init);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function show() {
    const items = activities.current;
    if (items.length === 0) return;
    const item = items[indexRef.current % items.length];
    indexRef.current++;
    setCurrent(item);
    setVisible(true);
    // oculta após 6s
    const hide = setTimeout(() => {
      setVisible(false);
      // próxima em 35s
      const next = setTimeout(() => show(), 35_000);
      return () => clearTimeout(next);
    }, 6_000);
    return () => clearTimeout(hide);
  }

  if (!current) return null;

  return (
    <div
      style={{
        position: 'fixed', bottom: '96px', left: '20px', zIndex: 60,
        maxWidth: '300px',
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.96)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        pointerEvents: 'none',
      }}
    >
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '12px 14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        {/* Foto do veículo */}
        <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#f1f5f9', position: 'relative' }}>
          {current.image
            ? <Image src={current.image} alt={current.model} fill sizes="48px" style={{ objectFit: 'cover' }} unoptimized />
            : <div style={{ width: '100%', height: '100%', background: '#e2e8f0' }} />
          }
        </div>

        {/* Texto */}
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', margin: '0 0 2px', lineHeight: 1.3 }}>
            <span style={{ color: '#1243B2' }}>{current.name}</span>
            {' de '}{current.city}
          </p>
          <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 3px', lineHeight: 1.3 }}>
            demonstrou interesse no {current.brand} {current.model} {current.year}
          </p>
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            {current.ago}
          </p>
        </div>
      </div>
    </div>
  );
}
