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

const FIRST_NAMES = [
  'Lucas', 'Matheus', 'Gabriel', 'Rafael', 'Felipe', 'Bruno', 'Thiago', 'Rodrigo',
  'Amanda', 'Fernanda', 'Juliana', 'Camila', 'Patricia', 'Renata', 'Eduardo', 'Anderson',
  'Diego', 'Leandro', 'Marcos', 'Vinicius', 'Ana', 'Carla', 'Débora', 'Elisa',
];
const LAST_INITIALS = ['S', 'M', 'O', 'C', 'L', 'F', 'R', 'A', 'P', 'G', 'N', 'B', 'T', 'V'];
const CITIES = ['Santo André', 'São Bernardo', 'São Caetano', 'Diadema', 'Mauá', 'Guarulhos', 'SP', 'ABC'];
const AGO_LABELS = ['agora mesmo', 'há 3 min', 'há 7 min', 'há 15 min', 'há 22 min', 'há 41 min', 'há 1h'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function readBrandsOfInterest(): string[] {
  try {
    const recent: { brand: string }[] = JSON.parse(localStorage.getItem('mz_recent') ?? '[]');
    const favs: { brand: string }[] = JSON.parse(localStorage.getItem('mz_favorites') ?? '[]');
    return [...new Set([...recent, ...favs].map(v => v.brand))];
  } catch {
    return [];
  }
}

function buildActivities(
  vehicles: { id: string; brand: string; model: string; year: number; images: string[] }[],
  priorityBrands: string[],
): ActivityItem[] {
  // Priority brands first, then shuffle the rest — gives personalization without being obvious
  const priority = vehicles.filter(v => priorityBrands.includes(v.brand));
  const rest = shuffle(vehicles.filter(v => !priorityBrands.includes(v.brand)));
  const ordered = [...shuffle(priority), ...rest];

  // Session-level shuffle of name pools so they're different every visit
  const names = shuffle(FIRST_NAMES);
  const initials = shuffle(LAST_INITIALS);
  const cities = shuffle(CITIES);
  const agoLabels = shuffle(AGO_LABELS);

  return ordered.map((v, i) => ({
    name: `${names[i % names.length]} ${initials[i % initials.length]}.`,
    city: cities[i % cities.length],
    brand: v.brand,
    model: v.model,
    year: v.year,
    image: v.images?.[0] ?? null,
    ago: agoLabels[i % agoLabels.length],
  }));
}

interface Props {
  vehicles: { id: string; brand: string; model: string; year: number; images: string[] }[];
}

export function LiveActivity({ vehicles }: Props) {
  const activities = useRef<ActivityItem[]>([]);
  const [current, setCurrent] = useState<ActivityItem | null>(null);
  const [visible, setVisible] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const indexRef = useRef(0);
  const lastNameRef = useRef('');

  useEffect(() => {
    if (vehicles.length === 0) return;
    const priorityBrands = readBrandsOfInterest();
    activities.current = buildActivities(vehicles, priorityBrands);

    const init = setTimeout(() => show(), 12_000);
    return () => clearTimeout(init);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function nextItem(): ActivityItem {
    const items = activities.current;
    let tries = 0;
    let item: ActivityItem;

    do {
      // Reshuffle after full cycle to prevent identical sequences on repeat
      if (indexRef.current >= items.length) {
        activities.current = shuffle(items);
        indexRef.current = 0;
      }
      item = activities.current[indexRef.current++];
      tries++;
    } while (item.name === lastNameRef.current && tries < 3);

    lastNameRef.current = item.name;
    return item;
  }

  function show() {
    const items = activities.current;
    if (items.length === 0) return;

    const item = nextItem();
    setImgFailed(false);
    setCurrent(item);
    setVisible(true);

    const hideTimer = setTimeout(() => {
      setVisible(false);
      const nextTimer = setTimeout(() => show(), 35_000);
      return () => clearTimeout(nextTimer);
    }, 6_000);
    return () => clearTimeout(hideTimer);
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
        <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#f1f5f9', position: 'relative' }}>
          {current.image && !imgFailed ? (
            <Image
              src={current.image}
              alt={current.model}
              fill
              sizes="48px"
              style={{ objectFit: 'cover' }}
              unoptimized
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              background: 'rgba(18, 67, 178, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1243B2',
              fontWeight: 900,
              fontSize: '16px',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}>
              {current.brand.slice(0, 2)}
            </div>
          )}
        </div>

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
