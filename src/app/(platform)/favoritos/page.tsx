'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Trash2 } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft02Icon } from '@hugeicons/core-free-icons';
import type { FavVehicle } from '@/hooks/use-favorites';

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(v);
}

export default function FavoritosPage() {
  const [items, setItems]   = useState<FavVehicle[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem('mz_favorites');
      if (raw) setItems(JSON.parse(raw) as FavVehicle[]);
    } catch {}
  }, []);

  function remove(id: string) {
    setItems(prev => {
      const next = prev.filter(x => x.id !== id);
      try { localStorage.setItem('mz_favorites', JSON.stringify(next)); } catch {}
      return next;
    });
  }

  if (!mounted) return null;

  return (
    <div className="platform-container" style={{ minHeight: '100svh', background: 'var(--mz-snow)', paddingTop: '120px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(16px, 5vw, 48px)' }}>

        <nav style={{ marginBottom: '40px' }}>
          <Link href="/estoque" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--mz-slate)', textDecoration: 'none' }}>
            <HugeiconsIcon icon={ArrowLeft02Icon} size={14} /> Voltar ao estoque
          </Link>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '48px' }}>
          <div style={{ padding: '10px', background: 'rgba(225,29,72,0.08)', borderRadius: '14px' }}>
            <Heart size={24} style={{ color: '#e11d48' }} fill="#e11d48" />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, letterSpacing: '-0.02em', margin: 0, color: 'var(--mz-ink)' }}>
              Seus favoritos
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-dim)', fontWeight: 500, margin: '4px 0 0' }}>
              {items.length} {items.length === 1 ? 'veículo salvo' : 'veículos salvos'}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <Heart size={48} style={{ color: 'var(--mz-ash)', margin: '0 auto 20px' }} />
            <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--mz-ink)', marginBottom: '8px' }}>
              Nenhum favorito ainda
            </p>
            <p style={{ fontSize: '15px', color: 'var(--text-dim)', marginBottom: '32px' }}>
              Clique no coração em qualquer card para salvar veículos aqui.
            </p>
            <Link href="/estoque" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', background: 'var(--mz-royal)', color: 'white', borderRadius: '14px', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
              Ver estoque completo
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '24px' }}>
            {items.map(v => (
              <div key={v.id} style={{ background: 'white', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden', position: 'relative' }}>
                <Link href={`/veiculo/${v.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                  <div style={{ aspectRatio: '16/10', position: 'relative', background: 'var(--mz-ash)' }}>
                    {v.image ? (
                      <Image src={v.image} alt={`${v.brand} ${v.model}`} fill style={{ objectFit: 'cover' }} sizes="(max-width: 640px) 100vw, 33vw" />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mz-slate-dim)', fontSize: '12px', fontWeight: 600 }}>
                        Sem imagem
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '20px' }}>
                    <p style={{ fontSize: '10px', fontWeight: 800, color: 'var(--mz-royal)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>{v.brand}</p>
                    <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--mz-ink)', letterSpacing: '-0.03em', marginBottom: '2px' }}>{v.model}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '12px' }}>{v.year}</p>
                    <p style={{ fontSize: '20px', fontWeight: 900, color: 'var(--mz-royal)', letterSpacing: '-0.02em' }}>{formatCurrency(v.price)}</p>
                  </div>
                </Link>
                <button
                  onClick={() => remove(v.id)}
                  aria-label="Remover favorito"
                  style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--mz-slate)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
