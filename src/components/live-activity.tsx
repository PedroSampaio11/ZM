'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { getInitials, sanitizeImageUrl } from '@/lib/utils';

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
  'Leonardo', 'Gustavo', 'Alexandre', 'Beatriz', 'Larissa', 'Ricardo',
];
// Full last names so we get proper 2-letter initials (e.g., "Lucas Silva" → "LS")
const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Costa', 'Ferreira', 'Rodrigues', 'Almeida',
  'Pereira', 'Gomes', 'Martins', 'Barbosa', 'Nascimento', 'Lima', 'Carvalho',
  'Torres', 'Melo', 'Cardoso', 'Dias', 'Moreira', 'Nunes', 'Araújo', 'Souza',
];
const CITIES = ['Santo André', 'São Bernardo', 'São Caetano', 'Diadema', 'Mauá', 'Guarulhos', 'SP', 'ABC'];
const AGO_LABELS = ['agora mesmo', 'há 3 min', 'há 7 min', 'há 15 min', 'há 22 min', 'há 41 min', 'há 1h'];

// Rolling window — no name repeats within last N items
const REPEAT_WINDOW = 8;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Interests { brands: Set<string>; modelWords: Set<string> }

function readInterests(): Interests {
  try {
    const recent: { brand: string; model: string }[] = JSON.parse(localStorage.getItem('mz_recent') ?? '[]');
    const favs:   { brand: string; model: string }[] = JSON.parse(localStorage.getItem('mz_favorites') ?? '[]');
    const all = [...recent, ...favs];
    return {
      brands:     new Set(all.map(v => v.brand.toLowerCase())),
      modelWords: new Set(all.flatMap(v => v.model.toLowerCase().split(/\s+/).slice(0, 2))),
    };
  } catch {
    return { brands: new Set(), modelWords: new Set() };
  }
}

function scoreVehicle(
  v: { brand: string; model: string },
  interests: Interests,
): number {
  let s = 0;
  if (interests.brands.has(v.brand.toLowerCase())) s += 10;
  for (const w of v.model.toLowerCase().split(/\s+/).slice(0, 2)) {
    if (interests.modelWords.has(w)) s += 4;
  }
  return s;
}

function buildActivities(
  vehicles: { id: string; brand: string; model: string; year: number; images: string[] }[],
  interests: Interests,
): ActivityItem[] {
  // Score + stable shuffle — high-affinity cars bubble up without looking mechanical
  const scored = vehicles
    .map(v => ({ v, score: scoreVehicle(v, interests), rand: Math.random() }))
    .sort((a, b) => b.score - a.score || b.rand - a.rand);

  const names   = shuffle(FIRST_NAMES);
  const lasts   = shuffle(LAST_NAMES);
  const cities  = shuffle(CITIES);
  const agos    = shuffle(AGO_LABELS);

  return scored.map(({ v }, i) => {
    const firstName = names[i % names.length];
    const lastName  = lasts[i % lasts.length];
    return {
      name:  `${firstName} ${lastName[0]}.`,
      city:  cities[i % cities.length],
      brand: v.brand,
      model: v.model,
      year:  v.year,
      image: sanitizeImageUrl(v.images?.[0]),
      ago:   agos[i % agos.length],
    };
  });
}

interface Props {
  vehicles: { id: string; brand: string; model: string; year: number; images: string[] }[];
}

export function LiveActivity({ vehicles }: Props) {
  const activities   = useRef<ActivityItem[]>([]);
  const [current, setCurrent]   = useState<ActivityItem | null>(null);
  const [visible, setVisible]   = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const indexRef     = useRef(0);
  const recentNames  = useRef<string[]>([]);

  useEffect(() => {
    // Only vehicles with at least one valid image
    const withImages = vehicles.filter(v => sanitizeImageUrl(v.images?.[0]) !== null);
    if (withImages.length === 0) return;

    const interests = readInterests();
    activities.current = buildActivities(withImages, interests);

    const init = setTimeout(() => show(), 12_000);
    return () => clearTimeout(init);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function nextItem(): ActivityItem {
    const items = activities.current;
    let tries = 0;
    let item: ActivityItem;

    do {
      if (indexRef.current >= items.length) {
        // Reshuffle so repeated cycles feel different
        activities.current = shuffle(items);
        indexRef.current = 0;
      }
      item = activities.current[indexRef.current++];
      tries++;
      // Skip if name appeared in the recent window (up to full-list attempts)
    } while (recentNames.current.includes(item.name) && tries < Math.min(items.length, REPEAT_WINDOW + 2));

    // Keep rolling window
    recentNames.current = [...recentNames.current.slice(-(REPEAT_WINDOW - 1)), item.name];
    return item;
  }

  function show() {
    if (activities.current.length === 0) return;

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

  const initials = getInitials(current.name);

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
        {/* Car photo — falls back to person initials */}
        <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#f1f5f9', position: 'relative' }}>
          {current.image && !imgFailed ? (
            <Image
              src={current.image}
              alt={current.model}
              fill
              sizes="48px"
              style={{ objectFit: 'cover' }}
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: 'linear-gradient(135deg, #1243B2 0%, #2D5BFF 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 900, fontSize: '15px',
              letterSpacing: '-0.02em', textTransform: 'uppercase',
            }}>
              {initials}
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
