'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function VehicleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Motorz] Vehicle page error:', error.message);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        padding: '24px',
        background: 'var(--mz-snow, #f8fafc)',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(18,67,178,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
        }}
      >
        🔄
      </div>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: '8px',
            color: 'var(--mz-ink, #0f172a)',
          }}
        >
          Carregando detalhes...
        </h2>
        <p style={{ color: 'var(--text-dim, #64748b)', fontSize: '15px', lineHeight: 1.6 }}>
          Servidor reconectando. Tente novamente ou volte ao estoque.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{
            background: 'var(--mz-royal, #1243b2)',
            color: 'white',
            border: 'none',
            borderRadius: '14px',
            padding: '14px 36px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Tentar novamente
        </button>
        <Link
          href="/"
          style={{
            background: 'transparent',
            color: 'var(--mz-royal, #1243b2)',
            border: '1px solid var(--mz-royal, #1243b2)',
            borderRadius: '14px',
            padding: '14px 36px',
            fontSize: '15px',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Voltar ao estoque
        </Link>
      </div>
    </div>
  );
}
